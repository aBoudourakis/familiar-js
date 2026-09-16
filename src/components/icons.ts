const SVG_NS = 'http://www.w3.org/2000/svg'

function svg(viewBox: string, innerHTML: string): SVGSVGElement {
  const el = document.createElementNS(SVG_NS, 'svg')
  el.setAttribute('viewBox', viewBox)
  el.setAttribute('aria-hidden', 'true')
  el.setAttribute('focusable', 'false')
  el.innerHTML = innerHTML
  return el
}

export function closeIcon(): SVGSVGElement {
  return svg(
    '0 0 24 24',
    '<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />'
  )
}

export function sendIcon(): SVGSVGElement {
  return svg('0 0 24 24', '<path d="M4 12l16-8-6 8 6 8-16-8z" fill="currentColor" />')
}

export function errorIcon(): SVGSVGElement {
  return svg(
    '0 0 24 24',
    `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6" />
     <path d="M12 7v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
     <circle cx="12" cy="16.2" r="1" fill="currentColor" />`
  )
}

export function externalLinkIcon(): SVGSVGElement {
  return svg(
    '0 0 24 24',
    `<path d="M14 5h5v5m0-5L10 14M9 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3"
      fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />`
  )
}
