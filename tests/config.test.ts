import { describe, expect, it } from 'vitest'
import { resolveConfig } from '../src/core/config'
import type { Transport } from '../src/transport/types'

describe('resolveConfig', () => {
  it('applies defaults on top of a minimal endpoint config', () => {
    const config = resolveConfig({ endpoint: '/api/assistant' })

    expect(config.endpoint).toBe('/api/assistant')
    expect(config.position).toBe('bottom-right')
    expect(config.theme).toBe('auto')
    expect(config.title).toBe('Ask Clip')
    expect(config.greeting).toBe('What would you like to know?')
    expect(config.mascot).toBe('Clip')
    expect(config.mascotPicker).toBe(true)
    expect(config.suggestions).toEqual([])
    expect(config.sendHistory).toBe(true)
    expect(config.historyLimit).toBeGreaterThan(0)
    expect(config.openOnLoad).toBe(false)
    expect(config.headers).toEqual({})
    expect(config.mascotAssets).toEqual({})
  })

  it('preserves explicit overrides', () => {
    const config = resolveConfig({
      endpoint: '/api/assistant',
      position: 'bottom-left',
      theme: 'dark',
      mascot: 'Lens',
      suggestions: ['Hi'],
      sendHistory: false,
    })

    expect(config.position).toBe('bottom-left')
    expect(config.theme).toBe('dark')
    expect(config.mascot).toBe('Lens')
    expect(config.suggestions).toEqual(['Hi'])
    expect(config.sendHistory).toBe(false)
  })

  it('accepts a custom transport instead of an endpoint', () => {
    const transport: Transport = { send: async () => ({ answer: 'ok' }) }
    const config = resolveConfig({ transport })

    expect(config.transport).toBe(transport)
    expect(config.endpoint).toBeUndefined()
  })

  it('throws when neither endpoint nor transport is supplied', () => {
    expect(() => resolveConfig({})).toThrow(/endpoint.*transport/i)
  })
})
