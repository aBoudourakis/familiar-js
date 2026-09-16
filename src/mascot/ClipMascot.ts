import type { ClipMascotAssets, ClipMascotPreset } from '../core/types'
import { DEFAULT_MASCOT_PRESET, MASCOT_PRESETS } from './presets'
import { IDLE_BLINK_SEQUENCE, type BlinkPhase, type ClipMascotState } from './states'

export interface ClipMascotOptions {
  /** Built-in mascot artwork to use as the base. Defaults to `'clip'`. */
  preset?: ClipMascotPreset
  /** Per-state artwork overrides, merged on top of `preset`. */
  assets?: ClipMascotAssets
  /** Height/width ratio of the artwork. Defaults to the selected preset's own ratio. */
  aspectRatio?: number
  /** Rendered width in px; height follows the source art's aspect ratio. Defaults to 56. */
  size?: number
}

/**
 * Renders and animates the mascot — an illustrated character (see
 * src/assets/design-sources) rather than a generic chatbot icon. Idle
 * cycles through a slow, deliberate blink; every other state holds a single
 * static frame. Ships with two built-in presets ("clip", "lens"); every
 * frame is also replaceable via `assets` so consumers can swap in their own
 * mascot/branding entirely.
 */
export class ClipMascot {
  readonly element: HTMLElement

  private readonly image: HTMLImageElement
  private readonly assets: Required<ClipMascotAssets>
  private state: ClipMascotState = 'idle'
  private blinkPhase: BlinkPhase = 'eyesOpen'
  private blinkTimer: ReturnType<typeof setTimeout> | null = null
  private blinkStep = 0
  private readonly prefersReducedMotion: boolean

  constructor(options: ClipMascotOptions = {}) {
    const preset = MASCOT_PRESETS[options.preset ?? DEFAULT_MASCOT_PRESET]
    this.assets = { ...preset.assets, ...options.assets }
    this.prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    this.element = document.createElement('span')
    this.element.className = 'clip-mascot'
    this.element.setAttribute('data-state', this.state)
    this.element.setAttribute('aria-hidden', 'true')
    this.element.style.setProperty('--clip-mascot-aspect', String(options.aspectRatio ?? preset.aspectRatio))
    if (options.size) {
      this.element.style.setProperty('--clip-mascot-size', `${options.size}px`)
    }

    this.image = document.createElement('img')
    this.image.className = 'clip-mascot__image'
    this.image.alt = ''
    this.image.draggable = false
    this.image.decoding = 'async'
    this.element.appendChild(this.image)

    this.applyImage()

    if (!this.prefersReducedMotion) {
      this.runBlinkLoop()
    }
  }

  setState(state: ClipMascotState): void {
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

  getState(): ClipMascotState {
    return this.state
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
