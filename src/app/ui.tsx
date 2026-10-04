import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { explorerAccount } from '@/launch/config'
import { fmtSol, short } from './chain'
import { useBalances } from './data/balances'
import { useWallet } from './useWallet'

/* ---------- Layout pieces in the website's vocabulary ---------- */

export function PageHeader({ label, title, text, action }: { label: string; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-[24px] mb-[40px] max-lg:mb-[24px] max-md:flex-col max-md:items-start">
      <div className="min-w-0">
        <div className="font-JetBrainsMono text-primary/60 text-[16px] leading-[24px] mb-[12px] max-lg:text-[13px]">{label}</div>
        <h1 className="font-[500] text-primary text-[40px] leading-[48px] max-lg:text-[28px] max-lg:leading-[34px]">{title}</h1>
        {text ? <p className="text-muted text-[18px] leading-[26px] mt-[12px] max-w-[760px] max-lg:text-[15px] max-lg:leading-[22px]">{text}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function Panel({
  label,
  action,
  children,
  className = '',
  tone = 'card',
}: {
  label?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  tone?: 'card' | 'white'
}) {
  return (
    <section className={`rounded-[8px] ${tone === 'card' ? 'bg-card' : 'bg-white border border-line'} p-[28px] max-lg:p-[20px] min-w-0 ${className}`}>
      {label || action ? (
        <div className="flex items-center justify-between gap-[16px] mb-[20px]">
          {label ? <div className="font-JetBrainsMono text-[14px] text-primary/60 uppercase">{label}</div> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="rounded-[8px] bg-card p-[24px] max-lg:p-[18px] min-w-0">
      <div className="font-JetBrainsMono text-[13px] text-primary/60 uppercase mb-[14px]">{label}</div>
      <div className="text-[30px] leading-[36px] font-[500] text-primary truncate max-lg:text-[24px]">{value}</div>
      {sub ? <div className="mt-[6px] text-[14px] leading-[20px] text-muted">{sub}</div> : null}
    </div>
  )
}

export function Chip({ children, tone = 'line' }: { children: ReactNode; tone?: 'line' | 'ok' | 'dark' | 'warn' }) {
  const cls = {
    line: 'border border-primary/10 text-primary/70',
    ok: 'bg-accent/40 text-primary',
    dark: 'bg-primary text-white',
    warn: 'bg-[#B42318]/10 text-[#B42318]',
  }[tone]
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-[10px] py-[3px] font-JetBrainsMono text-[12px] uppercase ${cls}`}>{children}</span>
}

const btn = {
  primary: 'bg-primary text-white hover:bg-ink-hover disabled:bg-primary/30',
  ghost: 'border border-primary/10 text-primary hover:bg-card disabled:opacity-40',
}
export function Button({
  children,
  onClick,
  disabled,
  variant = 'primary',
  type = 'button',
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: keyof typeof btn
  type?: 'button' | 'submit'
  className?: string
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-[48px] items-center justify-center gap-[8px] rounded-[8px] px-[22px] text-[16px] font-[500] duration-150 disabled:cursor-not-allowed ${btn[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function ButtonLink({ to, children, variant = 'primary' }: { to: string; children: ReactNode; variant?: keyof typeof btn }) {
  return (
    <Link to={to} className={`inline-flex h-[48px] items-center justify-center rounded-[8px] px-[22px] text-[16px] font-[500] duration-150 ${btn[variant]}`}>
      {children}
    </Link>
  )
}

export function Address({ value, href }: { value: string; href?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <span className="inline-flex items-center gap-[8px] font-JetBrainsMono text-[13px] text-primary/70">
      <a href={href ?? explorerAccount(value)} target="_blank" rel="noopener noreferrer" className="underline decoration-primary/20 hover:text-primary" title={value}>
        {short(value)}
      </a>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard?.writeText(value).then(() => {
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1200)
          })
        }}
        className="rounded-[6px] px-[6px] py-[2px] text-[11px] text-primary/50 hover:bg-chip hover:text-primary"
        aria-label="Copy address"
      >
        {copied ? 'COPIED' : 'COPY'}
      </button>
    </span>
  )
}

export function CoinAvatar({ image, symbol, size = 40 }: { image: string | null; symbol: string; size?: number }) {
  return (
    <span className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-chip font-JetBrainsMono text-[11px] text-primary/60" style={{ width: size, height: size }}>
      {image ? <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" /> : symbol.slice(0, 3)}
    </span>
  )
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="h-[6px] w-full overflow-hidden rounded-full bg-chip" role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(2, value * 100)}%` }} />
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-[6px] bg-chip ${className}`} />
}

export function Empty({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-[12px] rounded-[8px] border border-dashed border-primary/15 p-[28px]">
      <div className="text-[20px] font-[500]">{title}</div>
      <p className="text-[16px] leading-[24px] text-muted max-w-[560px]">{text}</p>
      {action}
    </div>
  )
}

export function ErrorNote({ error }: { error: unknown }) {
  const msg = error instanceof Error ? error.message : String(error)
  return <div className="rounded-[8px] border border-[#B42318]/25 bg-white p-[16px] text-[15px] leading-[21px] text-[#B42318] break-words">{msg}</div>
}

/* ---------- Wallet ---------- */

export function WalletButton({ compact = false }: { compact?: boolean }) {
  const w = useWallet()
  const { data } = useBalances(w.publicKey)
  if (!w.configured) {
    return (
      <span className="inline-flex h-[44px] items-center rounded-[8px] border border-primary/10 px-[16px] font-JetBrainsMono text-[12px] text-primary/50">
        WALLET NOT CONFIGURED
      </span>
    )
  }
  if (w.connected && w.address) {
    return (
      <button
        type="button"
        onClick={w.manage}
        className="inline-flex h-[44px] items-center gap-[10px] rounded-[8px] bg-primary px-[16px] text-white duration-150 hover:bg-ink-hover"
      >
        <span className="h-[8px] w-[8px] rounded-full bg-accent" aria-hidden="true" />
        <span className="font-JetBrainsMono text-[13px]">{short(w.address)}</span>
        {!compact && data ? <span className="text-[14px] text-white/60">{fmtSol(data.lamports)}</span> : null}
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={w.connect}
      className="inline-flex h-[44px] items-center rounded-[8px] bg-primary px-[18px] text-[15px] font-[500] text-white duration-150 hover:bg-ink-hover"
    >
      {w.connecting ? 'Connecting...' : 'Connect wallet'}
    </button>
  )
}

/** Wraps wallet-only content: explains setup, or asks to connect, before rendering children. */
export function ConnectGate({ children, title, text }: { children: ReactNode; title: string; text: string }) {
  const w = useWallet()
  if (!w.configured) {
    return (
      <Empty
        title="Wallet connection is not configured"
        text="Set VITE_REOWN_PROJECT_ID in .env with a project ID from Reown Cloud (cloud.reown.com), then restart the app."
      />
    )
  }
  if (!w.connected) {
    return (
      <Empty
        title={title}
        text={text}
        action={
          <Button onClick={w.connect} className="mt-[4px]">
            {w.connecting ? 'Connecting...' : 'Connect wallet'}
          </Button>
        }
      />
    )
  }
  return <>{children}</>
}
