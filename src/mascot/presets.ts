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
import seeerClosed from '../assets/mascot/seeer/closed.webp'
import seeerClosing from '../assets/mascot/seeer/closing.webp'
import seeerFocused from '../assets/mascot/seeer/focused.webp'
import seeerHover from '../assets/mascot/seeer/hover.webp'
import seeerIdle from '../assets/mascot/seeer/idle.webp'
import seeerThinking from '../assets/mascot/seeer/thinking.webp'
import wizardClosed from '../assets/mascot/wizard/closed.webp'
import wizardClosing from '../assets/mascot/wizard/closing.webp'
import wizardFocused from '../assets/mascot/wizard/focused.webp'
import wizardHover from '../assets/mascot/wizard/hover.webp'
import wizardIdle from '../assets/mascot/wizard/idle.webp'
import wizardThinking from '../assets/mascot/wizard/thinking.webp'
import type { ClipMascotAssets, ClipMascotPreset } from '../core/types'

export interface MascotPresetDefinition {
  assets: Required<ClipMascotAssets>
  /** Source art's height/width ratio — each preset's illustrations may use a different canvas. */
  aspectRatio: number
}

export const MASCOT_PRESETS: Record<ClipMascotPreset, MascotPresetDefinition> = {
  clip: {
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
  lens: {
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
  seeer: {
    // Native 300x300 source art.
    aspectRatio: 300 / 300,
    assets: {
      idle: seeerIdle,
      hover: seeerHover,
      thinking: seeerThinking,
      open: seeerFocused,
      eyesClosing: seeerClosing,
      eyesClosed: seeerClosed,
    },
  },
  wizard: {
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

export const DEFAULT_MASCOT_PRESET: ClipMascotPreset = 'clip'
