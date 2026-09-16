import './styles/clip.css'

export { ClipAssistant } from './core/ClipAssistant'
export { resolveConfig } from './core/config'
export {
  AssistantTransportError,
  type AssistantRequest,
  type AssistantResponse,
  type ClipAssistantConfig,
  type ClipMascotAssets,
  type ClipPosition,
  type ClipSource,
  type ClipTheme,
  type ConversationMessage,
  type ResolvedClipAssistantConfig,
} from './core/types'

export { HttpTransport, type HttpTransportOptions } from './transport/HttpTransport'
export type { Transport } from './transport/types'

export { ClipMascot, type ClipMascotOptions } from './mascot/ClipMascot'
export type { ClipMascotState } from './mascot/states'

export { ClipAssistantElement, registerClipAssistantElement } from './web-component'
