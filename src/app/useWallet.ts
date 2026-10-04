import { createContext, useContext } from 'react'
import type { PublicKey } from '@solana/web3.js'
import type { Provider } from '@reown/appkit-adapter-solana/react'

export type WalletState = {
  /** false when VITE_REOWN_PROJECT_ID is missing */
  configured: boolean
  connected: boolean
  connecting: boolean
  address: string | null
  publicKey: PublicKey | null
  provider: Provider | null
  connect: () => void
  manage: () => void
  disconnect: () => void
}

const noop = () => undefined
export const UNCONFIGURED: WalletState = {
  configured: false,
  connected: false,
  connecting: false,
  address: null,
  publicKey: null,
  provider: null,
  connect: noop,
  manage: noop,
  disconnect: noop,
}

export const WalletCtx = createContext<WalletState>(UNCONFIGURED)
export const useWallet = () => useContext(WalletCtx)

