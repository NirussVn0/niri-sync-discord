import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { PresenceStore } from "../state/presence-store.js";
import { ApiServer } from "../api/server.js";

describe("Scene API Endpoints", () => {
  let store: PresenceStore;
  let server: ApiServer;
  let baseUrl: string;

  beforeEach(async () => {
    store = new PresenceStore({ focusDebounceMs: 0 });
    server = new ApiServer({
      port: 0,
      host: "127.0.0.1",
      store,
    });
    await server.start();
    const port = server.getPort();
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterEach(async () => {
    await server.stop();
  });

  it("gets default auto scene from GET /api/scene", async () => {
    const res = await fetch(`${baseUrl}/api/scene`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.sceneType).toBe("auto");
    expect(body.activeScene?.activeSceneType).toBe("auto");
  });

  it("updates scene via POST /api/scene", async () => {
    const res = await fetch(`${baseUrl}/api/scene`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sceneType: "music" }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.scene?.activeSceneType).toBe("music");
  });
});
