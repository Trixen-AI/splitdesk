// Official X mark, unmodified. Source: the inline logo SVG served on https://x.com
// (X brand toolkit: https://about.x.com/en/who-we-are/brand-toolkit). Resized only.
export function XLogo({ className, color = 'currentColor', title }: { className?: string; color?: string; title?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <path
        fill={color}
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  )
}
