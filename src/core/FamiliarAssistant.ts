import { Launcher } from '../components/launcher/Launcher'
import { MessageList } from '../components/messages/MessageList'
import { Panel } from '../components/panel/Panel'
import { Suggestions, type SuggestionItem } from '../components/suggestions/Suggestions'
import { FamiliarMascot } from '../mascot/FamiliarMascot'
import { HttpTransport } from '../transport/HttpTransport'
import type { Transport } from '../transport/types'
import { resolveConfig } from './config'
import {
  AssistantTransportError,
  type FamiliarAssistantConfig,
  type FamiliarMascotPreset,
  type FamiliarSource,
  type FamiliarTheme,
  type ConversationMessage,
  type ResolvedFamiliarAssistantConfig,
} from './types'

const CHANGE_MASCOT_LABEL = 'Change mascot'

/**
 * Entry point for the embeddable assistant widget. Renders the launcher,
 * mascot, and panel, and delegates all AI/RAG work to a Transport — either
 * the built-in HttpTransport (via `endpoint`) or a consumer-supplied
 * `transport` implementation.
 */
export class FamiliarAssistant {
  private readonly config: ResolvedFamiliarAssistantConfig
  private readonly transport: Transport
  private readonly root: HTMLElement
  private readonly launcherMascot: FamiliarMascot
  private readonly headerMascot: FamiliarMascot
  private readonly launcher: Launcher
  private readonly panel: Panel
  private readonly messageList: MessageList
  private readonly suggestions: Suggestions

  private conversation: ConversationMessage[] = []
  private currentMascot: FamiliarMascotPreset
  private open = false
  private pendingRequest: AbortController | null = null

  constructor(config: FamiliarAssistantConfig) {
    this.config = resolveConfig(config)
    this.currentMascot = this.config.mascot
    this.transport =
      this.config.transport ??
      new HttpTransport({ endpoint: this.config.endpoint as string, headers: this.config.headers })

    this.launcherMascot = new FamiliarMascot({
      preset: this.config.mascot,
      assets: this.config.mascotAssets,
      size: 70,
    })
    this.launcher = new Launcher({
      label: this.config.title,
      tooltip: this.config.title,
      mascot: this.launcherMascot,
      // The gold accent ring was designed around Clip's silhouette; other presets sit on their own.
      showRing: this.config.mascot === 'Clip',
      onToggle: () => this.toggle(),
    })

    this.headerMascot = new FamiliarMascot({
      preset: this.config.mascot,
      assets: this.config.mascotAssets,
      size: 44,
    })
    this.headerMascot.setState('open')

    this.messageList = new MessageList()

    const suggestionItems: SuggestionItem[] = this.config.suggestions.map((suggestion) => ({
      label: suggestion,
      onSelect: () => this.ask(suggestion),
    }))
    if (this.config.mascotPicker) {
      suggestionItems.push({ label: CHANGE_MASCOT_LABEL, onSelect: () => this.showMascotPicker() })
    }

    this.suggestions = new Suggestions({ items: suggestionItems })

    this.panel = new Panel({
      title: this.config.title,
      subtitle: this.config.subtitle,
      greeting: this.config.greeting,
      disclosure: this.config.disclosure,
      hasSuggestions: suggestionItems.length > 0,
      mascot: this.headerMascot,
      currentMascot: this.currentMascot,
      messageList: this.messageList,
      suggestions: this.suggestions,
      onClose: () => this.close(),
      onReset: () => this.reset(),
      onSubmit: (question) => this.ask(question),
      onSelectMascot: (preset) => this.setMascot(preset),
    })
    this.panel.setHasConversation(false)

    const launcherLayer = document.createElement('div')
    launcherLayer.className = 'familiar-assistant__launcher-layer'
    launcherLayer.appendChild(this.launcher.element)

    this.root = document.createElement('div')
    this.root.className = 'familiar-assistant'
    this.root.setAttribute('data-familiar-position', this.config.position)
    this.root.setAttribute('data-familiar-theme', this.config.theme)
    this.root.setAttribute('data-familiar-open', 'false')
    this.root.append(launcherLayer, this.panel.element)

    const container = this.config.container ?? document.body
    container.appendChild(this.root)

    if (this.config.openOnLoad) {
      this.openPanel()
    }
  }

