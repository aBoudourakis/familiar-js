import { afterEach, describe, expect, it, vi } from 'vitest'
import { AssistantTransportError } from '../src/core/types'
import { HttpTransport } from '../src/transport/HttpTransport'

describe('HttpTransport', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('POSTs a normalized request and returns a normalized response', async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => {
      void _url
      void _init
      return new Response(JSON.stringify({ answer: 'Hello', sources: [{ title: 'Doc', url: '/doc' }] }), {
        status: 200,
      })
    })
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const transport = new HttpTransport({ endpoint: '/api/assistant', headers: { 'X-Test': '1' } })
    const result = await transport.send({ question: 'What is this?', conversation: [] })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/assistant')
    expect(init?.method).toBe('POST')
    expect(init?.headers).toMatchObject({ 'Content-Type': 'application/json', 'X-Test': '1' })
    expect(JSON.parse(init?.body as string)).toEqual({ question: 'What is this?', conversation: [] })

    expect(result).toEqual({ answer: 'Hello', sources: [{ title: 'Doc', url: '/doc' }] })
  })

  it('throws a rate-limit AssistantTransportError on HTTP 429', async () => {
    globalThis.fetch = vi.fn(async () => new Response(null, { status: 429 })) as unknown as typeof fetch
    const transport = new HttpTransport({ endpoint: '/api/assistant' })

    await expect(transport.send({ question: 'hi', conversation: [] })).rejects.toMatchObject({
      kind: 'rate-limit',
    })
  })

  it('throws a server AssistantTransportError on other non-2xx responses', async () => {
    globalThis.fetch = vi.fn(async () => new Response(null, { status: 500 })) as unknown as typeof fetch
    const transport = new HttpTransport({ endpoint: '/api/assistant' })

    await expect(transport.send({ question: 'hi', conversation: [] })).rejects.toBeInstanceOf(
      AssistantTransportError
    )
  })

  it('throws a network AssistantTransportError when fetch rejects', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new TypeError('network down')
    }) as unknown as typeof fetch
    const transport = new HttpTransport({ endpoint: '/api/assistant' })

    await expect(transport.send({ question: 'hi', conversation: [] })).rejects.toMatchObject({
      kind: 'network',
    })
  })

  it('throws when the response payload is missing an answer field', async () => {
    globalThis.fetch = vi.fn(
      async () => new Response(JSON.stringify({ foo: 'bar' }), { status: 200 })
    ) as unknown as typeof fetch
    const transport = new HttpTransport({ endpoint: '/api/assistant' })

    await expect(transport.send({ question: 'hi', conversation: [] })).rejects.toBeInstanceOf(
      AssistantTransportError
    )
  })
})
