import { ClipMascot } from '../../mascot/ClipMascot'

export interface LauncherOptions {
  /** Accessible name for the launcher button (not the same as the hover tooltip text). */
  label: string
  /** Hover/focus tooltip text. Hidden on narrow viewports (a tap can't "hover"). */
  tooltip: string
  mascot: ClipMascot
  /** Whether to render the decorative accent ring behind the mascot. Defaults to true. */
  showRing?: boolean
  onToggle: () => void
}

let tooltipCounter = 0

/**
 * The closed, floating launcher button. A real <button> — its accessible
 * name comes from aria-label, never from the hover tooltip alone.
 */
export class Launcher {
  readonly element: HTMLButtonElement

  private readonly mascot: ClipMascot
  private readonly ring: HTMLSpanElement

  constructor(options: LauncherOptions) {
    this.mascot = options.mascot

    const tooltipId = `clip-launcher-tooltip-${++tooltipCounter}`

    this.element = document.createElement('button')
    this.element.type = 'button'
    this.element.className = 'clip-launcher'
    this.element.setAttribute('aria-haspopup', 'dialog')
    this.element.setAttribute('aria-expanded', 'false')
    this.element.setAttribute('aria-label', options.label)
    this.element.setAttribute('aria-describedby', tooltipId)

    const tooltip = document.createElement('span')
    tooltip.className = 'clip-launcher__tooltip'
    tooltip.id = tooltipId
    tooltip.setAttribute('role', 'tooltip')
    tooltip.textContent = options.tooltip

    this.ring = document.createElement('span')
    this.ring.className = 'clip-launcher__ring'
    this.ring.setAttribute('aria-hidden', 'true')
    this.ring.hidden = !(options.showRing ?? true)

    this.element.append(tooltip, this.ring, this.mascot.element)

    this.element.addEventListener('click', options.onToggle)
    this.element.addEventListener('pointerenter', () => this.setHovering(true))
    this.element.addEventListener('pointerleave', () => this.setHovering(false))
    this.element.addEventListener('focus', () => this.setHovering(true))
    this.element.addEventListener('blur', () => this.setHovering(false))
  }

  setShowRing(show: boolean): void {
    this.ring.hidden = !show
  }

  setExpanded(expanded: boolean): void {
    this.element.setAttribute('aria-expanded', String(expanded))
    this.element.classList.toggle('clip-launcher--open', expanded)
  }

  focus(): void {
    this.element.focus()
  }

  private setHovering(hovering: boolean): void {
    this.element.classList.toggle('clip-launcher--hovering', hovering)
    if (this.mascot.getState() !== 'idle' && this.mascot.getState() !== 'hover') return
    this.mascot.setState(hovering ? 'hover' : 'idle')
  }
}
