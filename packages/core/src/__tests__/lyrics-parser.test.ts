import { describe, it, expect } from "vitest";
import { parseLrc, getActiveLyricLine } from "../lyrics-parser.js";

describe("lyrics-parser", () => {
  it("parses standard and fractional timestamps correctly", () => {
    const rawLrc = `
[ti:Test Song]
[ar:Test Artist]
[00:10.50]First line
[00:20.125]Second line with 3 digits
[01:05.00]Third line in next minute
`;

    const lines = parseLrc(rawLrc);
    expect(lines.length).toBe(3);
    expect(lines[0]?.atMs).toBe(10500);
    expect(lines[0]?.text).toBe("First line");

    expect(lines[1]?.atMs).toBe(20125);
    expect(lines[1]?.text).toBe("Second line with 3 digits");

    expect(lines[2]?.atMs).toBe(65000);
    expect(lines[2]?.text).toBe("Third line in next minute");
  });

  it("handles multiple timestamps on one line and sorts chronologically", () => {
    const rawLrc = `
[00:15.00][00:45.00]Repeating chorus
[00:30.00]Verse line
`;

    const lines = parseLrc(rawLrc);
    expect(lines.length).toBe(3);
    expect(lines[0]?.atMs).toBe(15000);
    expect(lines[0]?.text).toBe("Repeating chorus");

    expect(lines[1]?.atMs).toBe(30000);
    expect(lines[1]?.text).toBe("Verse line");

    expect(lines[2]?.atMs).toBe(45000);
    expect(lines[2]?.text).toBe("Repeating chorus");
  });

  it("preserves Unicode, Vietnamese, CJK, and emojis", () => {
    const rawLrc = `
[00:05.00]Xin chào Việt Nam! 🇻🇳
[00:10.00]こんにちは世界
[00:15.00]夜に駆ける
`;

    const lines = parseLrc(rawLrc);
    expect(lines.length).toBe(3);
    expect(lines[0]?.text).toBe("Xin chào Việt Nam! 🇻🇳");
    expect(lines[1]?.text).toBe("こんにちは世界");
    expect(lines[2]?.text).toBe("夜に駆ける");
  });

  it("binary search getActiveLyricLine resolves current line in O(log n)", () => {
    const lines = [
      { atMs: 10000, text: "Line 1" },
      { atMs: 20000, text: "Line 2" },
      { atMs: 30000, text: "Line 3" },
      { atMs: 40000, text: "Line 4" },
    ];

    // Before first line
    expect(getActiveLyricLine(lines, 5000)).toBeNull();

    // Exactly at line 1
    expect(getActiveLyricLine(lines, 10000)?.line.text).toBe("Line 1");
    expect(getActiveLyricLine(lines, 10000)?.index).toBe(0);

    // Between line 2 and line 3
    expect(getActiveLyricLine(lines, 25000)?.line.text).toBe("Line 2");
    expect(getActiveLyricLine(lines, 25000)?.index).toBe(1);

    // Past last line
    expect(getActiveLyricLine(lines, 50000)?.line.text).toBe("Line 4");
    expect(getActiveLyricLine(lines, 50000)?.index).toBe(3);
  });
});
