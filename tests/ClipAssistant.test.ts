import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ClipAssistant } from '../src/core/ClipAssistant'
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
  return document.querySelector('.clip-launcher') as HTMLButtonElement
}

function getPanel(): HTMLElement {
  return document.querySelector('.clip-panel') as HTMLElement
}

function getCloseButton(): HTMLButtonElement {
  return document.querySelector('.clip-panel__close') as HTMLButtonElement
}

function messageRowTexts(): string[] {
  return Array.from(document.querySelectorAll('.clip-message-row')).map((el) => el.textContent?.trim() ?? '')
}

describe('ClipAssistant', () => {
  let transport: FakeTransport

  beforeEach(() => {
    transport = new FakeTransport()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('mounts a closed panel and a launcher button', () => {
    new ClipAssistant({ transport, title: 'Ask Clip' })

    expect(getLauncher()).toBeTruthy()
    expect(getPanel().hidden).toBe(true)
    expect(getLauncher().getAttribute('aria-expanded')).toBe('false')
  })

  it('opens the panel when the launcher is clicked and focuses the close button', () => {
    new ClipAssistant({ transport })

    getLauncher().click()

    expect(getPanel().hidden).toBe(false)
    expect(getLauncher().getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(getCloseButton())
  })

  it('closes on Escape and restores focus to the launcher', () => {
    new ClipAssistant({ transport })

    getLauncher().click()
    expect(getPanel().hidden).toBe(false)

    getPanel().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

    expect(getPanel().hidden).toBe(true)
    expect(document.activeElement).toBe(getLauncher())
  })

  it('sends a question through the transport and renders the answer', async () => {
    transport.response = { answer: 'Here you go.', sources: [{ title: 'Doc', url: 'https://example.com/doc' }] }
    const assistant = new ClipAssistant({ transport })

    await assistant.ask('What is clip-js?')

    expect(transport.calls).toHaveLength(1)
    expect(transport.calls[0].question).toBe('What is clip-js?')

    const texts = messageRowTexts()
    expect(texts.some((text) => text.includes('What is clip-js?'))).toBe(true)
    expect(texts.some((text) => text.includes('Here you go.'))).toBe(true)

    const sourceLink = document.querySelector('.clip-sources__link')
    expect(sourceLink?.getAttribute('href')).toBe('https://example.com/doc')
  })

  it('hides suggestions and shows the transcript once a conversation starts', async () => {
    const assistant = new ClipAssistant({ transport, suggestions: ['Try me'] })

    expect(document.querySelector('.clip-suggestions')?.hasAttribute('hidden')).toBe(false)

    await assistant.ask('First question')

    expect(document.querySelector('.clip-suggestions')?.hasAttribute('hidden')).toBe(true)
    expect(document.querySelector('.clip-messages')?.hasAttribute('hidden')).toBe(false)
  })

  it('includes prior turns as conversation history on the next request', async () => {
    const assistant = new ClipAssistant({ transport })

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
    const assistant = new ClipAssistant({ transport })

    await assistant.ask('Too fast')

    const notice = document.querySelector('.clip-message--assistant[data-tone="notice"]')
    expect(notice?.textContent).toContain('Slow down.')
    expect(notice?.getAttribute('data-notice-kind')).toBe('rate-limit')
  })

  it('renders a generic notice for unexpected failures', async () => {
    transport.error = new Error('boom')
    const assistant = new ClipAssistant({ transport })

    await assistant.ask('Break it')

    const notice = document.querySelector('.clip-message--assistant[data-tone="notice"]')
    expect(notice?.textContent).toContain('boom')
    expect(notice?.hasAttribute('data-notice-kind')).toBe(false)
  })

  it('reset() clears the conversation and restores the intro view', async () => {
    const assistant = new ClipAssistant({ transport, greeting: 'Hello there.' })

    await assistant.ask('A question')
    expect(document.querySelectorAll('.clip-message-row').length).toBeGreaterThan(0)

    assistant.reset()

    expect(document.querySelectorAll('.clip-message-row')).toHaveLength(0)
    expect(document.querySelector('.clip-panel__intro')?.hasAttribute('hidden')).toBe(false)
    expect(document.querySelector('.clip-panel__intro')?.textContent).toBe('Hello there.')
  })

  it('uses the "lens" mascot preset for the launcher and panel header when configured', () => {
    new ClipAssistant({ transport, mascot: 'lens' })

    const launcherImg = document.querySelector('.clip-launcher .clip-mascot__image') as HTMLImageElement
    expect(launcherImg.src).toContain('/mascot/Lens/idle.webp')

    const headerImg = document.querySelector('.clip-panel__header .clip-mascot__image') as HTMLImageElement
    expect(headerImg.src).toContain('/mascot/Lens/focused.webp')
  })

  it('only shows the decorative accent ring for the "clip" mascot preset', () => {
    new ClipAssistant({ transport, mascot: 'clip' })
    expect(document.querySelector('.clip-launcher__ring')).toBeTruthy()
    document.body.innerHTML = ''

    new ClipAssistant({ transport, mascot: 'lens' })
    expect(document.querySelector('.clip-launcher__ring')).toBeNull()
  })

  it('destroy() removes the widget from the DOM', () => {
    const assistant = new ClipAssistant({ transport })
    expect(document.querySelector('.clip-assistant')).toBeTruthy()

    assistant.destroy()

    expect(document.querySelector('.clip-assistant')).toBeNull()
  })
})
