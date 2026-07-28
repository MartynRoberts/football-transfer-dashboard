import { fetchFromApi } from "../lib/sync/api";

async function main() {
  const data = await fetchFromApi<any>("/players/226049/transfers");

  console.dir(data.transfers[0], { depth: null });
}

main().catch(console.error);
