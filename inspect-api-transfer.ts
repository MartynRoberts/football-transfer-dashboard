import { fetchFromApi } from "./lib/sync/api";

async function main() {
  const data = await fetchFromApi("/players/226049/transfers");

  console.log(JSON.stringify(data, null, 2));
}

main();
