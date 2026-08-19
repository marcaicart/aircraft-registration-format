// One-off/manual conversion of the vendored flydenity CSVs into our JSON dataset.
// Re-run with `npm run generate:data` after replacing the CSVs under data/.
import { parse } from "csv-parse/sync";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { CountryEntry, OrganizationEntry, RegistrationEntry } from "../src/types.js";

const root = fileURLToPath(new URL("..", import.meta.url));

// Countries whose civil registrations are conventionally written without a
// hyphen after the nationality prefix. Curated by hand (source data doesn't
// encode this); extend as we find more.
const NO_HYPHEN_ISO2 = new Set([
  "US", // N12345
  "JP", // JA1234
]);

function parsePyList(value: string): string[] {
  return JSON.parse(value.replace(/'/g, '"'));
}

// --- Countries ---

type CountryRow = {
  nation: string;
  description: string;
  "iso codes": string;
  callsign: string;
};

const countryCsv = readFileSync(`${root}/data/flydenity-countries.csv`, "utf-8");
const countryRows = parse(countryCsv, { columns: true, skip_empty_lines: true }) as CountryRow[];

const byCountry = new Map<string, CountryEntry>();

for (const row of countryRows) {
  if (row.description !== "general") continue; // skip military/other sub-entries for now

  const [iso2, iso3] = parsePyList(row["iso codes"]);
  const prefixes = parsePyList(row.callsign);

  const existing = byCountry.get(row.nation);
  if (existing) {
    for (const prefix of prefixes) {
      if (!existing.prefixes.includes(prefix)) existing.prefixes.push(prefix);
    }
    continue;
  }

  byCountry.set(row.nation, {
    type: "country",
    country: row.nation,
    iso2: iso2 ?? null,
    iso3: iso3 ?? null,
    prefixes: [...new Set(prefixes)],
    noHyphen: iso2 ? NO_HYPHEN_ISO2.has(iso2) : false,
  });
}

const countryEntries = [...byCountry.values()].sort((a, b) => a.country.localeCompare(b.country));

// --- Organizations ---

type OrganizationRow = {
  name: string;
  description: string;
  callsign: string;
};

const orgCsv = readFileSync(`${root}/data/flydenity-organizations.csv`, "utf-8");
const orgRows = parse(orgCsv, { columns: true, skip_empty_lines: true }) as OrganizationRow[];

const organizationEntries: OrganizationEntry[] = orgRows
  .filter((row) => row.description === "general")
  .map((row) => ({
    type: "organization",
    name: row.name,
    prefixes: [...new Set(parsePyList(row.callsign))],
    noHyphen: false,
  }));

const entries: RegistrationEntry[] = [...countryEntries, ...organizationEntries];

writeFileSync(`${root}/src/data/registrations.json`, JSON.stringify(entries, null, 2) + "\n");
console.log(`Generated ${countryEntries.length} country entries + ${organizationEntries.length} organization entries`);
