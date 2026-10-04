import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana, solanaDevnet } from '@reown/appkit/networks'
import { CLUSTER } from '@/launch/config'

export const REOWN_PROJECT_ID = import.meta.env.VITE_REOWN_PROJECT_ID ?? ''

const network = CLUSTER === 'mainnet-beta' ? solana : solanaDevnet

// Created once per page load (the dashboard chunk is only loaded on /app).
export const appKit = REOWN_PROJECT_ID
  ? createAppKit({
      adapters: [new SolanaAdapter()],
      networks: [network],
      defaultNetwork: network,
      projectId: REOWN_PROJECT_ID,
      metadata: {
        name: 'Splitdesk',
        description: 'Launch a pump.fun coin, split its creator fees across X accounts, paid out in USD.',
        url: window.location.origin,
        icons: [`${window.location.origin}/brand/logo-500.png`],
      },
      features: { analytics: false, email: false, socials: false, swaps: false, onramp: false, send: false, history: false },
      allowUnsupportedChain: false,
      themeMode: 'light',
      themeVariables: {
        '--w3m-accent': '#17181A',
        '--w3m-color-mix': '#EDF0E8',
        '--w3m-color-mix-strength': 20,
        '--w3m-font-family': "'Mozilla Text', system-ui, sans-serif",
        '--w3m-border-radius-master': '2px',
        '--w3m-z-index': 200,
      },
    })
  : null
