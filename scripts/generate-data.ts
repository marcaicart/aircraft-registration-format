// One-off/manual conversion of the vendored flydenity CSV into our JSON dataset.
// Re-run with `npm run generate:data` after replacing data/flydenity-countries.csv.
import { parse } from "csv-parse/sync";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const csv = readFileSync(`${root}/data/flydenity-countries.csv`, "utf-8");

// Countries whose civil registrations are conventionally written without a
// hyphen after the nationality prefix. Curated by hand (source data doesn't
// encode this); extend as we find more.
const NO_HYPHEN_ISO2 = new Set([
  "US", // N12345
  "JP", // JA1234
]);

type Row = {
  nation: string;
  description: string;
  priority: string;
  "iso codes": string;
  callsign: string;
};

const rows = parse(csv, { columns: true, skip_empty_lines: true }) as Row[];

type Entry = {
  country: string;
  iso2: string | null;
  iso3: string | null;
  prefixes: string[];
  noHyphen: boolean;
};

const byCountry = new Map<string, Entry>();

for (const row of rows) {
  if (row.description !== "general") continue; // skip military/other sub-entries for now

  const isoCodes = JSON.parse(row["iso codes"].replace(/'/g, '"')) as string[];
  const prefixes = JSON.parse(row.callsign.replace(/'/g, '"')) as string[];
  const [iso2, iso3] = isoCodes;

  const existing = byCountry.get(row.nation);
  if (existing) {
    existing.prefixes.push(...prefixes);
    continue;
  }

  byCountry.set(row.nation, {
    country: row.nation,
    iso2: iso2 ?? null,
    iso3: iso3 ?? null,
    prefixes,
    noHyphen: iso2 ? NO_HYPHEN_ISO2.has(iso2) : false,
  });
}

const entries = [...byCountry.values()].sort((a, b) => a.country.localeCompare(b.country));

writeFileSync(`${root}/src/data/registrations.json`, JSON.stringify(entries, null, 2) + "\n");
console.log(`Generated ${entries.length} country entries`);
