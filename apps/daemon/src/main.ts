import { PresenceStore } from "./state/presence-store.js";
import { NiriSource } from "./sources/niri/niri-source.js";
import { ApiServer } from "./api/server.js";

async function bootstrap() {
  const port = Number(process.env.PORT || 4242);
  const host = process.env.HOST || "127.0.0.1";

  const store = new PresenceStore();
  const niriSource = new NiriSource();
  const apiServer = new ApiServer({ port, host, store });

  // Wire Niri events into the presence store
  niriSource.on("fact", (fact) => {
    store.setDesktop(fact);
  });

  niriSource.on("health", (health) => {
    store.setHealth(health);
  });

  // Start API server and sources
  await apiServer.start();
  console.log(`[daemon] presenced API listening on http://${host}:${port}`);

  niriSource.start();
  console.log(`[daemon] Niri event stream source started`);

  const shutdown = async () => {
    console.log(`[daemon] Shutting down presenced...`);
    niriSource.stop();
    await apiServer.stop();
    store.stop();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

// Run if executed directly
if (process.argv[1]?.endsWith("main.js") || process.argv[1]?.endsWith("main.ts")) {
  bootstrap().catch((err) => {
    console.error(`[daemon] Fatal bootstrap error:`, err);
    process.exit(1);
  });
}

export { bootstrap };
