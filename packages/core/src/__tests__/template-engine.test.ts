import { describe, it, expect } from "vitest";
import { TemplateEngine } from "../template-engine.js";
import { DEFAULT_TEMPLATES } from "../default-templates.js";
import { TemplateVariables } from "@presenced/contracts";

describe("TemplateEngine & Token Interpolation", () => {
  const engine = new TemplateEngine();

  it("renders music template with track and artist", () => {
    const tpl = DEFAULT_TEMPLATES["tpl-music"]!;
    const vars: TemplateVariables = {
      track: "Chuyện Đôi Ta",
      artist: "Da LAB",
      lyric: "Mình đã từng nghĩ sẽ bên nhau",
    };

    const result = engine.renderTemplate(tpl, vars);
    expect(result.details).toBe("Chuyện Đôi Ta — Da LAB");
    expect(result.state).toBe("Mình đã từng nghĩ sẽ bên nhau");
  });

  it("renders pomodoro template with nested variables", () => {
    const tpl = DEFAULT_TEMPLATES["tpl-pomodoro"]!;
    const vars: TemplateVariables = {
      pomodoro: {
        task: "Calculus II",
        remaining: "22:15",
        session: "2/4",
      },
    };

    const result = engine.renderTemplate(tpl, vars);
    expect(result.details).toBe("Pomodoro — Calculus II");
    expect(result.state).toBe("22:15 left • Session 2/4");
  });

  it("renders countdown template with days remaining", () => {
    const tpl = DEFAULT_TEMPLATES["tpl-countdown"]!;
    const vars: TemplateVariables = {
      countdown: {
        name: "THPTQG 2027",
        days: "309",
      },
    };

    const result = engine.renderTemplate(tpl, vars);
    expect(result.details).toBe("Counting down to THPTQG 2027");
    expect(result.state).toBe("309 days remaining");
  });

  it("renders system telemetry template with CPU and RAM tokens", () => {
    const tpl = DEFAULT_TEMPLATES["tpl-system"]!;
    const vars: TemplateVariables = {
      system: {
        cpu: "14.2%",
        ram: "62.5%",
      },
    };

    const result = engine.renderTemplate(tpl, vars);
    expect(result.details).toBe("CPU 14.2% • RAM 62.5%");
  });

  it("renders custom templates with custom variable definitions", () => {
    const customTpl = {
      id: "custom-1",
      name: "Custom Gaming",
      detailsTemplate: "{game} • Level {level}",
      stateTemplate: "Ranked Match ({mode})",
      isBuiltin: false,
    };

    const vars = {
      game: "Elden Ring",
      level: "150",
      mode: "PvP",
    };

    const result = engine.renderTemplate(customTpl, vars as any);
    expect(result.details).toBe("Elden Ring • Level 150");
    expect(result.state).toBe("Ranked Match (PvP)");
  });
});
