import AOS from 'aos'

// Same settings as the reference: 600ms ease-out, once, 140px offset (60 design px on mobile).
export function initAos() {
  const mobile = window.innerWidth < 1024
  AOS.init({
    duration: 600,
    once: true,
    easing: 'ease-out',
    offset: mobile ? (60 / 375) * window.innerWidth : 140,
  })
}

export function refreshAos() {
  AOS.refreshHard()
}
