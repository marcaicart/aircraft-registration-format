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
// }

formatRegistration("n12345");
// { formatted: "N12345", country: "United States", ... } — no hyphen, by convention

formatRegistration("not-a-registration"); // null
```

`formatRegistration` is case-insensitive, trims whitespace, and strips any
existing punctuation before re-formatting, so already-hyphenated input is
safe to pass in.

## Data source

The nationality-prefix dataset is derived from
[flydenity](https://github.com/Collen-Roller/flydenity) (MIT licensed), which
itself follows the ITU Table of International Call Sign Series and ICAO
Annex 7. See [NOTICE.md](./NOTICE.md) for full attribution. The dataset is
vendored (copied into this repo), not pulled as a live dependency — flydenity
has been stable since 2020, and we may hand-edit entries here to fix errors.

## Scope / known limitations

- Only covers general civil registrations (military/organization sub-entries
  from the source dataset are not included).
- The "no hyphen" convention list (`src/data/registrations.json`'s
  `noHyphen` flag) is hand-curated and currently only covers the US and
  Japan — corrections and additions welcome.
- Ambiguous or malformed input returns `null` rather than guessing.

## License

MIT — see [LICENSE](./LICENSE). Third-party data attribution in
[NOTICE.md](./NOTICE.md).
