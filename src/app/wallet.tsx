import { useMemo, type ReactNode } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useAppKit, useAppKitAccount, useAppKitProvider, useDisconnect } from '@reown/appkit/react'
import type { Provider } from '@reown/appkit-adapter-solana/react'
import { appKit } from './appkit'
import { UNCONFIGURED, WalletCtx, type WalletState } from './useWallet'

function AppKitBridge({ children }: { children: ReactNode }) {
  const { address, isConnected, status } = useAppKitAccount({ namespace: 'solana' })
  const { walletProvider } = useAppKitProvider<Provider>('solana')
  const { open } = useAppKit()
  const { disconnect } = useDisconnect()

  const value = useMemo<WalletState>(() => {
    let publicKey: PublicKey | null = null
    try {
      publicKey = isConnected && address ? new PublicKey(address) : null
    } catch {
      publicKey = null
    }
    return {
      configured: true,
      connected: publicKey !== null,
      connecting: status === 'connecting' || status === 'reconnecting',
      address: publicKey ? publicKey.toBase58() : null,
      publicKey,
      provider: publicKey ? (walletProvider ?? null) : null,
      connect: () => void open({ view: 'Connect', namespace: 'solana' }),
      manage: () => void open({ view: 'Account' }),
      disconnect: () => void disconnect({ namespace: 'solana' }),
    }
  }, [address, isConnected, status, walletProvider, open, disconnect])

  return <WalletCtx.Provider value={value}>{children}</WalletCtx.Provider>
}

export function WalletProvider({ children }: { children: ReactNode }) {
  return appKit ? <AppKitBridge>{children}</AppKitBridge> : <WalletCtx.Provider value={UNCONFIGURED}>{children}</WalletCtx.Provider>
}
