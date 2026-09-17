import clipClosed from '../assets/mascot/Clip/closed.webp'
import clipClosing from '../assets/mascot/Clip/closing.webp'
import clipError from '../assets/mascot/Clip/error.webp'
import clipFocused from '../assets/mascot/Clip/focused.webp'
import clipHover from '../assets/mascot/Clip/hover.webp'
import clipIdle from '../assets/mascot/Clip/idle.webp'
import clipThinking from '../assets/mascot/Clip/thinking.webp'
import lensClosed from '../assets/mascot/Lens/closed.webp'
import lensClosing from '../assets/mascot/Lens/closing.webp'
import lensError from '../assets/mascot/Lens/error.webp'
import lensFocused from '../assets/mascot/Lens/focused.webp'
import lensHover from '../assets/mascot/Lens/hover.webp'
import lensIdle from '../assets/mascot/Lens/idle.webp'
import lensThinking from '../assets/mascot/Lens/thinking.webp'
import seerClosed from '../assets/mascot/Seer/closed.webp'
import seerClosing from '../assets/mascot/Seer/closing.webp'
import seerError from '../assets/mascot/Seer/error.webp'
import seerFocused from '../assets/mascot/Seer/focused.webp'
import seerHover from '../assets/mascot/Seer/hover.webp'
import seerIdle from '../assets/mascot/Seer/idle.webp'
import seerThinking from '../assets/mascot/Seer/thinking.webp'
import wizardClosed from '../assets/mascot/Wizard/closed.webp'
import wizardClosing from '../assets/mascot/Wizard/closing.webp'
import wizardError from '../assets/mascot/Wizard/error.webp'
import wizardFocused from '../assets/mascot/Wizard/focused.webp'
import wizardHover from '../assets/mascot/Wizard/hover.webp'
import wizardIdle from '../assets/mascot/Wizard/idle.webp'
import wizardThinking from '../assets/mascot/Wizard/thinking.webp'
import type { FamiliarMascotAssets, FamiliarMascotPreset } from '../core/types'

export interface MascotPresetDefinition {
  assets: Required<FamiliarMascotAssets>
  /** Source art's height/width ratio — each preset's illustrations may use a different canvas. */
  aspectRatio: number
}

export const MASCOT_PRESETS: Record<FamiliarMascotPreset, MascotPresetDefinition> = {
  Clip: {
    // Native 1129x1393 source art.
    aspectRatio: 1393 / 1129,
    assets: {
      idle: clipIdle,
      hover: clipHover,
      thinking: clipThinking,
      open: clipFocused,
      error: clipError,
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
      error: lensError,
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
      error: seerError,
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
      error: wizardError,
      eyesClosing: wizardClosing,
      eyesClosed: wizardClosed,
    },
  },
}

export const DEFAULT_MASCOT_PRESET: FamiliarMascotPreset = 'Clip'

/** All built-in preset keys, in display order. */
export const MASCOT_PRESET_NAMES = Object.keys(MASCOT_PRESETS) as FamiliarMascotPreset[]
