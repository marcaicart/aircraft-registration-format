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
// (no `flag` — ICAO isn't a country, and isn't the UN itself)

formatRegistration("4Uabc");
// { formatted: "4U-ABC", type: "organization", name: "United Nations", flag: "🇺🇳" }
```

`formatRegistration` is case-insensitive, trims whitespace, and strips any
existing punctuation before re-formatting, so already-hyphenated input is
safe to pass in. The result is a discriminated union on `type`: `"country"`
entries have `country`/`iso2`/`iso3`/`flag`, `"organization"` entries (ICAO,
UN, WMO — registrations that aren't tied to a single state) have `name`
and, only for the UN itself, a `flag`.

### Flags

`flag` is a Unicode flag emoji computed from `iso2` — no image files, no
network request, works offline. You can also call it directly:

```ts
import { getFlagEmoji } from "aircraft-registration-format";

getFlagEmoji("FR"); // "🇫🇷"
```

## Data source

The nationality-prefix dataset (civil aircraft, per country, plus a handful
of international organizations) is derived from
[flydenity](https://github.com/Collen-Roller/flydenity) (MIT licensed), which
itself follows the ITU Table of International Call Sign Series and ICAO
Annex 7. See [NOTICE.md](./NOTICE.md) for full attribution. The dataset is
vendored (copied into this repo), not pulled as a live dependency — flydenity
has been stable since 2020, and we may hand-edit entries here to fix errors.

For known data ambiguities, edge cases, and other implementation details,
see [docs/data-notes.md](./docs/data-notes.md).

## License

MIT — see [LICENSE](./LICENSE). Third-party data attribution in
[NOTICE.md](./NOTICE.md).
