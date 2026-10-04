import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useSWRConfig } from 'swr'
import { PublicKey } from '@solana/web3.js'
import { buildLaunch, sendAndConfirm, type Quote } from '@/launch/buildLaunch'
import { CLUSTER, DESK_BASE, explorerAccount, explorerTx, LIMITS, pumpCoinUrl } from '@/launch/config'
import { deskVaultFor, evenSplit, HANDLE_RE, normalizeHandle, toBps, validateShares, type ShareRow } from '@/launch/desk'
import { connection } from '../chain'
import { rememberMint } from '../registry'
import { Button, PageHeader } from '../ui'
import { useWallet } from '../useWallet'

type Pinned = { uri: string; image: string; metadata: unknown }
type StepState = { label: string; status: 'waiting' | 'sending' | 'done' | 'failed'; sig?: string }

const short = (s: string) => `${s.slice(0, 4)}...${s.slice(-4)}`
let rowSeq = 1
const newRow = (pct = ''): ShareRow => ({ id: `r${rowSeq++}`, handle: '', pct })
const SLICE_COLORS = ['#17181A', '#B6F03C', '#1F8A4C', '#73766E', '#CDD1C6', '#2B2E2A', '#86C21A', '#A3A89C', '#3FB774', '#DFE2D9']

const input =
  'w-full rounded-[8px] border border-line bg-white px-[16px] py-[13px] text-[18px] leading-[24px] text-primary outline-none duration-150 placeholder:text-primary/30 focus:border-primary'

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-[10px]">
        <span className="font-JetBrainsMono text-[14px] text-primary/60 uppercase">{label}</span>
        {hint && <span className="font-JetBrainsMono text-[13px] text-primary/40">{hint}</span>}
      </div>
      {children}
    </label>
  )
}

function Block({ n, title, id, children }: { n: string; title: string; id?: string; children: ReactNode }) {
  return (
    <section id={id} className="border-t border-line py-[40px] max-lg:py-[28px]">
      <div className="flex items-center gap-[24px] mb-[28px]">
        <span className="font-JetBrainsMono text-primary/60 text-[18px]">{n}</span>
        <h2 className="font-[500] text-primary text-[30px] max-lg:text-[22px] leading-[1.3]">{title}</h2>
      </div>
      {children}
    </section>
  )
}

