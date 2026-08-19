import registrations from "./data/registrations.json" with { type: "json" };
import { getFlagEmoji } from "./flag.js";
import type { FormattedRegistration, RegistrationEntry } from "./types.js";

const entries = registrations as RegistrationEntry[];

function matchKey(prefix: string): string {
  return prefix.replace(/[^A-Z0-9]/g, "");
}

type Candidate = { prefix: string; matchKey: string; entry: RegistrationEntry };

const candidates: Candidate[] = entries.flatMap((entry) =>
  entry.prefixes.map((prefix) => ({ prefix, matchKey: matchKey(prefix), entry })),
);

function label(entry: RegistrationEntry): string {
  return entry.type === "country" ? entry.country : entry.name;
}

/**
 * When multiple entities share the exact same nationality prefix and can't
 * be told apart from the remainder, prefer whichever one actually issues
 * registrations under it today. Hand-curated — see README "Known ambiguous
 * prefixes" for the reasoning behind each entry.
 */
const PREFERRED_ENTITY: Record<string, string> = {
  "2": "Guernsey", // vs United Kingdom: "2" is Guernsey's own registry, never used under the plain UK register
  M: "Isle of Man", // vs United Kingdom: same reasoning as above
  HB: "Switzerland", // vs Liechtenstein: Liechtenstein has no civil aviation authority of its own
  CU: "Cuba", // vs Portugal: Portugal's actual prefix is CS; CU is a defunct colonial-era allocation
  SSM: "Egypt", // vs Sudan: both essentially unused today (real prefixes are SU/ST); arbitrary but stable
  OYH: "Faroe Islands", // vs Greenland: source data gives both the identical "OY-H" block; arbitrary but stable
};

/**
 * China and Taiwan share the bare "B" nationality prefix, but their formats
 * differ: Taiwan registrations are "B" + 5 digits (B-18701), China's are
 * "B" + up to 4 alphanumeric characters (B-2447). Unlike the ties above,
 * this can be resolved from the input itself instead of guessing.
 */
function resolveBPrefix(remainder: string): string {
  return /^[0-9]{5}$/.test(remainder) ? "Taiwan" : "China";
}

/**
 * Parses and formats a raw aircraft registration/tail number, inserting the
 * hyphen after the ITU/ICAO nationality prefix and identifying the country
 * (or international organization) it belongs to.
 * Returns null if no known prefix matches.
 */
export function formatRegistration(raw: string): FormattedRegistration | null {
  const normalized = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!normalized) return null;

  const matches = candidates.filter((c) => normalized.startsWith(c.matchKey));
  if (matches.length === 0) return null;

  const maxLen = Math.max(...matches.map((c) => c.matchKey.length));
  const longest = matches.filter((c) => c.matchKey.length === maxLen);

  let chosen = longest[0];
  if (longest.length > 1) {
    const key = longest[0].matchKey;
    const remainder = normalized.slice(key.length);
    const preferredLabel = key === "B" ? resolveBPrefix(remainder) : PREFERRED_ENTITY[key];
    chosen = longest.find((c) => label(c.entry) === preferredLabel) ?? longest[0];
  }

  const { prefix, matchKey: key, entry } = chosen;
  const suffix = normalized.slice(key.length);
  const formatted =
    entry.noHyphen || !suffix ? normalized : prefix.includes("-") ? `${prefix}${suffix}` : `${key}-${suffix}`;

  const base = { raw, formatted, prefix: key };

  return entry.type === "country"
    ? {
        ...base,
        type: "country",
        country: entry.country,
        iso2: entry.iso2,
        iso3: entry.iso3,
        flag: entry.iso2 ? getFlagEmoji(entry.iso2) : null,
      }
    : { ...base, type: "organization", name: entry.name };
}
