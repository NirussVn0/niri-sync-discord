import { describe, it, expect, beforeEach } from "vitest";
import { NiriParser } from "../sources/niri/niri-parser.js";

describe("NiriParser", () => {
  let parser: NiriParser;

  beforeEach(() => {
    parser = new NiriParser();
  });

  it("handles initial WindowsChanged event and emits focused window", () => {
    const event = {
      WindowsChanged: {
        windows: [
          {
            id: 1,
            title: "alacritty",
            app_id: "Alacritty",
            workspace_id: 1,
            is_focused: false,
          },
          {
            id: 2,
            title: "main.ts - niri-sync-discord",
            app_id: "code",
            workspace_id: 1,
            is_focused: true,
          },
        ],
      },
    };

    const res = parser.processEvent(event, 1000);
    expect(res.changed).toBe(true);
    expect(res.fact).not.toBeNull();
    expect(res.fact?.appId).toBe("code");
    expect(res.fact?.windowId).toBe(2);
    expect(res.fact?.rawTitle).toBe("main.ts - niri-sync-discord");
  });

  it("emits new fact when WindowFocusChanged occurs", () => {
    // Initial windows
    parser.processEvent({
      WindowsChanged: {
        windows: [
          { id: 1, title: "term", app_id: "Alacritty", is_focused: true },
          { id: 2, title: "code", app_id: "code", is_focused: false },
        ],
      },
    }, 1000);

    // Switch focus to window 2
    const res = parser.processEvent({
      WindowFocusChanged: {
        id: 2,
      },
    }, 1050);

    expect(res.changed).toBe(true);
    expect(res.fact).not.toBeNull();
    expect(res.fact?.appId).toBe("code");
    expect(res.fact?.windowId).toBe(2);
  });

  it("returns changed=true and fact=null when focus is cleared", () => {
    parser.processEvent({
      WindowsChanged: {
        windows: [{ id: 1, title: "term", app_id: "Alacritty", is_focused: true }],
      },
    }, 1000);

    const res = parser.processEvent({
      WindowFocusChanged: {
        id: null,
      },
    }, 1050);

    expect(res.changed).toBe(true);
    expect(res.fact).toBeNull();
  });

  it("safely ignores unrecognized event types", () => {
    const unknownEvent = {
      SomeFutureNiriEvent: {
        foo: "bar",
      },
    };

    const res = parser.processEvent(unknownEvent, 1000);
    expect(res.changed).toBe(false);
    expect(res.fact).toBeNull();
  });

  it("handles malformed JSON lines gracefully", () => {
    expect(parser.processLine("").changed).toBe(false);
    expect(parser.processLine("not-json").changed).toBe(false);
    expect(parser.processLine("{\"broken\":").changed).toBe(false);
  });
});
