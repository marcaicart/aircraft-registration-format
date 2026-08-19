export type CountryEntry = {
  type: "country";
  country: string;
  iso2: string | null;
  iso3: string | null;
  prefixes: string[];
  noHyphen: boolean;
};

export type OrganizationEntry = {
  type: "organization";
  name: string;
  prefixes: string[];
  noHyphen: boolean;
};

export type RegistrationEntry = CountryEntry | OrganizationEntry;

export type FormattedRegistration = {
  /** Original input, unchanged. */
  raw: string;
  /** Registration formatted with a hyphen after the nationality prefix (unless the country conventionally omits it). */
  formatted: string;
  /** Nationality/organization prefix that matched, e.g. "F", "OO", "N", "4Y". */
  prefix: string;
} & (
  | { type: "country"; country: string; iso2: string | null; iso3: string | null }
  | { type: "organization"; name: string }
);
