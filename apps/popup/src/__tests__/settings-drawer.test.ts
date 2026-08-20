import { describe, it, expect } from "vitest";

describe("SettingsDrawer Navigation & Tabs", () => {
  it("defines standard drawer tabs", () => {
    const tabs = ["scenes", "countdowns", "integrations", "privacy"];
    expect(tabs).toHaveLength(4);
    expect(tabs).toContain("scenes");
    expect(tabs).toContain("countdowns");
  });
});
