# Third-party data

The nationality-prefix dataset in `data/flydenity-countries.csv` and
`data/flydenity-organizations.csv` (and the generated
`src/data/registrations.json`) is derived from
[flydenity](https://github.com/Collen-Roller/flydenity) by Collen Roller,
used under the MIT License:

```
MIT License

Copyright (c) 2020 Collen Roller
```

flydenity itself builds on the ITU Table of International Call Sign Series
and ICAO Annex 7. See the [flydenity repository](https://github.com/Collen-Roller/flydenity)
for the original dataset and its full license text.

The CSV was vendored (copied, not tracked as a dependency) on 2026-08-19 and
may since have been hand-edited in this repository to fix errors or add
entries — see git history for changes relative to the upstream file.
