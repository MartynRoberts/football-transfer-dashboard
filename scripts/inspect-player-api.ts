import { fetchFromApi } from "../lib/sync/api";

async function main() {
  const data = await fetchFromApi<any>("/players/226049");

  console.log(JSON.stringify(data, null, 2));
}

main();
