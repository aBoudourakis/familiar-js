import { afterEach, describe, expect, it } from 'vitest'
import { ClipMascot } from '../src/mascot/ClipMascot'

describe('ClipMascot', () => {
  let mascot: ClipMascot | null = null

  afterEach(() => {
    mascot?.destroy()
    mascot = null
  })

  it('renders an <img> defaulting to the built-in "clip" idle illustration', () => {
    mascot = new ClipMascot()

    expect(mascot.element.getAttribute('data-state')).toBe('idle')
    const img = mascot.element.querySelector('img') as HTMLImageElement
    expect(img).toBeTruthy()
    expect(img.src).toContain('/mascot/Clip/idle.webp')
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
    expect(img.src).toContain('/mascot/Clip/thinking.webp')
  })

  it('loads the "lens" preset\'s own artwork when selected', () => {
    mascot = new ClipMascot({ preset: 'lens' })

    const img = mascot.element.querySelector('img') as HTMLImageElement
    expect(img.src).toContain('/mascot/Lens/idle.webp')

    mascot.setState('open')
    expect(img.src).toContain('/mascot/Lens/focused.webp')
  })

  it('loads the "seeer" preset\'s own artwork when selected', () => {
    mascot = new ClipMascot({ preset: 'seeer' })

    const img = mascot.element.querySelector('img') as HTMLImageElement
    expect(img.src).toContain('/mascot/seeer/idle.webp')

    mascot.setState('open')
    expect(img.src).toContain('/mascot/seeer/focused.webp')
  })

  it('loads the "wizard" preset\'s own artwork when selected', () => {
    mascot = new ClipMascot({ preset: 'wizard' })

    const img = mascot.element.querySelector('img') as HTMLImageElement
    expect(img.src).toContain('/mascot/wizard/idle.webp')

    mascot.setState('open')
    expect(img.src).toContain('/mascot/wizard/focused.webp')
  })

  it('uses a preset-specific aspect ratio (clip is portrait, lens is square)', () => {
    const clip = new ClipMascot({ preset: 'clip' })
    const lens = new ClipMascot({ preset: 'lens' })

    expect(clip.element.style.getPropertyValue('--clip-mascot-aspect')).not.toBe(
      lens.element.style.getPropertyValue('--clip-mascot-aspect')
    )
    expect(Number(lens.element.style.getPropertyValue('--clip-mascot-aspect'))).toBe(1)

    clip.destroy()
    lens.destroy()
  })

  it('swaps in a custom asset per state, falling back to the selected preset for unset states', () => {
    mascot = new ClipMascot({
      assets: { idle: '/idle.png', thinking: '/thinking.png' },
    })

    const img = mascot.element.querySelector('img') as HTMLImageElement
    expect(img.src).toContain('/idle.png')

    mascot.setState('thinking')
    expect(img.src).toContain('/thinking.png')

    // 'open' has no override — falls back to the built-in "clip" illustration.
    mascot.setState('open')
    expect(img.src).toContain('/mascot/Clip/focused.webp')
  })
})
