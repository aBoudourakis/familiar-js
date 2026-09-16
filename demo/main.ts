import { ClipAssistant, type ClipPosition, type ClipTheme } from '../src'
import { MockTransport } from './mockTransport'

const params = new URLSearchParams(location.search)
const initialPosition = (params.get('position') as ClipPosition | null) ?? 'bottom-right'

const assistant = new ClipAssistant({
  transport: new MockTransport(),
  position: initialPosition,
  title: 'Ask Clip',
  subtitle: 'Clip · Demo Assistant',
  greeting: 'Hi! I can answer questions about this demo and how clip-js works.',
  disclosure: 'This demo runs entirely in your browser — no real backend is called.',
  suggestions: [
    'Tell me about clip-js',
    'What technologies are used?',
    'Try a simulated error',
    'Try a simulated rate limit',
  ],
  theme: 'auto',
})

const positionSelect = document.querySelector<HTMLSelectElement>('#position-select')
const themeSelect = document.querySelector<HTMLSelectElement>('#theme-select')
const openButton = document.querySelector<HTMLButtonElement>('#open-button')

if (positionSelect) positionSelect.value = initialPosition

positionSelect?.addEventListener('change', () => {
  const url = new URL(location.href)
  url.searchParams.set('position', positionSelect.value)
  location.href = url.toString()
})

themeSelect?.addEventListener('change', () => {
  assistant.setTheme(themeSelect.value as ClipTheme)
})

openButton?.addEventListener('click', () => {
  assistant.toggle()
})
