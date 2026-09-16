import type { ClipMascotPreset } from '../../core/types'
import { MASCOT_PRESET_NAMES, MASCOT_PRESETS } from '../../mascot/presets'

export interface MascotPickerOptions {
  current: ClipMascotPreset
  onSelect: (preset: ClipMascotPreset) => void
}

/** A row of small "idle" thumbnails, one per built-in mascot preset, for previewing and switching. */
export function renderMascotPicker(options: MascotPickerOptions): HTMLElement {
  const list = document.createElement('div')
  list.className = 'clip-mascot-picker'
  list.setAttribute('role', 'group')
  list.setAttribute('aria-label', 'Choose a mascot')

  for (const preset of MASCOT_PRESET_NAMES) {
    const isActive = preset === options.current

    const item = document.createElement('button')
    item.type = 'button'
    item.className = 'clip-mascot-picker__item'
    item.setAttribute('aria-pressed', String(isActive))
    if (isActive) item.setAttribute('data-active', 'true')
    item.setAttribute('aria-label', isActive ? `${preset} (current mascot)` : `Switch to ${preset}`)
    item.addEventListener('click', () => options.onSelect(preset))

    const thumb = document.createElement('img')
    thumb.className = 'clip-mascot-picker__thumb'
    thumb.src = MASCOT_PRESETS[preset].assets.idle
    thumb.alt = ''
    thumb.draggable = false
    thumb.decoding = 'async'

    const label = document.createElement('span')
    label.className = 'clip-mascot-picker__label'
    label.textContent = preset

    item.append(thumb, label)
    list.appendChild(item)
  }

  return list
}