  /** Opens the panel. */
  openPanel(): void {
    if (this.open) return
    this.open = true
    this.root.setAttribute('data-familiar-open', 'true')
    this.panel.open()
    this.launcher.setExpanded(true)
    this.panel.focusOnOpen()
  }

  /** Closes the panel and restores focus to the launcher. */
  close(): void {
    if (!this.open) return
    this.open = false
    this.root.setAttribute('data-familiar-open', 'false')
    this.panel.close()
    this.launcher.setExpanded(false)
    this.launcher.focus()
  }

  toggle(): void {
    if (this.open) {
      this.close()
    } else {
      this.openPanel()
    }
  }

  isOpen(): boolean {
    return this.open
  }

  /** Clears the conversation, returning to the intro/suggestions view. */
  reset(): void {
    this.pendingRequest?.abort()
    this.pendingRequest = null
    this.conversation = []
    this.messageList.reset()
    this.panel.setHasConversation(false)
    this.launcherMascot.setState('idle')
    this.headerMascot.setState('open')
  }

  setTheme(theme: FamiliarTheme): void {
    this.root.setAttribute('data-familiar-theme', theme)
  }

  /** Switches the launcher and panel mascot to a different built-in preset, live. */
  setMascot(preset: FamiliarMascotPreset): void {
    if (this.currentMascot === preset) return
    this.currentMascot = preset
    this.launcherMascot.setPreset(preset)
    this.headerMascot.setPreset(preset)
    // The gold accent ring was designed around Clip's silhouette; other presets sit on their own.
    this.launcher.setShowRing(preset === 'Clip')
    this.panel.setCurrentMascot(preset)
  }

  getMascot(): FamiliarMascotPreset {
    return this.currentMascot
  }

  /**
   * Shows the built-in mascot picker as an assistant reply — a local UI
   * affordance, not sent to the backend transport or added to conversation
   * history sent with future requests.
   */
  private showMascotPicker(): void {
    this.panel.setHasConversation(true)
    this.messageList.addMessage({ role: 'user', content: CHANGE_MASCOT_LABEL })
    this.messageList.addMascotPicker(this.currentMascot, (preset) => {
      this.setMascot(preset)
      this.close()
    })
    this.panel.announce('Choose a mascot.')
  }

  /** Sends a question through the configured transport and renders the result. */
  async ask(question: string): Promise<void> {
    const trimmed = question.trim()
    if (!trimmed) return

    this.pendingRequest?.abort()
    const controller = new AbortController()
    this.pendingRequest = controller

    const userMessage: ConversationMessage = { role: 'user', content: trimmed }
    this.conversation.push(userMessage)
    this.panel.setHasConversation(true)
    this.messageList.addMessage(userMessage)

    this.panel.setBusy(true)
    this.messageList.setThinking(true)
    this.panel.announce('Clip is thinking…')
    this.headerMascot.setState('thinking')

    try {
      const history = this.config.sendHistory
        ? this.conversation.slice(0, -1).slice(-this.config.historyLimit)
        : []

      const response = await this.transport.send(
        { question: trimmed, conversation: history },
        controller.signal
      )

      if (controller.signal.aborted) return

      const assistantMessage: ConversationMessage = { role: 'assistant', content: response.answer }
      this.conversation.push(assistantMessage)
      this.messageList.setThinking(false)
      this.messageList.addMessage(assistantMessage, response.sources as FamiliarSource[] | undefined)
      this.panel.announce(response.answer)
      this.headerMascot.setState('open')
    } catch (error) {
      if (controller.signal.aborted) return
      this.messageList.setThinking(false)
      this.handleError(error)
      this.headerMascot.setState('error')
    } finally {
      if (!controller.signal.aborted) {
        this.panel.setBusy(false)
        this.pendingRequest = null
      }
    }
  }

  /** Removes the widget from the DOM and cancels any in-flight request. */
  destroy(): void {
    this.pendingRequest?.abort()
    this.launcherMascot.destroy()
    this.headerMascot.destroy()
    this.root.remove()
  }

  private handleError(error: unknown): void {
    const message =
      error instanceof AssistantTransportError
        ? error.message
        : error instanceof Error
          ? error.message || 'Something went wrong. Please try again.'
          : 'Something went wrong. Please try again.'
    const kind = error instanceof AssistantTransportError ? error.kind : undefined

    this.messageList.showNotice(message, kind)
    this.panel.announce(message)
  }
}
