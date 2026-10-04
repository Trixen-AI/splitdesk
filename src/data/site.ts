// All Splitdesk copy and link data in one place.

export const BRAND = {
  name: 'Splitdesk',
  year: 2026,
}

// Social / community links.
export const SOCIALS = [{ key: 'x', label: 'Splitdesk on X', href: 'https://x.com/Splitdesk_' }] as const

export const PUMP_DOCS_URL = 'https://github.com/pump-fun/pump-public-docs'

// Header call to action into the app
export const LAUNCH_APP = { label: 'Launch App', href: '/app' }

export type NavItem = { label: string; href: string; menu?: boolean }
export const NAV: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Desk', href: '/#how-it-works', menu: true },
  { label: 'Fees', href: '/notes/fee-sharing-on-pump' },
  { label: 'Notes', href: '/#notes' },
]

export type DeskPillar = { key: 'launch' | 'split' | 'sweep' | 'payout'; title: string; text: string; href: string }
export const DESK_MENU = {
  label: 'THE DESK',
  pillars: [
    {
      key: 'launch',
      title: 'Launch',
      text: 'Create a pump.fun coin with its metadata pinned to IPFS and the split attached from the start.',
      href: '/app/launch',
    },
    {
      key: 'split',
      title: 'Split',
      text: 'Up to ten X accounts, shares set in basis points and locked before the first trade.',
      href: '/app/launch#split',
    },
    {
      key: 'sweep',
      title: 'Sweep',
      text: 'Creator fees from the bonding curve and PumpSwap collected into each account vault.',
      href: '/app/coins',
    },
    {
      key: 'payout',
      title: 'Payout',
      text: 'USDC turned into dollars and sent to every account through X Money, no wallet needed.',
      href: '/app/payouts',
    },
  ] satisfies DeskPillar[],
}

export const HERO = {
  titleLines: ['Launch it. Split it.', 'Get paid on X.'],
  columns: [
    { label: 'LAUNCH', lines: ['Create a pump.fun coin', 'from one Solana form'] },
    { label: 'PAYOUT', lines: ['Creator fees split across X accounts,', 'paid out in USD through X Money.'] },
  ],
}

export const IDEA = {
  label: 'THE IDEA',
  lead: 'Launch a token and assign its creator fees to the X accounts behind it. ',
  quiet:
    'The artist who drew the mascot, the account that posted it first, the friend who kept the replies going all week, the trader who called it early. ',
  close: 'Each of them gets a fixed share, written on-chain before the first trade.',
  body: 'Splitdesk is a launch desk built on Solana. It creates your coin on pump.fun, sets up pump.fun fee sharing for up to ten X accounts, collects the fees in USDC and pays each account in US dollars through X Money.',
}

export const SPLIT = {
  label: 'THE SPLIT',
  text: 'Name the accounts, set the shares, sign once. From then on every trade pays the people who made the coin, in dollars.',
  images: [
    { key: 'shares', chip: 'SHARES ON-CHAIN' },
    { key: 'usd', chip: 'PAID IN USD' },
  ] as const,
}

export const WHY = {
  label: 'WHY A DESK',
  lead: 'A coin is made by a crew, but its fees go to one wallet. ',
  quiet:
    'Whoever clicked create keeps every cent, and splitting it later means trusting that person, tracking trades in a spreadsheet and chasing transfers across five wallets that change every week.',
  body: 'Splitdesk sets the split at launch with the pump.fun fee sharing program, so the shares are locked before trading opens and anyone can check them on Solana.',
  pills: ['Pump.fun Native', 'Up to 10 Accounts', 'Paid in USD'],
  listLabel: 'THE DESK TAKES CARE OF:',
  list: [
    'Creating the coin on pump.fun from a single form',
    'Locking each X account share in basis points before the first trade',
    'Collecting creator fees in USDC on a schedule and paying every named account in dollars through X Money, with no wallet or seed phrase needed on their side',
  ],
}

export type Step = { title: string; text: string; icon: 'draft' | 'handles' | 'sign' | 'lock' | 'trade' | 'payout' }
export const HOW = {
  title: 'How It Works',
  steps: [
    {
      icon: 'draft',
      title: 'DRAFT THE COIN',
      text: 'Name, ticker, image and links. We pin the metadata to IPFS and show you the exact record pump.fun will read before anything is signed.',
    },
    {
      icon: 'handles',
      title: 'ADD THE X ACCOUNTS',
      text: 'List up to ten handles and set each share until the total reads 100%. The split is saved inside the coin metadata, so it is public from the start.',
    },
    {
      icon: 'sign',
      title: 'SIGN ONCE',
      text: 'Your wallet approves the whole launch in one signing step. The coin is created with create_v2 and a fee sharing config is opened for it right away.',
    },
    {
      icon: 'lock',
      title: 'LOCK THE SHARES',
      text: 'The share list is written to the pump.fun fee program and the admin key is given up, so no one can change who gets paid after launch.',
    },
    {
      icon: 'trade',
      title: 'TRADES EARN FEES',
      text: 'Every buy and sell on the bonding curve, and later on PumpSwap after graduation, adds to the creator vault. The desk sweeps it on a schedule.',
    },
    {
      icon: 'payout',
      title: 'PAID OUT ON X',
      text: 'Fees settle in USDC, the desk converts them to dollars and sends each account its share through X Money. Accounts claim by signing in with X.',
    },
  ] satisfies Step[],
}

