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

// Countries whose real nationality mark is shorter than the ITU blocks the
// source lists next to it (Germany: mark "D", blocks DA–DR). The blocks are
// allocation ranges, not what is painted on the aircraft, and "longest prefix
// wins" would otherwise turn D-AGWI into DA-GWI. For these countries every
// prefix that merely extends the mark is dropped. Each mark is verified
// against ICAO Annex 7 / Wikipedia's registration-prefix list — see
// docs/data-notes.md before adding to this (Russia's "R" and Eswatini's "3D"
// are NOT marks, so they must not be here).
const NATIONALITY_MARK: Record<string, string> = {
  Germany: "D",
  Canada: "C", // C-F / C-G / C-I
  Zimbabwe: "Z", // Z-xxx; Z2 is an ITU block
};

// Prefixes the source lacks but that are in real use (ITU allots PPA–PYZ to Brazil).
const EXTRA_PREFIXES: Record<string, string[]> = {
  Brazil: ["PU"],
};

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

for (const entry of byCountry.values()) {
  const mark = NATIONALITY_MARK[entry.country];
  if (mark) entry.prefixes = entry.prefixes.filter((p) => p === mark || !p.startsWith(mark));
  for (const p of EXTRA_PREFIXES[entry.country] ?? []) if (!entry.prefixes.includes(p)) entry.prefixes.push(p);
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
