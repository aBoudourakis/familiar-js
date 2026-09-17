import { AssistantTransportError, type AssistantRequest, type AssistantResponse, type Transport } from '../src'

/**
 * Stand-in backend for local development. Demonstrates the shape a real
 * Transport implements — familiar-js itself has no knowledge of what happens
 * inside `send()`, whether that's a RAG pipeline, a plain LLM call, or
 * (as here) canned demo data.
 */
export class MockTransport implements Transport {
  async send(request: AssistantRequest, signal?: AbortSignal): Promise<AssistantResponse> {
    await delay(700 + Math.random() * 900, signal)

    const question = request.question.toLowerCase()

    if (question.includes('rate limit')) {
      throw new AssistantTransportError('Too many requests — try again in a minute.', 'rate-limit')
    }

    if (question.includes('error')) {
      throw new AssistantTransportError('The demo backend hit a simulated error.', 'server')
    }

    if (question.includes('tech') || question.includes('stack')) {
      return {
        answer:
          'This demo uses TypeScript, Vite, and Vitest, with no framework runtime dependency in the core widget.',
        sources: [
          { title: 'Technology Direction', url: '#technology-direction' },
          { title: 'Proposed Structure', url: '#proposed-structure' },
        ],
      }
    }

    if (question.includes('familiar-js') || question.includes('project')) {
      return {
        answer:
          'familiar-js is a reusable, embeddable AI assistant widget. It renders the UI and mascot, and delegates all AI/RAG logic to a backend transport you configure.',
        sources: [{ title: 'Overview', url: '#overview' }],
      }
    }

    return {
      answer: `This is a simulated response for local development. In production, "${request.question}" would be sent to your configured backend endpoint.`,
    }
  }
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}
