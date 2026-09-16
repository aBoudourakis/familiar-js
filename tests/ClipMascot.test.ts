import { afterEach, describe, expect, it } from 'vitest'
import { ClipMascot } from '../src/mascot/ClipMascot'

describe('ClipMascot', () => {
  let mascot: ClipMascot | null = null

  afterEach(() => {
    mascot?.destroy()
    mascot = null
  })

  it('renders an <img> defaulting to the built-in idle illustration', () => {
    mascot = new ClipMascot()

    expect(mascot.element.getAttribute('data-state')).toBe('idle')
    const img = mascot.element.querySelector('img') as HTMLImageElement
    expect(img).toBeTruthy()
    expect(img.src).toContain('Clip_idle')
  })

  it('is decorative (aria-hidden) since the launcher/panel supply their own accessible name', () => {
    mascot = new ClipMascot()

    expect(mascot.element.getAttribute('aria-hidden')).toBe('true')
  })

  it('updates data-state, getState(), and the image src when transitioning states', () => {
    mascot = new ClipMascot()

    mascot.setState('thinking')

    expect(mascot.getState()).toBe('thinking')
    expect(mascot.element.getAttribute('data-state')).toBe('thinking')
    const img = mascot.element.querySelector('img') as HTMLImageElement
    expect(img.src).toContain('Clip_thinking')
  })

  it('swaps in a custom asset per state, falling back to the built-in art for unset states', () => {
    mascot = new ClipMascot({
      assets: { idle: '/idle.png', thinking: '/thinking.png' },
    })

    const img = mascot.element.querySelector('img') as HTMLImageElement
    expect(img.src).toContain('/idle.png')

    mascot.setState('thinking')
    expect(img.src).toContain('/thinking.png')

    // 'open' has no override — falls back to the built-in illustration.
    mascot.setState('open')
    expect(img.src).toContain('Clip_focused')
  })
})