export const PROMISE = {
  label: 'THE PAYOUT PROMISE',
  parts: [
    { text: 'Every account named at launch gets paid; ', quiet: false },
    { text: 'no wallet setup, no seed phrase, no chasing the dev; ', quiet: true },
    { text: 'the share it was promised, in dollars, ', quiet: false },
    { text: 'on X Money, with each payout traceable to a fee sweep on Solana that anyone can look up.', quiet: true },
  ],
}

export type Note = {
  slug: string
  art: 'shares' | 'dollars'
  title: string
  excerpt: string
  date: string
  body: { heading?: string; text: string }[]
}
export const NOTES: { title: string; more: string; items: Note[] } = {
  title: 'Notes',
  more: 'All notes >',
  items: [
    {
      slug: 'fee-sharing-on-pump',
      art: 'shares',
      title: 'How fee sharing works on pump.fun',
      date: 'October 2026',
      excerpt:
        'Pump.fun lets the creator fees of a coin be split between up to ten addresses through its fee program. This note walks through the instructions Splitdesk sends at launch and what each one changes on-chain, from create_v2 to the moment the share list is locked for good.',
      body: [
        {
          text: 'Every trade on a pump.fun bonding curve pays a small creator fee. By default that fee collects in a vault that only the creator wallet can sweep. Pump.fun also ships a fee program that can split the vault between up to ten addresses, with shares written in basis points that must add up to exactly 10,000.',
        },
        {
          heading: '1. create_v2',
          text: 'The coin is created as a Token-2022 mint on the bonding curve. Splitdesk pairs it with USDC by default, so the creator fee is collected in dollars rather than SOL. You can switch the pair to SOL on the launch form.',
        },
        {
          heading: '2. create_fee_sharing_config',
          text: 'In the same signing step we open a sharing config for the mint, inside the create transaction when it fits. From that point the creator vault answers to the config rather than to a single wallet.',
        },
        {
          heading: '3. update_fee_shares_v2',
          text: 'A second step writes the final share list: one payout vault per X account, each with its basis points. Writing the list revokes the admin, so the split cannot be edited afterwards. Every vault address is derived from the desk key and the X handle, so anyone can recompute it.',
        },
        {
          heading: '4. distribute_creator_fees_v2',
          text: 'As trading runs, the desk calls the distribute instruction on a schedule. It pays the vault balance out to each share address in proportion to its basis points. After graduation the PumpSwap side is swept into the same flow first.',
        },
        {
          heading: 'Checking a split yourself',
          text: 'The share list lives in the sharing config account for the mint, and a copy of the handles sits in the coin metadata on IPFS. If the two ever disagree, the on-chain config is what pays.',
        },
      ],
    },
    {
      slug: 'paid-in-dollars',
      art: 'dollars',
      title: 'Why the desk pays out in dollars and not in SOL or the coin itself',
      date: 'October 2026',
      excerpt:
        'Most people who help a coin take off do not want to manage a Solana wallet. Pairing launches with USDC and settling to X Money keeps the payout where they already spend their day, and keeps the amount readable in plain dollars instead of a token price that moves by the minute.',
      body: [
        {
          text: 'The people behind a coin are rarely all on-chain natives. The illustrator, the account that broke it, the moderator who kept the community going: many of them have an X account and nothing else. Asking each one for a wallet address is where most informal splits fall apart.',
        },
        {
          heading: 'USDC in, dollars out',
          text: 'Launches default to a USDC pair, so creator fees accrue as dollars on Solana. When the desk sweeps a vault, the amount is already stable. There is no swap at payout time and no price risk between the trade and the transfer.',
        },
        {
          heading: 'Claiming with X',
          text: 'A named account signs in to the desk with X. Once the handle is confirmed, its balance is paid to the X Money account linked to that profile. The account never needs a seed phrase.',
        },
        {
          heading: 'What stays on-chain',
          text: 'Every sweep that funds a payout is a Solana transaction you can look up. The desk publishes the sweep signature next to each payout, so the trail from trade to dollars stays public.',
        },
      ],
    },
  ],
}

export const FOLLOW = {
  title: 'Desk updates live on X',
  sub: 'Launches, sweeps and payout days',
  button: 'Follow Us',
}

export const FOOTER = {
  taglineLines: ['A Solana launch desk for coins made by a crew.', 'Creator fees split across X accounts, paid in USD.'],
  colA: [
    { label: 'Home', href: '/' },
    { label: 'Desk', href: '/#how-it-works' },
  ],
  colB: [
    { label: 'Fees', href: '/notes/fee-sharing-on-pump' },
    { label: 'Notes', href: '/#notes' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/legal#privacy' },
    { label: 'Terms of Use', href: '/legal#terms' },
    { label: 'Pump Docs', href: PUMP_DOCS_URL },
  ],
}

export const MOBILE_MENU = {
  sections: { menu: 'Menu', resources: 'Resources', community: 'Community' },
}
