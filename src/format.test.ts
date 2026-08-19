import { describe, expect, it } from "vitest";
import { formatRegistration } from "./format.js";

describe("formatRegistration", () => {
  it("formats a French registration and identifies the country", () => {
    expect(formatRegistration("FABCD")).toMatchObject({
      formatted: "F-ABCD",
      country: "France",
      iso2: "FR",
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
});
