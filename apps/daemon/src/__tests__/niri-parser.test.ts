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

    const fact = parser.processEvent(event, 1000);
    expect(fact).not.toBeNull();
    expect(fact?.appId).toBe("code");
    expect(fact?.windowId).toBe(2);
    expect(fact?.rawTitle).toBe("main.ts - niri-sync-discord");
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
    const fact = parser.processEvent({
      WindowFocusChanged: {
        id: 2,
      },
    }, 1050);

    expect(fact).not.toBeNull();
    expect(fact?.appId).toBe("code");
    expect(fact?.windowId).toBe(2);
  });

  it("returns null when focus is cleared", () => {
    parser.processEvent({
      WindowsChanged: {
        windows: [{ id: 1, title: "term", app_id: "Alacritty", is_focused: true }],
      },
    }, 1000);

    const fact = parser.processEvent({
      WindowFocusChanged: {
        id: null,
      },
    }, 1050);

    expect(fact).toBeNull();
  });

  it("safely ignores unrecognized event types", () => {
    const unknownEvent = {
      SomeFutureNiriEvent: {
        foo: "bar",
      },
    };

    const fact = parser.processEvent(unknownEvent, 1000);
    expect(fact).toBeNull();
  });

  it("handles malformed JSON lines gracefully", () => {
    expect(parser.processLine("")).toBeNull();
    expect(parser.processLine("not-json")).toBeNull();
    expect(parser.processLine("{\"broken\":")).toBeNull();
  });
});
