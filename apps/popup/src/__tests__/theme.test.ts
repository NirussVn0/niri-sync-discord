import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, hexToRgb, normalizeHex } from "../hooks/useTheme.js";

describe("theme helpers", () => {
  it("accepts valid six-digit hex colors", () => {
    expect(normalizeHex("#34d399")).toBe("#34d399");
    expect(normalizeHex("#A78BFA")).toBe("#A78BFA");
  });

  it("falls back for malformed colors", () => {
    expect(normalizeHex("green")).toBe(DEFAULT_THEME.accentColor);
    expect(normalizeHex("#fff")).toBe(DEFAULT_THEME.accentColor);
  });

  it("converts an accent color to CSS rgb channels", () => {
    expect(hexToRgb("#7c8aff")).toEqual([124, 138, 255]);
    expect(hexToRgb("#34d399")).toEqual([52, 211, 153]);
  });
});
