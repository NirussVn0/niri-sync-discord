import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SidePanel } from "../components/SidePanel.js";

const source = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("dashboard layout containment", () => {
  it("uses bounded Music/RVC grid columns", () => {
    const app = source("App.tsx");
    const glassCard = source("widgets/GlassCard.tsx");

    expect(app).toContain('gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)"');
    expect(app).toContain("relative h-screen w-screen");
    expect(glassCard).toContain("min-w-0 overflow-hidden");
  });

  it("renders side panels as overlays instead of flex siblings", () => {
    const closed = renderToStaticMarkup(
      <SidePanel side="left" isOpen={false} onToggle={() => {}}>
        <span>content</span>
      </SidePanel>,
    );
    const open = renderToStaticMarkup(
      <SidePanel side="right" isOpen onToggle={() => {}}>
        <span>content</span>
      </SidePanel>,
    );

    expect(closed).toContain('data-side-panel="left"');
    expect(closed).toContain('aria-expanded="false"');
    expect(closed).toContain('aria-label="Open left widgets"');
    expect(closed).toContain("pointer-events-none absolute");
    expect(closed).not.toContain("order-first");
    expect(open).toContain('data-side-panel="right"');
    expect(open).toContain('aria-expanded="true"');
    expect(open).toContain('aria-label="Close right widgets"');
    expect(open).toContain("pointer-events-auto absolute");
    expect(open).toContain("content");
  });
});
