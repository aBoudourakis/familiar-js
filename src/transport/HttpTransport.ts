import { AssistantTransportError, type AssistantRequest, type AssistantResponse } from '../core/types'
import type { Transport } from './types'

export interface HttpTransportOptions {
  endpoint: string
  headers?: Record<string, string>
}

/** Default Transport: POSTs the normalized request as JSON and parses a JSON response. */
export class HttpTransport implements Transport {
  private readonly endpoint: string
  private readonly headers: Record<string, string>

  constructor(options: HttpTransportOptions) {
    this.endpoint = options.endpoint
    this.headers = options.headers ?? {}
  }

  async send(request: AssistantRequest, signal?: AbortSignal): Promise<AssistantResponse> {
    let response: Response
    try {
      response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers,
        },
        body: JSON.stringify(request),
        signal,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error
      }
      throw new AssistantTransportError('Unable to reach the assistant service.', 'network')
    }

    if (response.status === 429) {
      throw new AssistantTransportError('Rate limit exceeded. Please try again shortly.', 'rate-limit')
    }

    if (!response.ok) {
      throw new AssistantTransportError(`Assistant service responded with ${response.status}.`, 'server')
    }

    let data: unknown
    try {
      data = await response.json()
    } catch {
      throw new AssistantTransportError('Assistant service returned an invalid response.', 'server')
    }

    return normalizeResponse(data)
  }
}

function normalizeResponse(data: unknown): AssistantResponse {
  if (!data || typeof data !== 'object' || typeof (data as Record<string, unknown>).answer !== 'string') {
    throw new AssistantTransportError('Assistant service returned an unexpected payload shape.', 'server')
  }

  const record = data as Record<string, unknown>
  const sources = Array.isArray(record.sources)
    ? record.sources
        .filter(
          (source): source is { title: string; url?: string } =>
            !!source && typeof source === 'object' && typeof (source as Record<string, unknown>).title === 'string'
        )
        .map((source) => ({ title: source.title, url: source.url }))
    : undefined

  return {
    answer: record.answer as string,
    sources,
  }
}
