import type { ClipMascotPreset, ClipSource, ConversationMessage } from '../../core/types'
import { errorIcon } from '../icons'
import { renderMascotPicker } from './MascotPicker'
import { renderSourceList } from '../sources/SourceList'

export type MessageTone = 'default' | 'muted' | 'notice'

/**
 * The scrollable transcript. Assistant replies are kept compact — a plain
 * block with a thin accent bar, not a giant chat bubble — matching the rest
 * of an understated host UI; only the user's own turns get a filled bubble.
 */
export class MessageList {
  readonly element: HTMLDivElement

  private thinkingEl: HTMLElement | null = null

  constructor() {
    this.element = document.createElement('div')
    this.element.className = 'clip-messages'
    this.element.hidden = true
  }

  setVisible(visible: boolean): void {
    this.element.hidden = !visible
  }

  addMessage(message: ConversationMessage, sources?: ClipSource[]): void {
    const row = this.createRow(message.role, message.content, 'default')
    if (sources && sources.length > 0) {
      row.querySelector('.clip-message__content')?.appendChild(renderSourceList(sources))
    }
    this.element.appendChild(row)
    this.scrollToBottom()
  }

  setThinking(thinking: boolean): void {
    if (thinking && !this.thinkingEl) {
      const row = document.createElement('div')
      row.className = 'clip-message-row'
      row.setAttribute('data-role', 'assistant')

      const block = document.createElement('div')
      block.className = 'clip-message clip-message--assistant'
      block.setAttribute('data-tone', 'thinking')
      block.innerHTML = `
        <span class="clip-thinking-dots">
          <span></span><span></span><span></span>
        </span>
      `
      row.appendChild(block)
      this.thinkingEl = row
      this.element.appendChild(row)
      this.scrollToBottom()
    } else if (!thinking && this.thinkingEl) {
      this.thinkingEl.remove()
      this.thinkingEl = null
    }
  }

  /**
   * Renders an error/rate-limit/unavailable notice inline in the transcript.
   * Visually unified (a single "notice" tone) but tagged with `kind` — e.g.
   * `data-notice-kind="rate-limit"` — so consumers can target it in CSS if
   * they want a distinct treatment.
   */
  showNotice(message: string, kind?: string): void {
    const row = this.createRow('assistant', message, 'notice')
    if (kind) {
      row.querySelector('.clip-message--assistant')?.setAttribute('data-notice-kind', kind)
    }
    this.element.appendChild(row)
    this.scrollToBottom()
  }

  /** Renders the built-in mascot picker as an assistant reply — handled entirely on the client. */
  addMascotPicker(current: ClipMascotPreset, onSelect: (preset: ClipMascotPreset) => void): void {
    const row = this.createRow('assistant', 'Here are the built-in mascots — pick one:', 'default')
    row.querySelector('.clip-message__content')?.appendChild(renderMascotPicker({ current, onSelect }))
    this.element.appendChild(row)
    this.scrollToBottom()
  }

  reset(): void {
    this.element.innerHTML = ''
    this.thinkingEl = null
  }

  scrollToBottom(): void {
    this.element.scrollTop = this.element.scrollHeight
  }

  private createRow(role: ConversationMessage['role'], text: string, tone: MessageTone): HTMLDivElement {
    const row = document.createElement('div')
    row.className = 'clip-message-row'
    row.setAttribute('data-role', role)

    if (role === 'user') {
      const bubble = document.createElement('p')
      bubble.className = 'clip-message clip-message--user'
      bubble.textContent = text
      row.appendChild(bubble)
      return row
    }

    const block = document.createElement('div')
    block.className = 'clip-message clip-message--assistant'
    block.setAttribute('data-tone', tone)

    if (tone === 'notice') {
      block.appendChild(errorIcon())
    }

    const content = document.createElement('div')
    content.className = 'clip-message__content'
    const paragraph = document.createElement('p')
    paragraph.className = 'clip-message__text'
    paragraph.textContent = text
    content.appendChild(paragraph)
    block.appendChild(content)

    row.appendChild(block)
    return row
  }
}
