import registrations from "./data/registrations.json" with { type: "json" };
import type { FormattedRegistration, RegistrationEntry } from "./types.js";

const entries = registrations as RegistrationEntry[];

// Flat, longest-prefix-first list for matching.
const prefixIndex = entries
  .flatMap((entry) => entry.prefixes.map((prefix) => ({ prefix, entry })))
  .sort((a, b) => b.prefix.length - a.prefix.length);

/**
 * Parses and formats a raw aircraft registration/tail number, inserting the
 * hyphen after the ITU/ICAO nationality prefix and identifying the country.
 * Returns null if no known nationality prefix matches.
 */
export function formatRegistration(raw: string): FormattedRegistration | null {
  const normalized = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!normalized) return null;

  const match = prefixIndex.find(({ prefix }) => normalized.startsWith(prefix));
  if (!match) return null;

  const { prefix, entry } = match;
  const suffix = normalized.slice(prefix.length);
  const formatted = entry.noHyphen || !suffix ? normalized : `${prefix}-${suffix}`;

  return {
    raw,
    formatted,
    prefix,
    country: entry.country,
    iso2: entry.iso2,
    iso3: entry.iso3,
  };
}
