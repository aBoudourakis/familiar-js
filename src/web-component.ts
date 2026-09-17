import { FamiliarAssistant } from './core/FamiliarAssistant'
import type { FamiliarMascotPreset, FamiliarPosition, FamiliarTheme } from './core/types'

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
 * `<familiar-assistant>` custom element wrapping FamiliarAssistant for markup-only usage.
 * Only exposes the subset of config expressible as HTML attributes; for full
 * control (custom transport, mascot assets, etc.) use the `FamiliarAssistant` class directly.
 */
export class FamiliarAssistantElement extends HTMLElement {
  static get observedAttributes(): readonly string[] {
    return OBSERVED_ATTRIBUTES
  }

  private instance: FamiliarAssistant | null = null

  connectedCallback(): void {
    const endpoint = this.getAttribute('endpoint')
    if (!endpoint) {
      throw new Error('<familiar-assistant> requires an `endpoint` attribute.')
    }

    const suggestionsAttr = this.getAttribute('suggestions')

    this.instance = new FamiliarAssistant({
      endpoint,
      title: this.getAttribute('title') ?? undefined,
      position: (this.getAttribute('position') as FamiliarPosition | null) ?? undefined,
      greeting: this.getAttribute('greeting') ?? undefined,
      theme: (this.getAttribute('theme') as FamiliarTheme | null) ?? undefined,
      mascot: (this.getAttribute('mascot') as FamiliarMascotPreset | null) ?? undefined,
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

export function registerFamiliarAssistantElement(tagName = 'familiar-assistant'): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, FamiliarAssistantElement)
  }
}
