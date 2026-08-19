const REGIONAL_INDICATOR_OFFSET = 0x1f1e6 - "A".charCodeAt(0);

/**
 * Converts an ISO 3166-1 alpha-2 code into its flag emoji by mapping each
 * letter to a Unicode "regional indicator symbol" — no image data needed,
 * the same trick most phone-number/country libraries use.
 *
 * Note: this is purely mechanical. For codes outside the officially
 * recognized ISO 3166-1 list (e.g. "XK" for Kosovo, "AN" for the former
 * Netherlands Antilles), the result may render as plain letters instead of
 * a flag on some platforms/fonts, since those aren't in Unicode's
 * guaranteed flag set.
 */
export function getFlagEmoji(iso2: string): string {
  return [...iso2.toUpperCase()]
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + REGIONAL_INDICATOR_OFFSET))
    .join("");
}
