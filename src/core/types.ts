import type { Transport } from '../transport/types'

/** Where the assistant launcher/panel is anchored on screen. */
export type ClipPosition = 'bottom-right' | 'bottom-left'

/** Theming mode. `auto` follows `prefers-color-scheme`. */
export type ClipTheme = 'light' | 'dark' | 'auto'

/** Built-in mascot artwork to use. See `src/mascot/presets.ts` for the asset sets. */
export type ClipMascotPreset = 'clip' | 'lens' | 'seeer' | 'wizard'

/** A single turn in the conversation, sent to and rendered from the backend. */
export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

/** A citation/source returned alongside an assistant answer. */
export interface ClipSource {
  title: string
  url?: string
}

/** Normalized request sent to the configured transport. */
export interface AssistantRequest {
  question: string
  conversation: ConversationMessage[]
}

/** Normalized response expected back from the configured transport. */
export interface AssistantResponse {
  answer: string
  sources?: ClipSource[]
}

/**
 * Error shape a Transport may throw to communicate a specific failure mode
 * (e.g. rate limiting) that the UI should render distinctly.
 */
export class AssistantTransportError extends Error {
  readonly kind: 'rate-limit' | 'network' | 'server' | 'unknown'

  constructor(message: string, kind: AssistantTransportError['kind'] = 'unknown') {
    super(message)
    this.name = 'AssistantTransportError'
    this.kind = kind
  }
}

/** Replaceable mascot artwork, keyed by visual state. Falls back to the built-in Clip art. */
export interface ClipMascotAssets {
  idle?: string
  hover?: string
  thinking?: string
  open?: string
  eyesClosing?: string
  eyesClosed?: string
}

export interface ClipAssistantConfig {
  /**
   * Endpoint the default HttpTransport will POST normalized requests to.
   * Ignored if a custom `transport` is supplied.
   */
  endpoint?: string
  /** Custom transport implementation. Overrides `endpoint`/HttpTransport when provided. */
  transport?: Transport
  /** Mount point. Defaults to appending to `document.body`. */
  container?: HTMLElement
  /** Anchor corner for the launcher and panel. */
  position?: ClipPosition
  /** Panel header title. */
  title?: string
  /** Small secondary line under the title, e.g. "Clip · Assistant". */
  subtitle?: string
  /** Intro copy shown above the suggestions, before any conversation starts. */
  greeting?: string
  /** Small print shown in the panel footer, e.g. an AI-generated-content disclosure. */
  disclosure?: string
  /** Starter prompts rendered as clickable suggestion chips. */
  suggestions?: string[]
  /** Theming mode. */
  theme?: ClipTheme
  /** Built-in mascot artwork to use. Defaults to `'clip'`. */
  mascot?: ClipMascotPreset
  /** Per-state artwork overrides, merged on top of `mascot`. Use this to fully replace the mascot with your own art. */
  mascotAssets?: ClipMascotAssets
  /** Whether to send prior turns as `conversation` context. Defaults to true. */
  sendHistory?: boolean
  /** Maximum number of prior turns included when `sendHistory` is true. */
  historyLimit?: number
  /** Open the panel automatically on mount. Defaults to false. */
  openOnLoad?: boolean
  /** Extra HTTP headers for the default HttpTransport. */
  headers?: Record<string, string>
}

/** Config after defaults have been applied; every optional field is resolved. */
export interface ResolvedClipAssistantConfig
  extends Required<
    Omit<
      ClipAssistantConfig,
      'transport' | 'container' | 'endpoint' | 'headers' | 'mascotAssets' | 'subtitle' | 'disclosure'
    >
  > {
  transport?: Transport
  container?: HTMLElement
  endpoint?: string
  headers: Record<string, string>
  mascotAssets: ClipMascotAssets
  subtitle?: string
  disclosure?: string
}
