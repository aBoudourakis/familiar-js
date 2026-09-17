import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { FamiliarAssistant } from '../src/core/FamiliarAssistant'
import { AssistantTransportError, type AssistantRequest, type AssistantResponse } from '../src/core/types'
import type { Transport } from '../src/transport/types'

class FakeTransport implements Transport {
  calls: AssistantRequest[] = []
  response: AssistantResponse = { answer: 'A fake answer.' }
  error: Error | null = null

  async send(request: AssistantRequest): Promise<AssistantResponse> {
    this.calls.push(request)
    if (this.error) throw this.error
    return this.response
  }
}

function getLauncher(): HTMLButtonElement {
  return document.querySelector('.familiar-launcher') as HTMLButtonElement
}

function getPanel(): HTMLElement {
  return document.querySelector('.familiar-panel') as HTMLElement
}

function getCloseButton(): HTMLButtonElement {
  return document.querySelector('.familiar-panel__close') as HTMLButtonElement
}

function messageRowTexts(): string[] {
  return Array.from(document.querySelectorAll('.familiar-message-row')).map((el) => el.textContent?.trim() ?? '')
}

describe('FamiliarAssistant', () => {
  let transport: FakeTransport

  beforeEach(() => {
    transport = new FakeTransport()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('mounts a closed panel and a launcher button', () => {
    new FamiliarAssistant({ transport, title: 'Ask Clip' })

    expect(getLauncher()).toBeTruthy()
    expect(getPanel().hidden).toBe(true)
    expect(getLauncher().getAttribute('aria-expanded')).toBe('false')
  })

  it('opens the panel when the launcher is clicked and focuses the close button', () => {
    new FamiliarAssistant({ transport })

    getLauncher().click()

    expect(getPanel().hidden).toBe(false)
    expect(getLauncher().getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(getCloseButton())
  })

  it('closes on Escape and restores focus to the launcher', () => {
    new FamiliarAssistant({ transport })

    getLauncher().click()
    expect(getPanel().hidden).toBe(false)

    getPanel().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

    expect(getPanel().hidden).toBe(true)
    expect(document.activeElement).toBe(getLauncher())
  })

  it('sends a question through the transport and renders the answer', async () => {
    transport.response = { answer: 'Here you go.', sources: [{ title: 'Doc', url: 'https://example.com/doc' }] }
    const assistant = new FamiliarAssistant({ transport })

    await assistant.ask('What is familiar-js?')

    expect(transport.calls).toHaveLength(1)
    expect(transport.calls[0].question).toBe('What is familiar-js?')

    const texts = messageRowTexts()
    expect(texts.some((text) => text.includes('What is familiar-js?'))).toBe(true)
    expect(texts.some((text) => text.includes('Here you go.'))).toBe(true)

    const sourceLink = document.querySelector('.familiar-sources__link')
    expect(sourceLink?.getAttribute('href')).toBe('https://example.com/doc')
  })

  it('hides suggestions and shows the transcript once a conversation starts', async () => {
    const assistant = new FamiliarAssistant({ transport, suggestions: ['Try me'] })

    expect(document.querySelector('.familiar-suggestions')?.hasAttribute('hidden')).toBe(false)

    await assistant.ask('First question')

    expect(document.querySelector('.familiar-suggestions')?.hasAttribute('hidden')).toBe(true)
    expect(document.querySelector('.familiar-messages')?.hasAttribute('hidden')).toBe(false)
  })

  it('includes prior turns as conversation history on the next request', async () => {
    const assistant = new FamiliarAssistant({ transport })

    await assistant.ask('First question')
    await assistant.ask('Second question')

    expect(transport.calls).toHaveLength(2)
    expect(transport.calls[1].conversation).toEqual([
      { role: 'user', content: 'First question' },
      { role: 'assistant', content: 'A fake answer.' },
    ])
  })

  it('tags a rate-limit failure distinctly from a generic error', async () => {
    transport.error = new AssistantTransportError('Slow down.', 'rate-limit')
    const assistant = new FamiliarAssistant({ transport })

    await assistant.ask('Too fast')

    const notice = document.querySelector('.familiar-message--assistant[data-tone="notice"]')
    expect(notice?.textContent).toContain('Slow down.')
    expect(notice?.getAttribute('data-notice-kind')).toBe('rate-limit')
  })

  it('renders a generic notice for unexpected failures', async () => {
    transport.error = new Error('boom')
    const assistant = new FamiliarAssistant({ transport })

    await assistant.ask('Break it')

    const notice = document.querySelector('.familiar-message--assistant[data-tone="notice"]')
    expect(notice?.textContent).toContain('boom')
    expect(notice?.hasAttribute('data-notice-kind')).toBe(false)
  })

  it('switches the header mascot to its "error" illustration on failure, and back to "open" on reset', async () => {
    transport.error = new Error('boom')
    const assistant = new FamiliarAssistant({ transport })

    const headerMascot = document.querySelector('.familiar-panel__header .familiar-mascot') as HTMLElement
    await assistant.ask('Break it')

    expect(headerMascot.getAttribute('data-state')).toBe('error')
    const headerImg = headerMascot.querySelector('img') as HTMLImageElement
    expect(headerImg.src).toContain('/mascot/Clip/error.webp')

    assistant.reset()
    expect(headerMascot.getAttribute('data-state')).toBe('open')
  })

  it('reset() clears the conversation and restores the intro view', async () => {
    const assistant = new FamiliarAssistant({ transport, greeting: 'Hello there.' })

    await assistant.ask('A question')
    expect(document.querySelectorAll('.familiar-message-row').length).toBeGreaterThan(0)

    assistant.reset()

    expect(document.querySelectorAll('.familiar-message-row')).toHaveLength(0)
    expect(document.querySelector('.familiar-panel__intro')?.hasAttribute('hidden')).toBe(false)
    expect(document.querySelector('.familiar-panel__intro')?.textContent).toBe('Hello there.')
  })

  it('uses the "Lens" mascot preset for the launcher and panel header when configured', () => {
    new FamiliarAssistant({ transport, mascot: 'Lens' })

    const launcherImg = document.querySelector('.familiar-launcher .familiar-mascot__image') as HTMLImageElement
    expect(launcherImg.src).toContain('/mascot/Lens/idle.webp')

    const headerImg = document.querySelector('.familiar-panel__header .familiar-mascot__image') as HTMLImageElement
    expect(headerImg.src).toContain('/mascot/Lens/focused.webp')
  })

  it('only shows the decorative accent ring for the "Clip" mascot preset', () => {
    new FamiliarAssistant({ transport, mascot: 'Clip' })
    expect(document.querySelector('.familiar-launcher__ring')?.hasAttribute('hidden')).toBe(false)
    document.body.innerHTML = ''

    new FamiliarAssistant({ transport, mascot: 'Lens' })
    expect(document.querySelector('.familiar-launcher__ring')?.hasAttribute('hidden')).toBe(true)
  })

  it('offers a built-in "Change mascot" suggestion by default', () => {
    new FamiliarAssistant({ transport })

    const labels = Array.from(document.querySelectorAll('.familiar-suggestions__chip')).map((el) => el.textContent)
    expect(labels).toContain('Change mascot')
  })

  it('omits the "Change mascot" suggestion when mascotPicker is disabled', () => {
    new FamiliarAssistant({ transport, mascotPicker: false })

    const labels = Array.from(document.querySelectorAll('.familiar-suggestions__chip')).map((el) => el.textContent)
    expect(labels).not.toContain('Change mascot')
  })

  it('shows a mascot picker reply — one thumbnail per preset — without contacting the transport', () => {
    new FamiliarAssistant({ transport })

    const changeMascotChip = Array.from(document.querySelectorAll('.familiar-suggestions__chip')).find(
      (el) => el.textContent === 'Change mascot'
    ) as HTMLButtonElement
    changeMascotChip.click()

    expect(transport.calls).toHaveLength(0)
    const items = document.querySelectorAll('.familiar-mascot-picker__item')
    expect(items).toHaveLength(4)
    expect(document.querySelector('.familiar-mascot-picker__item[data-active="true"]')?.getAttribute('aria-label')).toBe(
      'Clip (current mascot)'
    )
  })

  it('setMascot() switches the launcher/header artwork and the ring live; picking a picker thumbnail does the same', () => {
    const assistant = new FamiliarAssistant({ transport })

    assistant.setMascot('Wizard')

    expect(assistant.getMascot()).toBe('Wizard')
    const launcherImg = document.querySelector('.familiar-launcher .familiar-mascot__image') as HTMLImageElement
    expect(launcherImg.src).toContain('/mascot/Wizard/idle.webp')
    expect(document.querySelector('.familiar-launcher__ring')?.hasAttribute('hidden')).toBe(true)

    // Picking a thumbnail from the picker reply does the same thing.
    const changeMascotChip = Array.from(document.querySelectorAll('.familiar-suggestions__chip')).find(
      (el) => el.textContent === 'Change mascot'
    ) as HTMLButtonElement
    changeMascotChip.click()
    const seerItem = Array.from(document.querySelectorAll('.familiar-mascot-picker__item')).find((el) =>
      el.getAttribute('aria-label')?.includes('Seer')
    ) as HTMLButtonElement
    seerItem.click()

    expect(assistant.getMascot()).toBe('Seer')
    expect(launcherImg.src).toContain('/mascot/Seer/idle.webp')
  })

  it('destroy() removes the widget from the DOM', () => {
    const assistant = new FamiliarAssistant({ transport })
    expect(document.querySelector('.familiar-assistant')).toBeTruthy()

    assistant.destroy()

    expect(document.querySelector('.familiar-assistant')).toBeNull()
  })
})
