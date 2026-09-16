import type { AssistantRequest, AssistantResponse } from '../core/types'

/**
 * Pluggable backend adapter. `clip-js` never talks to an AI/RAG provider
 * directly — it normalizes user input into an `AssistantRequest` and hands
 * it to a Transport, then renders whatever `AssistantResponse` comes back.
 */
export interface Transport {
  send(request: AssistantRequest, signal?: AbortSignal): Promise<AssistantResponse>
}
