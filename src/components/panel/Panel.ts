import type { FamiliarMascotPreset } from '../../core/types'
import { FamiliarMascot } from '../../mascot/FamiliarMascot'
import { chevronDownIcon, closeIcon, sendIcon } from '../icons'
import { renderMascotPicker } from '../messages/MascotPicker'
import { MessageList } from '../messages/MessageList'
import { Suggestions } from '../suggestions/Suggestions'

export interface PanelOptions {
  title: string
  subtitle?: string
  greeting?: string
  disclosure?: string
  hasSuggestions: boolean
  mascot: FamiliarMascot
  currentMascot: FamiliarMascotPreset
  messageList: MessageList
  suggestions: Suggestions
  onClose: () => void
  onReset: () => void
  onSubmit: (question: string) => void
  /** Switches the mascot live from the header dropdown, without closing the panel. */
  onSelectMascot: (preset: FamiliarMascotPreset) => void
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * The opened floating panel: header, intro, suggestions/messages, and
 * composer. A non-modal dialog — focus is kept inside while open, and
 * Escape/close are handled by the caller (which also restores focus to the
 * launcher).
 */
export class Panel {
  readonly element: HTMLDivElement

  private readonly closeButton: HTMLButtonElement
  private readonly clearButton: HTMLButtonElement
  private readonly introEl: HTMLParagraphElement
  private readonly liveRegion: HTMLDivElement
  private readonly textarea: HTMLTextAreaElement
  private readonly sendButton: HTMLButtonElement
  private readonly mascotTrigger: HTMLButtonElement
  private readonly mascotDropdown: HTMLDivElement
  private readonly onClose: () => void
  private readonly onSelectMascot: (preset: FamiliarMascotPreset) => void
  private readonly hasGreeting: boolean
  private readonly hasSuggestions: boolean
  private readonly suggestions: Suggestions
  private readonly messageList: MessageList
  private currentMascot: FamiliarMascotPreset
  private mascotDropdownOpen = false

  // Capture-phase so this runs before a click on a picker card reaches that
  // card's own listener — closing the dropdown here must not swallow the pick.
  private readonly handleOutsideClick = (event: MouseEvent): void => {
    if (
      event.target instanceof Node &&
      (this.mascotTrigger.contains(event.target) || this.mascotDropdown.contains(event.target))
    ) {
      return
    }
    this.closeMascotDropdown()
  }

