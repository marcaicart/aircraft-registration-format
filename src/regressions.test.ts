import { describe, expect, it } from "vitest";
import { formatRegistration } from "./format.js";

/** Real registrations: the hyphenless form must format back to the real one. */
const REAL = `4O-AOA 4X-EHA 9H-GTS 9H-WDI 9Y-TTC 9Y-TTG A6-BLT A6-BMC B-1957 B-322Y B-8385 CC-AZC CC-CPL
CS-TJQ CS-TPZ D-AGWI D-AINC EC-JDL EC-JZM EC-KDT EC-KHN EC-LRG EC-LSQ EC-MAI EC-MAN EC-MEL
EC-MIQ EC-MJC EC-MMY EC-MOO EC-MPV EC-MQL EC-MXU EC-MYC EC-NAY EC-NEI EC-NGB EC-NLX EC-NMY
EC-NUL EC-NUZ EI-EKW EI-IKL F-GKXQ F-GSPZ F-GUGN F-HYJC G-CKNY G-DBCB G-DRTK G-EZFW G-GATU
G-LCYG G-LCYW G-UZMC HA-LWA HA-LXM HB-DBU HB-JYA HS-BBF HZ-AR28 HZ-ARB LY-FAS N780AV OE-LQJ
PH-AOE PH-BXW PH-HZX PR-AQM PR-AXI PR-TYU SE-RTV SP-RZI TC-JPJ TC-LNF YU-APE ZS-YDA ZS-ZWV`.split(/\s+/);

const EXTRA = `D-AIMA D-ABYT D-EABC D-HABC D-MABC D-1234 C-FMDG C-GABC C-IABC 3DC-ABC
PU-ABC PP-ABC VH-ABC JA01AA I-ABCD OO-ABC RA-12345`.split(/\s+/);

describe("real registrations round-trip", () => {
  it.each([...REAL, ...EXTRA])("%s", (reg) => {
    const raw = reg.replace("-", "");
    expect(formatRegistration(raw)?.formatted).toBe(reg);
    expect(formatRegistration(reg)?.formatted).toBe(reg);
    expect(formatRegistration(` ${raw.toLowerCase()} `)?.formatted).toBe(reg);
  });
});

describe("nationality mark vs ITU blocks (regression)", () => {
  it("Germany uses the single-letter mark D, not the DA-DR ITU blocks", () => {
    expect(formatRegistration("DAGWI")).toMatchObject({ formatted: "D-AGWI", prefix: "D", country: "Germany" });
    expect(formatRegistration("d-ainc")).toMatchObject({ formatted: "D-AINC", country: "Germany" });
  });

  it("Canada uses C (C-F, C-G, C-I), not CF/CG", () => {
    expect(formatRegistration("CFMDG")).toMatchObject({ formatted: "C-FMDG", prefix: "C", country: "Canada" });
  });

  it("Eswatini keeps its real 3DC mark (not collapsed to 3D)", () => {
    expect(formatRegistration("3DCABC")).toMatchObject({ formatted: "3DC-ABC" });
  });

  it("Brazil's PU block is recognised", () => {
    expect(formatRegistration("PUABC")).toMatchObject({ formatted: "PU-ABC", country: "Brazil" });
  });
});

describe("invalid input", () => {
  it.each(["", "   ", "-", "QQQ999", "not-a-registration", "D-AGWIXYZ"])("%j -> null", (raw) => {
    expect(formatRegistration(raw)).toBeNull();
  });
});
