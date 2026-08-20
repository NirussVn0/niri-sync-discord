import { PresenceStore } from "./state/presence-store.js";
import { NiriSource } from "./sources/niri/niri-source.js";
import { MprisSource } from "./sources/mpris/mpris-source.js";
import { LyricsManager } from "./lyrics/lyrics-manager.js";
import { DiscordRpcClient } from "./outputs/discord/discord-client.js";
import { DiscordScheduler } from "./outputs/discord/discord-scheduler.js";
import { ApiServer } from "./api/server.js";

async function bootstrap() {
  const port = Number(process.env.PORT || 4242);
  const host = process.env.HOST || "127.0.0.1";
  const discordClientId = process.env.DISCORD_CLIENT_ID;

  const store = new PresenceStore();
  const niriSource = new NiriSource();
  const mprisSource = new MprisSource();
  const lyricsManager = new LyricsManager(store);
  const discordClient = new DiscordRpcClient({
    ...(discordClientId ? { clientId: discordClientId } : {}),
  });
  const discordScheduler = new DiscordScheduler(discordClient);
  const apiServer = new ApiServer({ port, host, store });

  // Wire Niri events into presence store
  niriSource.on("fact", (fact) => {
    store.setDesktop(fact);
  });
  niriSource.on("health", (health) => {
    store.setHealth(health);
  });

  // Wire MPRIS events into presence store
  mprisSource.on("fact", (fact) => {
    store.setMedia(fact);
  });
  mprisSource.on("health", (health) => {
    store.setHealth(health);
  });

  // Start lyrics manager
  lyricsManager.start();

  // Wire Discord client health into presence store
  discordClient.on("health", (health) => {
    store.setHealth(health);
  });

  // Wire resolved presence to Discord output scheduler
  store.on("event", (event) => {
    if (event.type === "presence.resolved") {
      discordScheduler.updatePresence(event.payload);
    }
  });

  // Start API server, sources, and Discord client
  await apiServer.start();
  console.log(`[daemon] presenced API listening on http://${host}:${port}`);

  niriSource.start();
  console.log(`[daemon] Niri event stream source started`);

  mprisSource.start();
  console.log(`[daemon] MPRIS media source started`);

  discordClient.start();
  console.log(`[daemon] Discord Rich Presence output started`);

  const shutdown = async () => {
    console.log(`[daemon] Shutting down presenced...`);
    await discordScheduler.clear();
    discordClient.stop();
    niriSource.stop();
    mprisSource.stop();
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