  constructor(options: PanelOptions) {
    this.onClose = options.onClose
    this.onSelectMascot = options.onSelectMascot
    this.currentMascot = options.currentMascot
    this.hasGreeting = Boolean(options.greeting)
    this.hasSuggestions = options.hasSuggestions
    this.suggestions = options.suggestions
    this.messageList = options.messageList

    this.element = document.createElement('div')
    this.element.className = 'familiar-panel'
    this.element.setAttribute('role', 'dialog')
    this.element.hidden = true

    const titleId = 'familiar-panel-title-' + Math.random().toString(36).slice(2, 9)
    this.element.setAttribute('aria-labelledby', titleId)

    // Header
    const header = document.createElement('div')
    header.className = 'familiar-panel__header'

    const headerText = document.createElement('div')
    headerText.className = 'familiar-panel__header-text'

    const titleEl = document.createElement('h2')
    titleEl.className = 'familiar-panel__title'
    titleEl.id = titleId
    titleEl.textContent = options.title
    headerText.appendChild(titleEl)

    if (options.subtitle) {
      const subtitleEl = document.createElement('p')
      subtitleEl.className = 'familiar-panel__subtitle'
      subtitleEl.textContent = options.subtitle
      headerText.appendChild(subtitleEl)
    }

    this.closeButton = document.createElement('button')
    this.closeButton.type = 'button'
    this.closeButton.className = 'familiar-panel__close'
    this.closeButton.setAttribute('aria-label', 'Close assistant')
    this.closeButton.appendChild(closeIcon())
    this.closeButton.addEventListener('click', () => this.onClose())

    this.mascotTrigger = document.createElement('button')
    this.mascotTrigger.type = 'button'
    this.mascotTrigger.className = 'familiar-panel__mascot-trigger'
    this.mascotTrigger.setAttribute('aria-haspopup', 'true')
    this.mascotTrigger.setAttribute('aria-expanded', 'false')
    this.mascotTrigger.setAttribute('aria-label', 'Change mascot')
    this.mascotTrigger.append(options.mascot.element, chevronDownIcon())
    this.mascotTrigger.addEventListener('click', () => this.toggleMascotDropdown())

    this.mascotDropdown = document.createElement('div')
    this.mascotDropdown.className = 'familiar-mascot-dropdown'
    this.mascotDropdown.hidden = true

    const mascotSwitcher = document.createElement('div')
    mascotSwitcher.className = 'familiar-panel__mascot-switcher'
    mascotSwitcher.append(this.mascotTrigger, this.mascotDropdown)

    header.append(mascotSwitcher, headerText, this.closeButton)

    // Intro
    this.introEl = document.createElement('p')
    this.introEl.className = 'familiar-panel__intro'
    this.introEl.textContent = options.greeting ?? ''
    this.introEl.hidden = !options.greeting

    const divider = document.createElement('div')
    divider.className = 'familiar-panel__divider'

    // Body
    const body = document.createElement('div')
    body.className = 'familiar-panel__body'
    body.append(options.suggestions.element, options.messageList.element)

    // Live region (screen-reader status announcements, kept separate from the visual log)
    this.liveRegion = document.createElement('div')
    this.liveRegion.className = 'familiar-visually-hidden'
    this.liveRegion.setAttribute('aria-live', 'polite')
    this.liveRegion.setAttribute('aria-atomic', 'true')

    // Composer
    const inputRow = document.createElement('form')
    inputRow.className = 'familiar-panel__input-row'
    inputRow.addEventListener('submit', (event) => {
      event.preventDefault()
      this.submit(options.onSubmit)
    })

    this.textarea = document.createElement('textarea')
    this.textarea.className = 'familiar-panel__input'
    this.textarea.placeholder = 'Ask a question…'
    this.textarea.rows = 1
    this.textarea.setAttribute('aria-label', 'Ask a question')
    this.textarea.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        this.submit(options.onSubmit)
      }
    })

    this.sendButton = document.createElement('button')
    this.sendButton.type = 'submit'
    this.sendButton.className = 'familiar-panel__send'
    this.sendButton.setAttribute('aria-label', 'Send question')
    this.sendButton.appendChild(sendIcon())

    inputRow.append(this.textarea, this.sendButton)

    // Footer
    const footer = document.createElement('div')
    footer.className = 'familiar-panel__footer'

    const disclosure = document.createElement('p')
    disclosure.className = 'familiar-panel__disclosure'
    disclosure.textContent = options.disclosure ?? ''
    disclosure.hidden = !options.disclosure

    this.clearButton = document.createElement('button')
    this.clearButton.type = 'button'
    this.clearButton.className = 'familiar-panel__clear'
    this.clearButton.textContent = 'Clear conversation'
    this.clearButton.hidden = true
    this.clearButton.addEventListener('click', () => options.onReset())

    footer.append(disclosure, this.clearButton)

    this.element.append(header, this.introEl, divider, body, this.liveRegion, inputRow, footer)
    this.element.addEventListener('keydown', (event) => this.handleKeydown(event))
  }

  open(): void {
    this.element.hidden = false
  }

  close(): void {
    this.element.hidden = true
    this.closeMascotDropdown()
  }

  /** Focuses the close button — the top of the dialog — rather than jumping straight to the input. */
  focusOnOpen(): void {
    this.closeButton.focus()
  }

  setBusy(busy: boolean): void {
    this.textarea.disabled = busy
    this.sendButton.disabled = busy
  }

  /** Keeps the header dropdown's active-state highlight in sync when the mascot changes elsewhere. */
  setCurrentMascot(preset: FamiliarMascotPreset): void {
    this.currentMascot = preset
  }

  /** Toggles between the pre-conversation intro/suggestions and the message transcript. */
  setHasConversation(hasConversation: boolean): void {
    this.introEl.hidden = hasConversation || !this.hasGreeting
    this.clearButton.hidden = !hasConversation
    this.suggestions.setVisible(!hasConversation && this.hasSuggestions)
    this.messageList.setVisible(hasConversation)
  }

  announce(text: string): void {
    this.liveRegion.textContent = text
  }

  private submit(onSubmit: (question: string) => void): void {
    const value = this.textarea.value.trim()
    if (!value || this.textarea.disabled) return
    this.textarea.value = ''
    onSubmit(value)
  }

  private toggleMascotDropdown(): void {
    if (this.mascotDropdownOpen) this.closeMascotDropdown()
    else this.openMascotDropdown()
  }

  /**
   * Quick mascot switcher anchored to the header portrait — deliberately
   * separate from the "Change mascot" suggestion reply: picking here swaps
   * the mascot live without closing the panel or touching the conversation.
   */
  private openMascotDropdown(): void {
    if (this.mascotDropdownOpen) return
    this.mascotDropdownOpen = true
    this.mascotDropdown.replaceChildren(
      renderMascotPicker({
        current: this.currentMascot,
        onSelect: (preset) => {
          this.onSelectMascot(preset)
          this.closeMascotDropdown()
          this.mascotTrigger.focus()
        },
      })
    )
    this.mascotDropdown.hidden = false
    this.mascotTrigger.setAttribute('aria-expanded', 'true')
    document.addEventListener('click', this.handleOutsideClick, true)
  }

  private closeMascotDropdown(): void {
    if (!this.mascotDropdownOpen) return
    this.mascotDropdownOpen = false
    this.mascotDropdown.hidden = true
    this.mascotDropdown.replaceChildren()
    this.mascotTrigger.setAttribute('aria-expanded', 'false')
    document.removeEventListener('click', this.handleOutsideClick, true)
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault()
      if (this.mascotDropdownOpen) {
        this.closeMascotDropdown()
        this.mascotTrigger.focus()
      } else {
        this.onClose()
      }
      return
    }

    if (event.key !== 'Tab') return

    const focusable = Array.from(this.element.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (el) => el.offsetParent !== null
    )
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement

    if (event.shiftKey && active === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }
}
