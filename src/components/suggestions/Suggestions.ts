export interface SuggestionItem {
  label: string
  onSelect: () => void
}

export interface SuggestionsOptions {
  items: SuggestionItem[]
}

/** Shown before the conversation starts. Each chip behaves like typing the question manually. */
export class Suggestions {
  readonly element: HTMLDivElement

  constructor(options: SuggestionsOptions) {
    this.element = document.createElement('div')
    this.element.className = 'clip-suggestions'

    const label = document.createElement('p')
    label.className = 'clip-suggestions__label'
    label.textContent = 'Suggested questions'

    const list = document.createElement('ul')
    list.className = 'clip-suggestions__list'

    for (const item of options.items) {
      const li = document.createElement('li')
      const chip = document.createElement('button')
      chip.type = 'button'
      chip.className = 'clip-suggestions__chip'
      chip.textContent = item.label
      chip.addEventListener('click', item.onSelect)
      li.appendChild(chip)
      list.appendChild(li)
    }

    this.element.append(label, list)
    this.setVisible(options.items.length > 0)
  }

  setVisible(visible: boolean): void {
    this.element.hidden = !visible
  }
}
