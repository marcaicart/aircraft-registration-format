export type RegistrationEntry = {
  country: string;
  iso2: string | null;
  iso3: string | null;
  prefixes: string[];
  noHyphen: boolean;
};

export type FormattedRegistration = {
  /** Original input, unchanged. */
  raw: string;
  /** Registration formatted with a hyphen after the nationality prefix (unless the country conventionally omits it). */
  formatted: string;
  /** Nationality prefix that matched, e.g. "F", "OO", "N". */
  prefix: string;
  country: string;
  iso2: string | null;
  iso3: string | null;
};
