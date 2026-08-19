import { describe, expect, it } from "vitest";
import { formatRegistration } from "./format.js";

describe("formatRegistration", () => {
  it("formats a French registration and identifies the country", () => {
    expect(formatRegistration("FABCD")).toMatchObject({
      type: "country",
      formatted: "F-ABCD",
      country: "France",
      iso2: "FR",
    });
  });

  it("identifies an international organization registration", () => {
    expect(formatRegistration("4Yabc")).toMatchObject({
      type: "organization",
      formatted: "4Y-ABC",
      name: "International Civil Aviation Organization",
    });
  });

  it("is case-insensitive and trims whitespace", () => {
    expect(formatRegistration("  gabcd  ")).toMatchObject({
      formatted: "G-ABCD",
      country: "United Kingdom",
    });
  });

  it("leaves already-hyphenated input formatted the same way", () => {
    expect(formatRegistration("F-ABCD")).toMatchObject({ formatted: "F-ABCD" });
  });

  it("does not add a hyphen for countries that conventionally omit it", () => {
    expect(formatRegistration("N12345")).toMatchObject({
      formatted: "N12345",
      country: "United States",
    });
  });

  it("prefers the longest matching prefix", () => {
    expect(formatRegistration("OOABC")).toMatchObject({
      formatted: "OO-ABC",
      country: "Belgium",
    });
  });

  it("returns null for an unknown prefix", () => {
    expect(formatRegistration("QQQ999")).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(formatRegistration("   ")).toBeNull();
  });

  describe("ambiguous shared prefixes", () => {
    it("resolves HB to Switzerland, not Liechtenstein", () => {
      expect(formatRegistration("HBZOP")).toMatchObject({ country: "Switzerland" });
    });

    it("resolves bare '2' to Guernsey, not the United Kingdom", () => {
      expect(formatRegistration("2ABCD")).toMatchObject({ formatted: "2-ABCD", country: "Guernsey" });
    });

    it("resolves bare 'M' to Isle of Man, not the United Kingdom", () => {
      expect(formatRegistration("MABCD")).toMatchObject({ formatted: "M-ABCD", country: "Isle of Man" });
    });

    it("resolves CU to Cuba, not Portugal", () => {
      expect(formatRegistration("CUABC")).toMatchObject({ country: "Cuba" });
    });

    it("distinguishes China (B + up to 4 chars) from Taiwan (B + 5 digits) by suffix shape", () => {
      expect(formatRegistration("B2447")).toMatchObject({ formatted: "B-2447", country: "China" });
      expect(formatRegistration("B18701")).toMatchObject({ formatted: "B-18701", country: "Taiwan" });
    });

    it("formats the Faroe Islands' OY-H sub-prefix correctly (hyphen after 'OY', not after 'OYH')", () => {
      expect(formatRegistration("OYHSS")).toMatchObject({ formatted: "OY-HSS", country: "Faroe Islands" });
    });
  });
});
