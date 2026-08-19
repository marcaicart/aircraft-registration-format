# aircraft-registration-format

Format and identify aircraft registration numbers ("tail numbers") by their
ITU/ICAO nationality prefix — e.g. `FABCD` → `F-ABCD` (France).

## Install

```bash
npm install aircraft-registration-format
```

## Usage

```ts
import { formatRegistration } from "aircraft-registration-format";

formatRegistration("FABCD");
// {
//   raw: "FABCD",
//   formatted: "F-ABCD",
//   prefix: "F",
//   country: "France",
//   iso2: "FR",
//   iso3: "FRA",
//   flag: "🇫🇷",
// }

formatRegistration("n12345");
// { formatted: "N12345", country: "United States", ... } — no hyphen, by convention

formatRegistration("not-a-registration"); // null

formatRegistration("4Yabc");
// { formatted: "4Y-ABC", type: "organization", name: "International Civil Aviation Organization" }
// (no `flag` — organizations aren't tied to a single country)
```

`formatRegistration` is case-insensitive, trims whitespace, and strips any
existing punctuation before re-formatting, so already-hyphenated input is
safe to pass in. The result is a discriminated union on `type`: `"country"`
entries have `country`/`iso2`/`iso3`/`flag`, `"organization"` entries (ICAO,
UN, WMO — registrations that aren't tied to a single state) have `name`
instead, with no flag.

### Flags

`flag` is a Unicode flag emoji computed from `iso2` — no image files, no
network request, works offline. You can also call it directly:

```ts
import { getFlagEmoji } from "aircraft-registration-format";

getFlagEmoji("FR"); // "🇫🇷"
```

This is purely mechanical (it maps letters to Unicode "regional indicator"
code points), so it works for all 214 countries in the dataset, but two
entries use codes that aren't in Unicode's officially guaranteed flag set —
`XK` (Kosovo, a user-assigned code, not an official ISO 3166-1 entry) and
`AN` (the former Netherlands Antilles, withdrawn from ISO 3166-1 in 2010).
For those two, some fonts/platforms may render the literal letters instead
of a flag. This is the same trade-off phone-number libraries make with the
same trick.

## Data source

The nationality-prefix dataset (civil aircraft, per country, plus a handful
of international organizations) is derived from
[flydenity](https://github.com/Collen-Roller/flydenity) (MIT licensed), which
itself follows the ITU Table of International Call Sign Series and ICAO
Annex 7. See [NOTICE.md](./NOTICE.md) for full attribution. The dataset is
vendored (copied into this repo), not pulled as a live dependency — flydenity
has been stable since 2020, and we may hand-edit entries here to fix errors.

## Known ambiguous prefixes

A handful of nationality prefixes are shared by more than one country in the
source data — flydenity itself doesn't disambiguate these either (it just
returns whichever row happens to come first in its CSV). We resolve them
with hand-curated rules in `src/format.ts` (`PREFERRED_ENTITY` and
`resolveBPrefix`):

| Prefix | Shared by | Resolution |
|---|---|---|
| `B` | China / Taiwan | **Not a guess** — Taiwan registrations are `B` + 5 digits (`B-18701`), China's are `B` + up to 4 alphanumeric characters (`B-2447`); we pick based on the actual input shape. |
| `2` | Guernsey / United Kingdom | Always Guernsey — no aircraft is registered under the plain UK register with this prefix, it's Guernsey's own registry. |
| `M` | Isle of Man / United Kingdom | Always Isle of Man, same reasoning as `2`. |
| `HB` | Switzerland / Liechtenstein | Always Switzerland — Liechtenstein has no civil aviation authority of its own; HB- aircraft are Swiss-registered under a 1950 treaty. |
| `CU` | Cuba / Portugal | Always Cuba — Portugal's real prefix is `CS`; `CU` is a defunct colonial-era allocation. |
| `SSM` | Egypt / Sudan | Always Egypt — arbitrary, but both are essentially unused today (the real prefixes are `SU` and `ST`). |
| `OYH` (`OY-H`) | Faroe Islands / Greenland | Always Faroe Islands — arbitrary, source data gives both territories the identical block. |

If you register or spot an aircraft that contradicts one of the arbitrary
picks above, open an issue/PR — these are best-effort, not verified against
an authoritative registry.

## Scope / known limitations

- Only covers general civil registrations (military sub-entries from the
  source dataset are not included; the small set of international
  organizations — ICAO, UN, WMO — is).
- The "no hyphen" convention list (`src/data/registrations.json`'s
  `noHyphen` flag) is hand-curated and currently only covers the US and
  Japan — corrections and additions welcome.
- Ambiguous or malformed input returns `null` rather than guessing.

## License

MIT — see [LICENSE](./LICENSE). Third-party data attribution in
[NOTICE.md](./NOTICE.md).
