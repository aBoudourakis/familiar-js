import './styles/familiar.css'

export { FamiliarAssistant } from './core/FamiliarAssistant'
export { resolveConfig } from './core/config'
export {
  AssistantTransportError,
  type AssistantRequest,
  type AssistantResponse,
  type FamiliarAssistantConfig,
  type FamiliarMascotAssets,
  type FamiliarMascotPreset,
  type FamiliarPosition,
  type FamiliarSource,
  type FamiliarTheme,
  type ConversationMessage,
  type ResolvedFamiliarAssistantConfig,
} from './core/types'

export { HttpTransport, type HttpTransportOptions } from './transport/HttpTransport'
export type { Transport } from './transport/types'

export { FamiliarMascot, type FamiliarMascotOptions } from './mascot/FamiliarMascot'
export type { FamiliarMascotState } from './mascot/states'

export { FamiliarAssistantElement, registerFamiliarAssistantElement } from './web-component'
