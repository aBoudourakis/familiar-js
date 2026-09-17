import type { FamiliarMascotAssets, FamiliarMascotPreset } from '../core/types'
import { DEFAULT_MASCOT_PRESET, MASCOT_PRESETS } from './presets'
import { IDLE_BLINK_SEQUENCE, type BlinkPhase, type FamiliarMascotState } from './states'

export interface FamiliarMascotOptions {
  /** Built-in mascot artwork to use as the base. Defaults to `'Clip'`. */
  preset?: FamiliarMascotPreset
  /** Per-state artwork overrides, merged on top of `preset`. */
  assets?: FamiliarMascotAssets
  /** Height/width ratio of the artwork. Defaults to the selected preset's own ratio. */
  aspectRatio?: number
  /** Rendered width in px; height follows the source art's aspect ratio. Defaults to 56. */
  size?: number
}

/**
 * Renders and animates the mascot — an illustrated character (see
 * src/assets/design-sources) rather than a generic chatbot icon. Idle
 * cycles through a slow, deliberate blink; every other state holds a single
 * static frame. Ships with several built-in presets (see
 * src/mascot/presets.ts); every frame is also replaceable via `assets` so
 * consumers can swap in their own mascot/branding entirely.
 */
export class FamiliarMascot {
  readonly element: HTMLElement

  private readonly image: HTMLImageElement
  private readonly customAssets: FamiliarMascotAssets
  private readonly explicitAspectRatio?: number
  private assets: Required<FamiliarMascotAssets>
  private state: FamiliarMascotState = 'idle'
  private blinkPhase: BlinkPhase = 'eyesOpen'
  private blinkTimer: ReturnType<typeof setTimeout> | null = null
  private blinkStep = 0
  private readonly prefersReducedMotion: boolean

  constructor(options: FamiliarMascotOptions = {}) {
    const preset = MASCOT_PRESETS[options.preset ?? DEFAULT_MASCOT_PRESET]
    this.customAssets = options.assets ?? {}
    this.explicitAspectRatio = options.aspectRatio
    this.assets = { ...preset.assets, ...this.customAssets }
    this.prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    this.element = document.createElement('span')
    this.element.className = 'familiar-mascot'
    this.element.setAttribute('data-state', this.state)
    this.element.setAttribute('aria-hidden', 'true')
    this.element.style.setProperty('--familiar-mascot-aspect', String(this.explicitAspectRatio ?? preset.aspectRatio))
    if (options.size) {
      this.element.style.setProperty('--familiar-mascot-size', `${options.size}px`)
    }

    this.image = document.createElement('img')
    this.image.className = 'familiar-mascot__image'
    this.image.alt = ''
    this.image.draggable = false
    this.image.decoding = 'async'
    this.element.appendChild(this.image)

    this.applyImage()

    if (!this.prefersReducedMotion) {
      this.runBlinkLoop()
    }
  }

  setState(state: FamiliarMascotState): void {
    if (this.state === state) return
    this.state = state
    this.element.setAttribute('data-state', state)
    this.blinkPhase = 'eyesOpen'
    this.applyImage()

    if (state === 'idle' && !this.prefersReducedMotion) {
      // Always resettle into a fresh, full-length "eyes open" hold rather
      // than resuming mid-blink from wherever the last idle stint left off.
      this.blinkStep = 0
      this.runBlinkLoop()
    } else if (this.blinkTimer) {
      clearTimeout(this.blinkTimer)
      this.blinkTimer = null
    }
  }

  getState(): FamiliarMascotState {
    return this.state
  }

  /** Switches to a different built-in mascot, live. Any custom `assets` overrides still apply on top. */
  setPreset(preset: FamiliarMascotPreset): void {
    const next = MASCOT_PRESETS[preset]
    this.assets = { ...next.assets, ...this.customAssets }
    this.element.style.setProperty('--familiar-mascot-aspect', String(this.explicitAspectRatio ?? next.aspectRatio))
    this.applyImage()
  }

  destroy(): void {
    if (this.blinkTimer) clearTimeout(this.blinkTimer)
    this.element.remove()
  }

  private applyImage(): void {
    if (this.state === 'idle') {
      if (this.blinkPhase === 'closing') this.image.src = this.assets.eyesClosing
      else if (this.blinkPhase === 'closed') this.image.src = this.assets.eyesClosed
      else this.image.src = this.assets.idle
      return
    }
    this.image.src = this.assets[this.state]
  }

  /** Runs the blink sequence on a loop, only while idle. */
  private runBlinkLoop(): void {
    const step = () => {
      if (this.state !== 'idle') return
      const { phase, holdMs } = IDLE_BLINK_SEQUENCE[this.blinkStep]
      this.blinkPhase = phase
      this.applyImage()
      this.blinkTimer = setTimeout(() => {
        this.blinkStep = (this.blinkStep + 1) % IDLE_BLINK_SEQUENCE.length
        step()
      }, holdMs)
    }
    step()
  }
}
