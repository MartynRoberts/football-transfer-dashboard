# Football Transfer Dashboard

A responsive football analytics web app for exploring transfers, clubs,
leagues, squads, and player values across Europe's top five leagues.

**Live app:** [football-transfer-dashboard.vercel.app](https://football-transfer-dashboard.vercel.app/)

## Features

### Transfer analysis

- Latest transfer activity across the Premier League, Bundesliga, La Liga,
  Serie A, and Ligue 1
- Current-season club spending and three-season spending efficiency
- Best-value, worst-value, and most-expensive transfer rankings
- Buyer and seller value ratings based on transfer fees and player valuations
- Responsive transfer tables that become labelled cards on small screens

### Clubs and squads

- Incoming and outgoing transfers, net spend, and squad lists
- Squad composition summaries and age and contract-expiry pyramids
- Estimated squad availability based on reported games missed
- Injury history, recurrence warnings, and league benchmarks
- Discipline totals and cards-per-match comparisons

### Player analytics

- Player profiles, positions, club details, and transfer history
- Seasonal appearances, goals, assists, and minutes played
- Injury and market-value histories
- Market-value, height, and playing-time percentile comparisons
- Search and alphabetical player browsing

## Season handling

Playing statistics and transfer activity use separate season values in
`lib/sync/scope.ts`:

- `CURRENT_SEASON` controls squads, player statistics, metrics, injuries, and
  availability/discipline analysis. It remains `25/26` until the 2026/27
  league season begins on 21 August 2026.
- `TRANSFER_SEASON` is `26/27`, allowing new-season transfers to appear while
  the summer transfer window is open.

## Tech stack

- Next.js 16 with the App Router and React 19
- TypeScript
- PostgreSQL and Prisma ORM
- Tailwind CSS 4 and shadcn/ui
- Recharts
- Jest, React Testing Library, and jest-axe
- Vercel

## Local development

### Prerequisites

- Node.js 20 or later
- A PostgreSQL database
- Access to the configured Transfermarkt API

Install dependencies:

```powershell
npm install
```

Copy `.env.example` to `.env` and configure:

```dotenv
DATABASE_URL="postgresql://..."
TRANSFERMARKT_API_URL="https://..."
```

Generate the Prisma client and start the development server:

```powershell
npx prisma generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available commands

```powershell
npm run dev      # Start the development server
npm run build    # Generate Prisma Client and create a production build
npm run start    # Run the production server
npm run lint     # Run ESLint
npm test         # Run the Jest test suite
npm run test:watch     # Run tests interactively while developing
npm run test:coverage  # Run tests and enforce coverage thresholds
```

## Testing

The automated test suite covers business rules, responsive component markup,
user interactions, accessibility, page composition, and mocked Prisma queries.
It uses Jest with JSDOM, React Testing Library, `user-event`, and `jest-axe`.

Tests are colocated with the production files they cover. Shared browser and
Next.js mocks live in `test/setup.tsx`, while coverage rules are configured in
`jest.config.ts`.

For the complete testing strategy, mocking conventions, coverage policy, and
instructions for adding tests, see [docs/TESTING.md](docs/TESTING.md).

## Importing data

Data is imported through the
[felipeall/transfermarkt-api](https://github.com/felipeall/transfermarkt-api).
For bulk imports, it is best to run the API in a local Docker container and
point `TRANSFERMARKT_API_URL` at that instance. This keeps requests under your
control and helps reduce the risk of being blocked by the upstream source.

Import stages depend on records created by earlier stages. For a fresh
database, run them in this order:

```powershell
npm run sync:leagues
npm run sync:clubs
npm run sync:club-profiles
npm run sync:squads
npm run sync:player-profiles
npm run sync:player-transfers
npm run sync:player-market-values
npm run sync:player-injuries
npm run sync:player-stats -- --season="25/26"
npm run sync:player-metrics
```

Replace `25/26` when importing another playing season. Player metrics must run
last because they are calculated from statistics, injuries, and market-value
history. Imports are scoped to the main squads of clubs in Europe's top five
leagues.

For stage dependencies, supported arguments, rerun guidance, and sync details,
see [scripts/sync/README.md](scripts/sync/README.md).
