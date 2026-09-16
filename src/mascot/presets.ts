import clipClosed from '../assets/mascot/Clip/closed.webp'
import clipClosing from '../assets/mascot/Clip/closing.webp'
import clipFocused from '../assets/mascot/Clip/focused.webp'
import clipHover from '../assets/mascot/Clip/hover.webp'
import clipIdle from '../assets/mascot/Clip/idle.webp'
import clipThinking from '../assets/mascot/Clip/thinking.webp'
import lensClosed from '../assets/mascot/Lens/closed.webp'
import lensClosing from '../assets/mascot/Lens/closing.webp'
import lensFocused from '../assets/mascot/Lens/focused.webp'
import lensHover from '../assets/mascot/Lens/hover.webp'
import lensIdle from '../assets/mascot/Lens/idle.webp'
import lensThinking from '../assets/mascot/Lens/thinking.webp'
import seerClosed from '../assets/mascot/Seer/closed.webp'
import seerClosing from '../assets/mascot/Seer/closing.webp'
import seerFocused from '../assets/mascot/Seer/focused.webp'
import seerHover from '../assets/mascot/Seer/hover.webp'
import seerIdle from '../assets/mascot/Seer/idle.webp'
import seerThinking from '../assets/mascot/Seer/thinking.webp'
import wizardClosed from '../assets/mascot/Wizard/closed.webp'
import wizardClosing from '../assets/mascot/Wizard/closing.webp'
import wizardFocused from '../assets/mascot/Wizard/focused.webp'
import wizardHover from '../assets/mascot/Wizard/hover.webp'
import wizardIdle from '../assets/mascot/Wizard/idle.webp'
import wizardThinking from '../assets/mascot/Wizard/thinking.webp'
import type { ClipMascotAssets, ClipMascotPreset } from '../core/types'

export interface MascotPresetDefinition {
  assets: Required<ClipMascotAssets>
  /** Source art's height/width ratio — each preset's illustrations may use a different canvas. */
  aspectRatio: number
}

export const MASCOT_PRESETS: Record<ClipMascotPreset, MascotPresetDefinition> = {
  Clip: {
    // Native 1129x1393 source art.
    aspectRatio: 1393 / 1129,
    assets: {
      idle: clipIdle,
      hover: clipHover,
      thinking: clipThinking,
      open: clipFocused,
      eyesClosing: clipClosing,
      eyesClosed: clipClosed,
    },
  },
  Lens: {
    // Native 300x300 source art.
    aspectRatio: 300 / 300,
    assets: {
      idle: lensIdle,
      hover: lensHover,
      thinking: lensThinking,
      open: lensFocused,
      eyesClosing: lensClosing,
      eyesClosed: lensClosed,
    },
  },
  Seer: {
    // Native 300x300 source art.
    aspectRatio: 300 / 300,
    assets: {
      idle: seerIdle,
      hover: seerHover,
      thinking: seerThinking,
      open: seerFocused,
      eyesClosing: seerClosing,
      eyesClosed: seerClosed,
    },
  },
  Wizard: {
    // Native 300x300 source art.
    aspectRatio: 300 / 300,
    assets: {
      idle: wizardIdle,
      hover: wizardHover,
      thinking: wizardThinking,
      open: wizardFocused,
      eyesClosing: wizardClosing,
      eyesClosed: wizardClosed,
    },
  },
}

export const DEFAULT_MASCOT_PRESET: ClipMascotPreset = 'Clip'

/** All built-in preset keys, in display order. */
export const MASCOT_PRESET_NAMES = Object.keys(MASCOT_PRESETS) as ClipMascotPreset[]
