export type FamiliarMascotState = 'idle' | 'hover' | 'thinking' | 'open' | 'error'

export const FAMILIAR_MASCOT_STATES: readonly FamiliarMascotState[] = [
  'idle',
  'hover',
  'thinking',
  'open',
  'error',
]

/**
 * Idle-only blink cycle: eyes open for a long, restful stretch, then blink
 * quickly through closing → closed → closing before settling back — a
 * still, standby feel rather than a constantly-animated one.
 */
export type BlinkPhase = 'eyesOpen' | 'closing' | 'closed'

export const IDLE_BLINK_SEQUENCE: readonly { phase: BlinkPhase; holdMs: number }[] = [
  { phase: 'eyesOpen', holdMs: 3000 },
  { phase: 'closing', holdMs: 120 },
  { phase: 'closed', holdMs: 220 },
  { phase: 'closing', holdMs: 120 },
]
