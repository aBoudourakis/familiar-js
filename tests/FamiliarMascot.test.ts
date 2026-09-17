import { afterEach, describe, expect, it } from 'vitest'
import { FamiliarMascot } from '../src/mascot/FamiliarMascot'

describe('FamiliarMascot', () => {
  let mascot: FamiliarMascot | null = null

  afterEach(() => {
    mascot?.destroy()
    mascot = null
  })

  it('renders an <img> defaulting to the built-in "Clip" idle illustration', () => {
    mascot = new FamiliarMascot()

    expect(mascot.element.getAttribute('data-state')).toBe('idle')
    const img = mascot.element.querySelector('img') as HTMLImageElement
    expect(img).toBeTruthy()
    expect(img.src).toContain('/mascot/Clip/idle.webp')
  })

  it('is decorative (aria-hidden) since the launcher/panel supply their own accessible name', () => {
    mascot = new FamiliarMascot()

    expect(mascot.element.getAttribute('aria-hidden')).toBe('true')
  })

  it('updates data-state, getState(), and the image src when transitioning states', () => {
    mascot = new FamiliarMascot()

    mascot.setState('thinking')

    expect(mascot.getState()).toBe('thinking')
    expect(mascot.element.getAttribute('data-state')).toBe('thinking')
    const img = mascot.element.querySelector('img') as HTMLImageElement
    expect(img.src).toContain('/mascot/Clip/thinking.webp')
  })

  it('loads the "Lens" preset\'s own artwork when selected', () => {
    mascot = new FamiliarMascot({ preset: 'Lens' })

    const img = mascot.element.querySelector('img') as HTMLImageElement
    expect(img.src).toContain('/mascot/Lens/idle.webp')

    mascot.setState('open')
    expect(img.src).toContain('/mascot/Lens/focused.webp')
  })

  it('loads the "Seer" preset\'s own artwork when selected', () => {
    mascot = new FamiliarMascot({ preset: 'Seer' })

    const img = mascot.element.querySelector('img') as HTMLImageElement
    expect(img.src).toContain('/mascot/Seer/idle.webp')

    mascot.setState('open')
    expect(img.src).toContain('/mascot/Seer/focused.webp')
  })

  it('loads the "Wizard" preset\'s own artwork when selected', () => {
    mascot = new FamiliarMascot({ preset: 'Wizard' })

    const img = mascot.element.querySelector('img') as HTMLImageElement
    expect(img.src).toContain('/mascot/Wizard/idle.webp')

    mascot.setState('open')
    expect(img.src).toContain('/mascot/Wizard/focused.webp')
  })

  it('uses a preset-specific aspect ratio (Clip is portrait, Lens is square)', () => {
    const clip = new FamiliarMascot({ preset: 'Clip' })
    const lens = new FamiliarMascot({ preset: 'Lens' })

    expect(clip.element.style.getPropertyValue('--familiar-mascot-aspect')).not.toBe(
      lens.element.style.getPropertyValue('--familiar-mascot-aspect')
    )
    expect(Number(lens.element.style.getPropertyValue('--familiar-mascot-aspect'))).toBe(1)

    clip.destroy()
    lens.destroy()
  })

  it('swaps in a custom asset per state, falling back to the selected preset for unset states', () => {
    mascot = new FamiliarMascot({
      assets: { idle: '/idle.png', thinking: '/thinking.png' },
    })

    const img = mascot.element.querySelector('img') as HTMLImageElement
    expect(img.src).toContain('/idle.png')

    mascot.setState('thinking')
    expect(img.src).toContain('/thinking.png')

    // 'open' has no override — falls back to the built-in "Clip" illustration.
    mascot.setState('open')
    expect(img.src).toContain('/mascot/Clip/focused.webp')
  })

  it('setPreset() switches artwork and aspect ratio live, keeping custom overrides on top', () => {
    mascot = new FamiliarMascot({ preset: 'Clip', assets: { idle: '/custom-idle.png' } })
    const img = mascot.element.querySelector('img') as HTMLImageElement
    expect(img.src).toContain('/custom-idle.png')

    mascot.setPreset('Lens')

    // Custom override still wins for 'idle'...
    expect(img.src).toContain('/custom-idle.png')
    // ...but a state with no override now comes from Lens, not Clip.
    mascot.setState('open')
    expect(img.src).toContain('/mascot/Lens/focused.webp')
    expect(Number(mascot.element.style.getPropertyValue('--familiar-mascot-aspect'))).toBe(1)
  })
})
