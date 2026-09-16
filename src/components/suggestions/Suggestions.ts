export interface SuggestionsOptions {
  suggestions: string[]
  onSelect: (suggestion: string) => void
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

    for (const suggestion of options.suggestions) {
      const item = document.createElement('li')
      const chip = document.createElement('button')
      chip.type = 'button'
      chip.className = 'clip-suggestions__chip'
      chip.textContent = suggestion
      chip.addEventListener('click', () => options.onSelect(suggestion))
      item.appendChild(chip)
      list.appendChild(item)
    }

    this.element.append(label, list)
    this.setVisible(options.suggestions.length > 0)
  }

  setVisible(visible: boolean): void {
    this.element.hidden = !visible
  }
}
