import { fetchFromApi } from "../lib/sync/api";

async function main() {
  const data = await fetchFromApi<any>("/players/226049/transfers");

  for (const t of data.transfers) {
    console.log({
      id: t.id,
      fee: t.fee,
      marketValue: t.marketValue,
      transferType: t.transferType,
      keys: Object.keys(t),
    });
  }
}

main();
