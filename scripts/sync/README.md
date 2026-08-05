# Data sync guide

## Prerequisites

The database schema must be current and these environment variables must be
set:

```text
DATABASE_URL=postgresql://...
TRANSFERMARKT_API_URL=http://localhost:8000
```

The Transfermarkt API must be running and reachable before starting an import.

## Import scope

The pipeline is intentionally limited to the first-team squads of:

- Premier League (`GB1`)
- Bundesliga (`L1`)
- La Liga (`ES1`)
- Serie A (`IT1`)
- Ligue 1 (`FR1`)

Squad discovery only starts from clubs returned for those competitions. All
subsequent player imports require the player's current club to belong to one
of those five leagues. Reserve teams, youth teams, former players, and clubs
created only as historical transfer references are therefore not enriched.

The IDs are defined once in `lib/sync/scope.ts`. Change that list if the
supported competition scope changes.

## Recommended order

Run the following commands from the project root:

| Order | Command                                         | Data populated                                                                  | Depends on                                          |
| ----: | ----------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------- |
|     1 | `npm run sync:leagues`                          | Leagues                                                                         | Nothing                                             |
|     2 | `npm run sync:clubs`                            | Clubs and league membership                                                     | Leagues                                             |
|     3 | `npm run sync:club-profiles`                    | Club badges/profile data                                                        | Clubs                                               |
|     4 | `npm run sync:squads`                           | Players and current clubs                                                       | Clubs                                               |
|     5 | `npm run sync:player-profiles`                  | Player biographical, position, contract, and current market-value snapshot data | Players                                             |
|     6 | `npm run sync:player-transfers`                 | Transfers involving a top-five first team, counterpart clubs, and seasons       | Players                                             |
|     7 | `npm run sync:player-market-values`             | Current value, value rankings, and full market-value history                    | Players and current clubs                           |
|     8 | `npm run sync:player-injuries`                  | Injury history                                                                  | Players                                             |
|     9 | `npm run sync:player-stats -- --season="26/27"` | Competition statistics for the selected season                                  | Players                                             |
|    10 | `npm run sync:player-metrics`                   | Derived performance, injury, value, and height-percentile metrics               | Stats, injuries, market values, and player profiles |

Club profiles do not affect later imports, so step 3 may be postponed. The
player-level imports in steps 5–9 can also run independently after squads have
created the players. Metrics must run after all source-data imports to avoid
calculating incomplete values.

The transfer API returns a player's full career history, but the importer
filters that response before writing anything. A transfer is stored only when
its origin or destination club is one of the top-five first teams discovered
by the club import. The other side may be an out-of-scope club and is stored as
a minimal reference so the qualifying transfer remains complete.

## Arguments

### Select a stats season

Player stats require a season:

```powershell
npm run sync:player-stats -- --season="25/26"
```

To discard the stats sync marker and fetch that season again:

```powershell
npm run sync:player-stats -- --season="25/26" --force
```

Player profiles normally refresh only when they have never been synced or
their last profile sync is more than seven days old. To refresh every eligible
top-five-league player profile regardless of that timestamp:

```powershell
npm run sync:player-profiles -- --force
```

Player birth dates come from the club squad response. To refresh squads that
already have a season sync marker and repopulate their player birth dates:

```powershell
npm run sync:squads -- --force
```

Squads and player metrics use the shared `CURRENT_SEASON` value in
`lib/sync/scope.ts`. It switches from 25/26 to 26/27 on 21 August 2026.
Transfer views use the separate `TRANSFER_SEASON`, which can move to the new
season as soon as its transfer window opens. Metrics also accept an explicit
season override:

```powershell
npm run sync:player-metrics -- --season="25/26"
```

Use the same season for stats and metrics. Metrics aggregate only that
season's stat rows and calculate both career and selected-season injury
totals. Height percentiles compare players in the top-five first-team scope:
one value covers all players and another covers the player's exact main
position. Players without a recorded height are excluded from the comparison.
The same build calculates appearances and minutes played for the selected
season, plus minutes-played ranks within the player's club, league, and exact
main position. Equal minute totals receive the same rank.

### Limit long-running imports

Transfers, injuries, and market values accept a player limit, which is useful
for testing API connectivity:

```powershell
npm run sync:player-transfers -- --limit=10
npm run sync:player-injuries -- --limit=10
npm run sync:player-market-values -- --limit=10
```

## Refresh workflow

For a routine refresh:

1. Run leagues and clubs to pick up structural changes.
2. Run squads to add players and update their current clubs.
3. Run all player source-data stages.
4. Run player metrics last.

The scripts use upserts where possible, so rerunning them updates existing
records rather than intentionally duplicating them. Existing out-of-scope
records are left untouched; the scope prevents them from being fetched or
enriched but does not delete them. Stats skip a successfully synced player and
season unless `--force` is supplied. Squads similarly use a season-specific
sync marker.

If a source-data stage reports failures, rerun that stage before rebuilding
metrics. A metrics run does not fetch missing source data; it only calculates
values from records already stored in the database.
