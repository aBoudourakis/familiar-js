import { ClipAssistant } from './core/ClipAssistant'
import type { ClipMascotPreset, ClipPosition, ClipTheme } from './core/types'

const OBSERVED_ATTRIBUTES = [
  'endpoint',
  'title',
  'position',
  'greeting',
  'theme',
  'mascot',
  'suggestions',
] as const

/**
 * `<clip-assistant>` custom element wrapping ClipAssistant for markup-only usage.
 * Only exposes the subset of config expressible as HTML attributes; for full
 * control (custom transport, mascot assets, etc.) use the `ClipAssistant` class directly.
 */
export class ClipAssistantElement extends HTMLElement {
  static get observedAttributes(): readonly string[] {
    return OBSERVED_ATTRIBUTES
  }

  private instance: ClipAssistant | null = null

  connectedCallback(): void {
    const endpoint = this.getAttribute('endpoint')
    if (!endpoint) {
      throw new Error('<clip-assistant> requires an `endpoint` attribute.')
    }

    const suggestionsAttr = this.getAttribute('suggestions')

    this.instance = new ClipAssistant({
      endpoint,
      title: this.getAttribute('title') ?? undefined,
      position: (this.getAttribute('position') as ClipPosition | null) ?? undefined,
      greeting: this.getAttribute('greeting') ?? undefined,
      theme: (this.getAttribute('theme') as ClipTheme | null) ?? undefined,
      mascot: (this.getAttribute('mascot') as ClipMascotPreset | null) ?? undefined,
      suggestions: suggestionsAttr
        ? suggestionsAttr
            .split('|')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      container: this,
    })
  }

  disconnectedCallback(): void {
    this.instance?.destroy()
    this.instance = null
  }
}

export function registerClipAssistantElement(tagName = 'clip-assistant'): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, ClipAssistantElement)
  }
}
