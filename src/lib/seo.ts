import { useEffect } from 'react'

export const SITE_URL = 'https://splitdesk.fun'
const DEFAULT_TITLE = 'Splitdesk | Launch it. Split it. Get paid on X.'
const DEFAULT_DESCRIPTION =
  'Launch a pump.fun coin on Solana, assign its creator fees to the X accounts behind it, and let the desk pay them out in USD through X Money.'

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

/** Per-route title, description, canonical and social tags for the single-page app. */
export function useSeo({ title, description, path, noindex = false }: { title?: string; description?: string; path: string; noindex?: boolean }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | Splitdesk` : DEFAULT_TITLE
    const desc = description ?? DEFAULT_DESCRIPTION
    const url = `${SITE_URL}${path === '/' ? '/' : path.replace(/\/$/, '')}`
    document.title = fullTitle
    setMeta('name', 'description', desc)
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:url', url)
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', desc)
    setCanonical(url)
  }, [title, description, path, noindex])
}
