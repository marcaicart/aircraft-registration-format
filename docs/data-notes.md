# Data notes

Details on data quality, known ambiguities, and scope decisions in the
vendored dataset — useful if you're debugging an unexpected result or
contributing a fix, not needed just to use the package.

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
- Ambiguous or malformed input returns `null` rather than guessing. This is
  enforced by `MAX_SUFFIX_LENGTH` in `src/format.ts`: a match is only
  accepted if what follows the prefix is no longer than 5 characters, the
  longest real suffix pattern in the whole dataset (Armenia's `10000-99999`).
  Without this, arbitrary text starting with a valid single-letter prefix —
  e.g. `"not-a-registration"` normalizing to `"NOTAREGISTRATION"`, which
  starts with the US's `N` — would be accepted and formatted as if it were a
  real registration (fixed in 0.1.2, see CHANGELOG/git history).
- `getFlagEmoji` is purely mechanical (letters → Unicode regional
  indicators), so it works for all 214 countries in the dataset, but two
  entries use codes outside Unicode's officially guaranteed flag set: `XK`
  (Kosovo, a user-assigned code, not an official ISO 3166-1 entry) and `AN`
  (the former Netherlands Antilles, withdrawn from ISO 3166-1 in 2010). For
  those two, some fonts/platforms may render the literal letters instead of
  a flag.
- Only the "United Nations" organization entry gets a flag (`🇺🇳`, a
  Unicode sequence some platforms render as the actual UN flag). ICAO and
  WMO don't — they're UN-affiliated agencies, not the UN itself, so reusing
  the UN flag for them would misrepresent them.
