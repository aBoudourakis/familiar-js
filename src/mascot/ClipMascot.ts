import clipEyesClosed from '../assets/mascot/Clip/Clip_eyes_closed.webp'
import clipEyesClosing from '../assets/mascot/Clip/Clip_eyes_closing.webp'
import clipFocused from '../assets/mascot/Clip/Clip_focused.webp'
import clipHover from '../assets/mascot/Clip/Clip_hover.webp'
import clipIdle from '../assets/mascot/Clip/Clip_idle.webp'
import clipThinking from '../assets/mascot/Clip/Clip_thinking.webp'
import type { ClipMascotAssets } from '../core/types'
import { IDLE_BLINK_SEQUENCE, type BlinkPhase, type ClipMascotState } from './states'

export interface ClipMascotOptions {
  /** Replaceable artwork per state. Falls back to the built-in Clip illustrations. */
  assets?: ClipMascotAssets
  /** Rendered width in px; height follows the source art's aspect ratio. Defaults to 56. */
  size?: number
}

const DEFAULT_ASSETS: Required<ClipMascotAssets> = {
  idle: clipIdle,
  hover: clipHover,
  thinking: clipThinking,
  open: clipFocused,
  eyesClosing: clipEyesClosing,
  eyesClosed: clipEyesClosed,
}

/** Matches the source illustrations' native aspect ratio (1129x1393). */
const ASPECT_RATIO = 1393 / 1129

/**
 * Renders and animates the Clip mascot — an original paperclip-inspired
 * illustration (see src/assets/design-sources/Clip) rather than a generic
 * chatbot icon. Idle cycles through a slow, deliberate blink; every other
 * state holds a single static frame. Every frame is replaceable via `assets`
 * so consumers can swap in their own mascot/branding.
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
    this.assets = { ...DEFAULT_ASSETS, ...options.assets }
    this.prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    this.element = document.createElement('span')
    this.element.className = 'clip-mascot'
    this.element.setAttribute('data-state', this.state)
    this.element.setAttribute('aria-hidden', 'true')
    this.element.style.setProperty('--clip-mascot-aspect', String(ASPECT_RATIO))
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
