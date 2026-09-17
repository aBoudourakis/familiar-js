import type { FamiliarAssistantConfig, ResolvedFamiliarAssistantConfig } from './types'

export const DEFAULT_TITLE = 'Ask Clip'
export const DEFAULT_GREETING = 'What would you like to know?'
export const DEFAULT_HISTORY_LIMIT = 10

const DEFAULTS: Omit<
  ResolvedFamiliarAssistantConfig,
  'transport' | 'container' | 'endpoint' | 'headers' | 'mascotAssets'
> = {
  position: 'bottom-right',
  title: DEFAULT_TITLE,
  greeting: DEFAULT_GREETING,
  suggestions: [],
  theme: 'auto',
  mascot: 'Clip',
  mascotPicker: true,
  sendHistory: true,
  historyLimit: DEFAULT_HISTORY_LIMIT,
  openOnLoad: false,
}

/** Applies defaults to a user-supplied config, leaving pass-through fields untouched. */
export function resolveConfig(config: FamiliarAssistantConfig): ResolvedFamiliarAssistantConfig {
  if (!config.endpoint && !config.transport) {
    throw new Error('familiar-js: config must supply either `endpoint` or a custom `transport`.')
  }

  return {
    ...DEFAULTS,
    ...config,
    suggestions: config.suggestions ?? DEFAULTS.suggestions,
    headers: config.headers ?? {},
    mascotAssets: config.mascotAssets ?? {},
  }
}
