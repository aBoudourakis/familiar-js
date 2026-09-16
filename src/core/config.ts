import type { ClipAssistantConfig, ResolvedClipAssistantConfig } from './types'

export const DEFAULT_TITLE = 'Ask Clip'
export const DEFAULT_GREETING = 'What would you like to know?'
export const DEFAULT_HISTORY_LIMIT = 10

const DEFAULTS: Omit<
  ResolvedClipAssistantConfig,
  'transport' | 'container' | 'endpoint' | 'headers' | 'mascotAssets'
> = {
  position: 'bottom-right',
  title: DEFAULT_TITLE,
  greeting: DEFAULT_GREETING,
  suggestions: [],
  theme: 'auto',
  mascot: 'clip',
  sendHistory: true,
  historyLimit: DEFAULT_HISTORY_LIMIT,
  openOnLoad: false,
}

/** Applies defaults to a user-supplied config, leaving pass-through fields untouched. */
export function resolveConfig(config: ClipAssistantConfig): ResolvedClipAssistantConfig {
  if (!config.endpoint && !config.transport) {
    throw new Error('clip-js: config must supply either `endpoint` or a custom `transport`.')
  }

  return {
    ...DEFAULTS,
    ...config,
    suggestions: config.suggestions ?? DEFAULTS.suggestions,
    headers: config.headers ?? {},
    mascotAssets: config.mascotAssets ?? {},
  }
}
