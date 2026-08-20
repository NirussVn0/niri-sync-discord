import { DesktopFact } from "@presenced/contracts";
import {
  NiriWindow,
  NiriWindowsChangedEvent,
  NiriWindowOpenedOrChangedEvent,
  NiriWindowClosedEvent,
  NiriWindowFocusChangedEvent,
} from "./niri-types.js";

export class NiriParser {
  private windows = new Map<number, NiriWindow>();
  private focusedWindowId: number | null = null;
  private lastEmittedFact: DesktopFact | null = null;

  /**
   * Process a single JSON line from niri event-stream.
   * Returns a new DesktopFact if focused window changed, or null otherwise.
   */
  public processLine(line: string, now: number = Date.now()): DesktopFact | null {
    const trimmed = line.trim();
    if (!trimmed) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(trimmed);
      return this.processEvent(parsed, now);
    } catch {
      // Safely ignore invalid JSON lines
      return null;
    }
  }

  /**
   * Process a parsed Niri event object.
   */
  public processEvent(event: unknown, now: number = Date.now()): DesktopFact | null {
    if (typeof event !== "object" || event === null) {
      return null;
    }

    // 1. WindowsChanged (initial state or full list)
    const windowsChanged = NiriWindowsChangedEvent.safeParse(event);
    if (windowsChanged.success) {
      this.windows.clear();
      for (const win of windowsChanged.data.WindowsChanged.windows) {
        this.windows.set(win.id, win);
        if (win.is_focused) {
          this.focusedWindowId = win.id;
        }
      }
      return this.checkAndEmitCurrentFocus(now);
    }

    // 2. WindowOpenedOrChanged
    const openedOrChanged = NiriWindowOpenedOrChangedEvent.safeParse(event);
    if (openedOrChanged.success) {
      const win = openedOrChanged.data.WindowOpenedOrChanged.window;
      this.windows.set(win.id, win);
      if (win.is_focused) {
        this.focusedWindowId = win.id;
      }
      if (this.focusedWindowId === win.id) {
        return this.checkAndEmitCurrentFocus(now);
      }
      return null;
    }

    // 3. WindowClosed
    const closed = NiriWindowClosedEvent.safeParse(event);
    if (closed.success) {
      const closedId = closed.data.WindowClosed.id;
      this.windows.delete(closedId);
      if (this.focusedWindowId === closedId) {
        this.focusedWindowId = null;
        return this.checkAndEmitCurrentFocus(now);
      }
      return null;
    }

    // 4. WindowFocusChanged
    const focusChanged = NiriWindowFocusChangedEvent.safeParse(event);
    if (focusChanged.success) {
      this.focusedWindowId = focusChanged.data.WindowFocusChanged.id;
      return this.checkAndEmitCurrentFocus(now);
    }

    // Unrecognized or other event (WorkspaceActivated, etc.) - ignored safely
    return null;
  }

  private checkAndEmitCurrentFocus(now: number): DesktopFact | null {
    if (this.focusedWindowId === null) {
      if (this.lastEmittedFact === null) {
        return null;
      }
      this.lastEmittedFact = null;
      return null;
    }

    const currentWin = this.windows.get(this.focusedWindowId);
    if (!currentWin) {
      return null;
    }

    const appId = currentWin.app_id?.trim();
    if (!appId) {
      return null;
    }

    const fact: DesktopFact = {
      kind: "desktop",
      appId,
      workspaceId: currentWin.workspace_id ?? undefined,
      windowId: currentWin.id,
      rawTitle: currentWin.title ?? undefined,
      observedAt: now,
    };

    // Check if equivalent to last emitted
    if (
      this.lastEmittedFact &&
      this.lastEmittedFact.appId === fact.appId &&
      this.lastEmittedFact.rawTitle === fact.rawTitle &&
      this.lastEmittedFact.windowId === fact.windowId &&
      this.lastEmittedFact.workspaceId === fact.workspaceId
    ) {
      return null;
    }

    this.lastEmittedFact = fact;
    return fact;
  }

  public getFocusedWindow(): NiriWindow | null {
    if (this.focusedWindowId === null) return null;
    return this.windows.get(this.focusedWindowId) ?? null;
  }

  public reset(): void {
    this.windows.clear();
    this.focusedWindowId = null;
    this.lastEmittedFact = null;
  }
}
