import { useSyncExternalStore } from 'react'

// The layout switches to the vw-scaled mobile tree below 1024px, as on the reference.
const QUERY = '(max-width: 1023.98px)'

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

export function useIsMobile() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}