export default function LaunchPage() {
  const wallet = useWallet()
  const { mutate } = useSWRConfig()

  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [website, setWebsite] = useState('')
  const [twitter, setTwitter] = useState('')
  const [telegram, setTelegram] = useState('')
  const [quote, setQuote] = useState<Quote>('usdc')
  const [rows, setRows] = useState<ShareRow[]>([newRow('100.00')])
  const [vaults, setVaults] = useState<Record<string, PublicKey>>({})
  const [pinned, setPinned] = useState<Pinned | null>(null)
  const [busy, setBusy] = useState(false)
  const [stage, setStage] = useState<'idle' | 'pinning' | 'approving' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [steps, setSteps] = useState<StepState[]>([])
  const [mint, setMint] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Any edit after pinning means the pinned record is stale.
  const edit = <T,>(set: (v: T) => void) => (v: T) => {
    set(v)
    setPinned(null)
    setError(null)
  }

  const preview = useMemo(() => (image ? URL.createObjectURL(image) : null), [image])
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview)
    },
    [preview],
  )

  // Vault authority: the desk key when one is configured, otherwise the creator's own wallet,
  // so the vaults are always controlled by a key that exists.
  const authorityKey = (DESK_BASE ?? wallet.publicKey)?.toBase58() ?? null

  // Payout vault per handle, derived from the authority
  useEffect(() => {
    let live = true
    if (!authorityKey) return
    const authority = new PublicKey(authorityKey)
    const handles = [...new Set(rows.map((r) => normalizeHandle(r.handle)).filter((h) => HANDLE_RE.test(h)))]
    Promise.all(handles.map(async (h) => [h, await deskVaultFor(authority, h)] as const)).then((pairs) => {
      if (live) setVaults(Object.fromEntries(pairs))
    })
    return () => {
      live = false
    }
  }, [rows, authorityKey])

  const shareError = validateShares(rows)
  const bps = toBps(rows)
  const totalPct = bps.reduce((a, b) => a + b, 0) / 100
  const coinError = !name.trim()
    ? 'Give the coin a name.'
    : !symbol.trim()
      ? 'Give the coin a ticker.'
      : !image
        ? 'Add an image for the coin.'
        : null
  const formError = coinError ?? shareError
  const launched = mint !== null

  const shares = useMemo(
    () =>
      rows.map((r, i) => {
        const h = normalizeHandle(r.handle)
        return { handle: h, bps: bps[i], vault: vaults[h] }
      }),
    [rows, bps, vaults],
  )

  function onImage(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(f.type)) return setError('Image must be PNG, JPG, GIF or WebP.')
    if (f.size > LIMITS.imageBytes) return setError('Image must be 4 MB or smaller.')
    edit(setImage)(f)
  }

  const setRow = (id: string, patch: Partial<ShareRow>) => edit(setRows)(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))

  async function pinMetadata(): Promise<Pinned> {
    if (!image || !authorityKey) throw new Error('Connect a wallet first.')
    const form = new FormData()
      form.append('name', name.trim())
      form.append('symbol', symbol.trim())
      form.append('description', description.trim())
      form.append('image', image)
      form.append('website', website.trim())
      form.append('twitter', twitter.trim())
      form.append('telegram', telegram.trim())
    form.append('quote', quote)
    const res = await fetch('/api/metadata', { method: 'POST', body: form })
    const out = await res.json().catch(() => ({ error: `Metadata upload returned ${res.status}` }))
    if (!res.ok) throw new Error(out.error ?? `Metadata upload returned ${res.status}`)
    return out as Pinned
  }

  // One click: pin the metadata (reused if nothing changed), then the wallet approves the launch.
  async function createCoin() {
    if (formError || !wallet.publicKey || !wallet.provider) return
    if (shares.some((s) => !s.vault)) return setError('Payout vaults are still being derived. Try again in a moment.')
    setBusy(true)
    setError(null)
    try {
      setStage('pinning')
      const meta = pinned ?? (await pinMetadata())
      setPinned(meta)
      setStage('approving')
      const plan = await buildLaunch({
        connection,
        creator: wallet.publicKey,
        name: name.trim(),
        symbol: symbol.trim(),
        uri: meta.uri,
        quote,
        shares: shares.map((s) => ({ handle: s.handle, bps: s.bps, vault: s.vault! })),
        authority: new PublicKey(authorityKey!),
      })
      const state: StepState[] = plan.steps.map((s) => ({ label: s.label, status: 'waiting' }))
      setSteps([...state])
      const signed = await wallet.provider.signAllTransactions(plan.steps.map((s) => s.tx))
      const sigs: string[] = []
      for (let i = 0; i < signed.length; i++) {
        state[i] = { ...state[i], status: 'sending' }
        setSteps([...state])
        try {
          const sig = await sendAndConfirm(connection, signed[i])
          sigs.push(sig)
          state[i] = { ...state[i], status: 'done', sig }
          setSteps([...state])
        } catch (err) {
          state[i] = { ...state[i], status: 'failed' }
          setSteps([...state])
          throw err
        }
      }
      const mintAddress = plan.mint.publicKey.toBase58()
      setMint(mintAddress)
      rememberMint(wallet.publicKey.toBase58(), mintAddress)
      void mutate(['my-coins', wallet.publicKey.toBase58()])
      await fetch('/api/launches', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          mint: mintAddress,
          creator: wallet.publicKey.toBase58(),
          cluster: CLUSTER,
          quote,
          uri: meta.uri,
          signatures: sigs,
          shares: shares.map((s) => ({ handle: s.handle, bps: s.bps, vault: s.vault!.toBase58() })),
        }),
      }).catch(() => undefined)
      setStage('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setStage('idle')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div>
        <PageHeader
          label="CREATE COIN"
          title="Create a coin with the split built in"
          text="Created on pump.fun, creator fees assigned to the X accounts behind it, paid out in USD through X Money."
        />

        <div className="grid grid-cols-[minmax(0,1fr)_420px] gap-[64px] max-xl:grid-cols-1 max-xl:gap-[24px]">
          <div>
            <Block n="01" title="The coin">
              <div className="grid grid-cols-[176px_minmax(0,1fr)] gap-[32px] max-md:grid-cols-1">
                <div>
                  <div className="font-JetBrainsMono text-[14px] text-primary/60 mb-[10px]">IMAGE</div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex h-[176px] w-[176px] items-center justify-center overflow-hidden rounded-[8px] border border-dashed border-primary/20 bg-card duration-150 hover:bg-card-hover"
                    aria-label="Choose coin image"
                  >
                    {preview ? (
                      <img src={preview} alt="Coin preview" className="h-full w-full object-cover" />
                    ) : (
                      <span className="px-[16px] text-center text-[15px] leading-[20px] text-primary/50">PNG, JPG, GIF or WebP, up to 4 MB</span>
                    )}
                  </button>
                  <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={onImage} />
                </div>
                <div className="flex flex-col gap-[20px]">
                  <Field label="Name" hint={`${name.length}/${LIMITS.name}`}>
                    <input className={input} value={name} maxLength={LIMITS.name} placeholder="Crew Coin" onChange={(e) => edit(setName)(e.target.value)} />
                  </Field>
                  <Field label="Ticker" hint={`${symbol.length}/${LIMITS.symbol}`}>
                    <input
                      className={`${input} font-JetBrainsMono uppercase`}
                      value={symbol}
                      maxLength={LIMITS.symbol}
                      placeholder="CREW"
                      onChange={(e) => edit(setSymbol)(e.target.value.toUpperCase().replace(/\s/g, ''))}
                    />
                  </Field>
                </div>
              </div>
              <div className="mt-[20px]">
                <Field label="Description" hint={`${description.length}/${LIMITS.description}`}>
                  <textarea
                    className={`${input} min-h-[112px] resize-y`}
                    value={description}
                    maxLength={LIMITS.description}
                    placeholder="What the coin is and who made it"
                    onChange={(e) => edit(setDescription)(e.target.value)}
                  />
                </Field>
              </div>
            </Block>

            <Block n="02" title="Links">
              <div className="grid grid-cols-3 gap-[20px] max-md:grid-cols-1">
                <Field label="Website">
                  <input className={input} value={website} placeholder="https://" onChange={(e) => edit(setWebsite)(e.target.value)} />
                </Field>
                <Field label="X">
                  <input className={input} value={twitter} placeholder="https://x.com/" onChange={(e) => edit(setTwitter)(e.target.value)} />
                </Field>
                <Field label="Telegram">
                  <input className={input} value={telegram} placeholder="https://t.me/" onChange={(e) => edit(setTelegram)(e.target.value)} />
                </Field>
              </div>
            </Block>

            <Block n="03" title="The split" id="split">
              <p className="text-muted text-[18px] leading-[26px] mb-[24px] max-w-[760px]">
                Name up to ten X accounts and give each one a share. The list is written to the pump.fun fee program and locked at launch. Each
                account is paid from its own vault, derived from its handle.
              </p>
              <div className="flex flex-col gap-[12px]">
                {rows.map((r, i) => {
                  const h = normalizeHandle(r.handle)
                  const vault = vaults[h]
                  return (
                    <div key={r.id} className="grid grid-cols-[minmax(0,1fr)_140px_150px_40px] items-center gap-[12px] max-md:grid-cols-[minmax(0,1fr)_110px_40px]">
                      <div className="relative">
                        <span className="pointer-events-none absolute left-[16px] top-1/2 -translate-y-1/2 text-[18px] text-primary/40">@</span>
                        <input
                          className={`${input} pl-[36px]`}
                          value={r.handle}
                          placeholder={`handle${i + 1}`}
                          aria-label={`X handle ${i + 1}`}
                          onChange={(e) => setRow(r.id, { handle: e.target.value })}
                        />
                      </div>
                      <div className="relative">
                        <input
                          className={`${input} pr-[36px] text-right font-JetBrainsMono`}
                          inputMode="decimal"
                          value={r.pct}
                          placeholder="0.00"
                          aria-label={`Share for handle ${i + 1}, percent`}
                          onChange={(e) => setRow(r.id, { pct: e.target.value.replace(/[^\d.]/g, '') })}
                        />
                        <span className="pointer-events-none absolute right-[16px] top-1/2 -translate-y-1/2 text-[18px] text-primary/40">%</span>
                      </div>
                      <div className="font-JetBrainsMono text-[13px] text-primary/50 truncate max-md:hidden" title={vault?.toBase58()}>
                        {vault ? (
                          <a href={explorerAccount(vault.toBase58())} target="_blank" rel="noopener noreferrer" className="underline decoration-primary/20">
                            {short(vault.toBase58())}
                          </a>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        disabled={rows.length === 1}
                        onClick={() => edit(setRows)(rows.filter((x) => x.id !== r.id))}
                        className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-card duration-150 hover:bg-card-hover disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label={`Remove handle ${i + 1}`}
                      >
                        <svg viewBox="0 0 16 16" className="h-[14px] w-[14px]" aria-hidden="true">
                          <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="#17181A" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
              <div className="mt-[20px] flex flex-wrap items-center gap-[12px]">
                <button
                  type="button"
                  disabled={rows.length >= LIMITS.handles}
                  onClick={() => edit(setRows)([...rows, newRow('')])}
                  className="rounded-full border border-primary/10 px-[20px] py-[10px] text-[16px] font-[500] duration-150 hover:bg-card disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  + Add account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const even = evenSplit(rows.length)
                    edit(setRows)(rows.map((r, i) => ({ ...r, pct: even[i] })))
                  }}
                  className="rounded-full border border-primary/10 px-[20px] py-[10px] text-[16px] font-[500] duration-150 hover:bg-card"
                >
                  Even split
                </button>
                <span className={`ml-auto font-JetBrainsMono text-[15px] ${Math.abs(totalPct - 100) < 0.001 ? 'text-money' : 'text-[#B42318]'}`}>
                  TOTAL {totalPct.toFixed(2)}%
                </span>
              </div>
              <div className="mt-[16px] flex h-[10px] w-full overflow-hidden rounded-full bg-card">
                {bps.map((b, i) => (
                  <div key={rows[i].id} style={{ width: `${Math.min(100, b / 100)}%`, background: SLICE_COLORS[i % SLICE_COLORS.length] }} />
                ))}
              </div>
            </Block>

            <Block n="04" title="Payout pair">
              <div className="grid grid-cols-2 gap-[16px] max-md:grid-cols-1" role="radiogroup" aria-label="Quote pair">
                {(
                  [
                    ['usdc', 'USDC', 'Recommended. Fees collect as dollars on Solana, so the desk pays out with no swap and no price risk.'],
                    ['sol', 'SOL', 'Fees collect in SOL. The desk converts them to USD when it sweeps, at the rate of the day.'],
                  ] as const
                ).map(([key, title, text]) => (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={quote === key}
                    onClick={() => edit(setQuote)(key)}
                    className={`rounded-[8px] border p-[24px] text-left duration-150 ${
                      quote === key ? 'border-primary bg-white' : 'border-line bg-card hover:bg-card-hover'
                    }`}
                  >
                    <div className="flex items-center gap-[12px] mb-[8px]">
                      <span className={`h-[14px] w-[14px] rounded-full border ${quote === key ? 'border-primary bg-accent' : 'border-primary/30'}`} />
                      <span className="font-JetBrainsMono text-[16px] text-primary">{title}</span>
                    </div>
                    <div className="text-[16px] leading-[22px] text-muted">{text}</div>
                  </button>
                ))}
              </div>
            </Block>
          </div>

          <aside className="xl:sticky xl:top-[100px] self-start rounded-[8px] bg-card p-[32px] max-lg:p-[20px]">
            <div className="font-JetBrainsMono text-[14px] text-primary/60 mb-[20px]">REVIEW</div>
            <div className="flex items-center gap-[16px]">
              <div className="h-[64px] w-[64px] shrink-0 overflow-hidden rounded-[8px] bg-chip">
                {preview && <img src={preview} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0">
                <div className="truncate text-[22px] font-[500] leading-[28px]">{name || 'Unnamed coin'}</div>
                <div className="font-JetBrainsMono text-[15px] text-primary/60">${symbol || 'TICKER'}</div>
              </div>
            </div>

            <div className="mt-[24px] border-t border-line pt-[20px]">
              {shares.map((s, i) => (
                <div key={rows[i].id} className="flex items-center justify-between gap-[12px] py-[6px] text-[16px]">
                  <span className="flex min-w-0 items-center gap-[10px]">
                    <span className="h-[10px] w-[10px] shrink-0 rounded-full" style={{ background: SLICE_COLORS[i % SLICE_COLORS.length] }} />
                    <span className="truncate">@{s.handle || '...'}</span>
                  </span>
                  <span className="font-JetBrainsMono text-primary/70">{(s.bps / 100).toFixed(2)}%</span>
                </div>
              ))}
            </div>

            <dl className="mt-[16px] border-t border-line pt-[16px] text-[15px] leading-[22px]">
              {[
                ['Pair', quote === 'usdc' ? 'USDC' : 'SOL'],
                ['Payout', 'USD via X Money'],
                ['Programs', 'pump.fun create_v2, Pump Fees'],
                ['Network cost', quote === 'usdc' ? 'about 0.03 to 0.06 SOL' : 'about 0.02 to 0.04 SOL'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-[16px] py-[4px]">
                  <dt className="text-primary/50">{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
            </dl>

            {steps.length > 0 && (
              <ol className="mt-[20px] flex flex-col gap-[8px]">
                {steps.map((s) => (
                  <li key={s.label} className="flex items-center justify-between gap-[12px] text-[15px]">
                    <span className="flex items-center gap-[10px]">
                      <span
                        className={`h-[10px] w-[10px] rounded-full ${
                          s.status === 'done' ? 'bg-money' : s.status === 'sending' ? 'bg-accent animate-pulse' : s.status === 'failed' ? 'bg-[#B42318]' : 'bg-primary/20'
                        }`}
                      />
                      {s.label}
                    </span>
                    {s.sig && (
                      <a href={explorerTx(s.sig)} target="_blank" rel="noopener noreferrer" className="font-JetBrainsMono text-[13px] underline decoration-primary/20">
                        {short(s.sig)}
                      </a>
                    )}
                  </li>
                ))}
              </ol>
            )}

            {error && <div className="mt-[16px] text-[15px] leading-[21px] text-[#B42318] break-words">{error}</div>}
            {!error && formError && !launched && <div className="mt-[16px] text-[15px] leading-[21px] text-primary/50">{formError}</div>}

            <div className="mt-[24px]">
              {launched ? (
                <div>
                  <div className="text-[18px] font-[500]">Launched. The split is locked.</div>
                  <div className="mt-[6px] font-JetBrainsMono text-[13px] text-primary/60 break-all">{mint}</div>
                  <a
                    href={pumpCoinUrl(mint!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-[16px] flex h-[56px] w-full items-center justify-center rounded-[8px] bg-primary text-[18px] font-[500] text-white duration-150 hover:bg-ink-hover"
                  >
                    {CLUSTER === 'mainnet-beta' ? 'View on pump.fun' : 'View on Solscan'}
                  </a>
                  <Link
                    to={`/app/coins/${mint}`}
                    className="mt-[10px] flex h-[48px] w-full items-center justify-center rounded-[8px] border border-primary/10 text-[16px] font-[500] duration-150 hover:bg-white"
                  >
                    Open the coin dashboard
                  </Link>
                </div>
              ) : !wallet.publicKey ? (
                <Button onClick={wallet.connect} disabled={!wallet.configured} className="h-[56px] w-full text-[18px]">
                  {wallet.connecting ? 'Connecting...' : 'Connect wallet'}
                </Button>
              ) : (
                <button
                  type="button"
                  disabled={!!formError || busy}
                  onClick={createCoin}
                  className="flex h-[56px] w-full items-center justify-center rounded-[8px] bg-primary text-[18px] font-[500] text-white duration-150 hover:bg-ink-hover disabled:cursor-not-allowed disabled:bg-primary/30"
                >
                  {stage === 'pinning' ? 'Uploading metadata...' : stage === 'approving' && busy ? 'Approve in your wallet...' : 'Create coin'}
                </button>
              )}
            </div>

            {pinned && !launched && (
              <details className="mt-[16px]">
                <summary className="cursor-pointer font-JetBrainsMono text-[13px] text-primary/60">METADATA PUMP.FUN WILL READ</summary>
                <a href={pinned.uri} target="_blank" rel="noopener noreferrer" className="mt-[8px] block font-JetBrainsMono text-[12px] text-primary/60 underline break-all">
                  {pinned.uri}
                </a>
                <pre className="mt-[8px] max-h-[240px] overflow-auto rounded-[8px] bg-white p-[12px] font-JetBrainsMono text-[12px] leading-[17px] text-primary/80">
                  {JSON.stringify(pinned.metadata, null, 2)}
                </pre>
              </details>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

