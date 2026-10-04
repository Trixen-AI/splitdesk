// Coins this browser launched or opened, per wallet. The chain stays the source of truth:
// this only makes a fresh launch show up before the RPC index catches up.
const KEY = 'splitdesk:coins:v1'

type Entry = { mint: string; at: number }
type Store = { v: 1; byWallet: Record<string, Entry[]> }

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? (JSON.parse(raw) as Store) : null
    return parsed && parsed.v === 1 ? parsed : { v: 1, byWallet: {} }
  } catch {
    return { v: 1, byWallet: {} }
  }
}

export function registryMints(wallet: string): string[] {
  return (read().byWallet[wallet] ?? []).map((e) => e.mint)
}

export function rememberMint(wallet: string, mint: string) {
  try {
    const s = read()
    const list = (s.byWallet[wallet] ?? []).filter((e) => e.mint !== mint)
    s.byWallet[wallet] = [{ mint, at: Date.now() }, ...list].slice(0, 100)
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    // storage blocked: the on-chain lookup still finds the coin
  }
}
