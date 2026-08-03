# Football Transfer Dashboard

A football analytics platform built with Next.js, TypeScript and PostgreSQL.

## Features

- Latest transfers
- Club spending analysis
- League spending analysis
- Squad market values
- Injury tracking

## Tech Stack

- Next.js 15
- TypeScript
- PostgreSQL
- Prisma
- Tailwind CSS
- shadcn/ui
- Vercel

## Importing data

The import stages depend on records created by earlier stages. For a fresh
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
npm run sync:player-stats -- --season="26/27"
npm run sync:player-metrics
```

Set `DATABASE_URL` and `TRANSFERMARKT_API_URL` before running the imports.
Replace `26/27` with the season you want to import. Player metrics must run
last because they are calculated from stats, injuries, and market-value
history. Imports are restricted to the main squads of clubs in the Premier
League, Bundesliga, La Liga, Serie A, and Ligue 1.

See [scripts/sync/README.md](scripts/sync/README.md) for dependencies,
arguments, rerun guidance, and details about each stage.
