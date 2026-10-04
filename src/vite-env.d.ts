/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 'devnet' (default) or 'mainnet-beta' */
  readonly VITE_SOLANA_CLUSTER?: string
  /** Optional custom RPC endpoint (Helius, Triton, QuickNode...) */
  readonly VITE_SOLANA_RPC?: string
  /** Public key of the desk payout authority. Each X account vault is derived from it. */
  readonly VITE_DESK_BASE_ADDRESS?: string
  /** Reown (WalletConnect) Cloud project ID for the AppKit wallet modal */
  readonly VITE_REOWN_PROJECT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
