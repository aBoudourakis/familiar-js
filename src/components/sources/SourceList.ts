import type { FamiliarSource } from '../../core/types'
import { externalLinkIcon } from '../icons'

/** Renders citations/sources attached to an assistant message. */
export function renderSourceList(sources: FamiliarSource[]): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'familiar-sources'

  const label = document.createElement('p')
  label.className = 'familiar-sources__label'
  label.textContent = 'Sources'

  const list = document.createElement('ul')
  list.className = 'familiar-sources__list'

  for (const source of sources) {
    const item = document.createElement('li')

    if (source.url) {
      const isExternal = /^https?:\/\//.test(source.url)
      const link = document.createElement('a')
      link.className = 'familiar-sources__link'
      link.href = source.url
      link.textContent = source.title
      if (isExternal) {
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        link.appendChild(externalLinkIcon())
      }
      item.appendChild(link)
    } else {
      item.className = 'familiar-sources__text'
      item.textContent = source.title
    }

    list.appendChild(item)
  }

  wrapper.append(label, list)
  return wrapper
}
