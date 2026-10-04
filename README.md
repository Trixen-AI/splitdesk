# Splitdesk

Launch it. Split it. Get paid on X.

Launch a pump.fun coin on Solana, assign its creator fees to the X accounts behind it, and let the desk pay them out in USD through X Money.

## Run

```bash
npm install
cp .env.example .env   # fill in the values you need
npm run dev            # site + /api handlers on one Vite server
npm run build          # typecheck + production build
npm run lint
npm run build:logo     # regenerate logo SVG/PNG exports after changing the mark
```

## Deploy on Vercel (splitdesk.fun)

1. Import the GitHub repo in Vercel. `vercel.json` already sets the Vite build, the `dist` output, SPA rewrites (everything except `/api/*` serves `index.html`) and the serverless functions in `api/`.
2. Add the environment variables (Settings > Environment Variables, Production and Preview):

   | Variable | Needed | Notes |
   |---|---|---|
   | `VITE_REOWN_PROJECT_ID` | **Yes** | From cloud.reown.com. Add `splitdesk.fun` and your `*.vercel.app` URL to the project's allowed domains, or the wallet modal will refuse to connect. |
   | `VITE_SOLANA_CLUSTER` | No | `mainnet-beta` (default) or `devnet`. |
   | `VITE_SOLANA_RPC` | Recommended | Dedicated RPC URL. Empty falls back to Reown's RPC. |
   | `VITE_DESK_BASE_ADDRESS` | No | Desk payout authority. Empty = the creator's wallet controls the vaults. |
   | `DESK_WEBHOOK_URL` | For payouts | Receives launches and payout requests. Without it, payout requests return 501 on Vercel. |

   No API key is needed for metadata: uploads go through pump.fun's public IPFS endpoint.
3. Domains: add `splitdesk.fun` (and `www.splitdesk.fun` redirecting to it) under Settings > Domains, then set the DNS records Vercel shows at your registrar.
4. Redeploy after changing any `VITE_*` variable: they are baked into the build.

SEO: `index.html` carries the canonical URL, Open Graph / X card (`public/og-image.png`, built by `npm run build:og`) and JSON-LD; `public/robots.txt`, `public/sitemap.xml` and `public/site.webmanifest` ship as static files; `src/lib/seo.ts` updates title, description and canonical per route and marks `/app` as noindex.

## The app (`/app`)

Wallet connection is Reown AppKit (Solana adapter). Set `VITE_REOWN_PROJECT_ID` from [cloud.reown.com](https://cloud.reown.com). Every figure is read live from Solana for the connected wallet; nothing is mocked.

| Page | What it does | Data source |
|---|---|---|
| `/app` Overview | Wallet SOL/USDC, coins with a split, pending fees, X accounts paid, recent activity | RPC balances, Pump Fees configs, creator vaults |
| `/app/launch` | Pin metadata, create the coin, open fee sharing, lock the split (one signing step) | `@pump-fun/pump-sdk` |
| `/app/coins` | Every coin whose fee sharing this wallet set up | `getProgramAccounts` on Pump Fees, `admin` at offset 43 |
| `/app/coins/:mint` | Curve progress, market cap, pending fees, the on-chain split mapped to X handles, **Distribute fees** | bonding curve, `SharingConfig`, `getCreatorVaultQuoteBalances`, `buildDistributeCreatorFeesInstructions` |
| `/app/payouts` | Any handle: its vault, coins paying it, its share; request a payout through X Money | shareholder `memcmp` at offsets 80 + 34·i |
| `/app/activity` | The wallet's pump.fun / Pump Fees / PumpSwap transactions, decoded with the programs' IDLs | `getSignaturesForAddress` + parsed transactions |

A dedicated RPC (`VITE_SOLANA_RPC`) is recommended on mainnet: the coin and payout lookups use filtered `getProgramAccounts`, which public endpoints rate-limit.

## How a launch works

The launch desk (`/app/launch`) uses the official `@pump-fun/pump-sdk` (see [pump-fun/pump-public-docs](https://github.com/pump-fun/pump-public-docs)):

1. **Upload metadata**: `POST /api/metadata` forwards the image and fields to pump.fun's public IPFS endpoint (`https://pump.fun/api/ipfs`, no API key). The browser cannot call it directly (no CORS), so the server route proxies it.
2. **Sign once**: the wallet signs every transaction in one `signAllTransactions` step:
   - `create_v2` (Token-2022 coin on the bonding curve, USDC pair by default) + `create_fee_sharing_config` (moved to the next transaction when a long name on a USDC pair would overflow the 1232-byte packet)
   - payout vault readiness: rent for SOL pairs, USDC token accounts for USDC pairs
   - `update_fee_shares_v2`: one shareholder per X account, shares in bps totalling 10,000; this locks the list
   - a memo recording handle -> share, sent with a 0-lamport touch of `createWithSeed(mint, "splitdesk:v1")` so the dashboard can find it by mint. Labels are only shown when the handle re-derives to the on-chain shareholder address
3. **Record**: `POST /api/launches` hands the launch to the desk (`DESK_WEBHOOK_URL`, or `.data/launches.json` locally).

Each X account's payout vault is `createWithSeed(authority, "x:<handle>", SystemProgram)`, where the authority is `VITE_DESK_BASE_ADDRESS` when set, otherwise the creator's own wallet: anyone can recompute it, only the desk key can move funds out. The desk sweeps fees with `distribute_creator_fees_v2` and pays each account in USD through X Money after it signs in with X.


## What is not in this repo

- The desk payout service itself (fee sweeps, X sign-in, X Money transfers). X Money has no public payout API that this project integrates with, so `/api/launches` stops at handing the record to `DESK_WEBHOOK_URL`.

## Placeholders to fill

- `src/data/site.ts` → `SOCIALS`: the X link points at `https://x.com`. Replace it with the real profile, or delete the entry.
- `src/pages/Legal.tsx`: placeholder privacy and terms copy.

## Brand

- Logo: `public/brand/logo.svg`, `logo-dark.svg`, `logo-500.png`, `logo-500-transparent.png`, favicon `public/favicon.svg`. Built by `scripts/build-logo.mjs` (wordmark outlined from Mozilla Text 600).
- X mark: official path from x.com, unmodified (`src/components/brand/XLogo.tsx`).

Splitdesk is independent and not affiliated with X Corp., pump.fun or the Solana Foundation.
