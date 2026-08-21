import { DatabaseManager } from "./state/database.js";
import { PresenceStore } from "./state/presence-store.js";
import { NiriSource } from "./sources/niri/niri-source.js";
import { MprisSource } from "./sources/mpris/mpris-source.js";
import { LrclibClient } from "./lyrics/lrclib-client.js";
import { LyricsManager } from "./lyrics/lyrics-manager.js";
import { DiscordRpcClient } from "./outputs/discord/discord-client.js";
import { DiscordScheduler } from "./outputs/discord/discord-scheduler.js";
import { RvcScheduler } from "./outputs/discord/rvc-scheduler.js";
import { PomodoroEngine } from "./sources/pomodoro/pomodoro-engine.js";
import { CountdownEngine } from "./sources/countdown/countdown-engine.js";
import { SystemMetricsReader } from "./sources/system/system-metrics-reader.js";
import { TokenManager } from "./auth/token-manager.js";
import { ApiServer } from "./api/server.js";

async function bootstrap() {
  const port = Number(process.env.PORT || 4242);
  const host = process.env.HOST || "127.0.0.1";
  const discordClientId = process.env.DISCORD_CLIENT_ID;
  const dbPath = process.env.DB_PATH;
  const enableAuth = process.env.PRESENCED_AUTH === "true";

  const database = new DatabaseManager({
    ...(dbPath ? { dbPath } : {}),
  });
  const store = new PresenceStore({ database });
  const niriSource = new NiriSource();
  const mprisSource = new MprisSource();
  const lrclibClient = new LrclibClient({ database });
  const lyricsManager = new LyricsManager(store, lrclibClient);
  const pomodoroEngine = new PomodoroEngine();
  const countdownEngine = new CountdownEngine(database);
  const systemMetricsReader = new SystemMetricsReader();
  const tokenManager = new TokenManager({ enableAuth });

  // Resolve Discord Client ID: env > DB > default
  const dbDiscordConfig = store.getDiscordConfig();
  const resolvedClientId = discordClientId || dbDiscordConfig.clientId;

  const discordClient = new DiscordRpcClient({
    ...(resolvedClientId ? { clientId: resolvedClientId } : {}),
    ...(dbDiscordConfig.socketPath ? { customSocketPath: dbDiscordConfig.socketPath } : {}),
  });
  const discordScheduler = new DiscordScheduler(discordClient);

  // RVC Rotation scheduler (cycles multiple Discord statuses)
  const rvcConfig = store.getRvcConfig();
  const rvcScheduler = new RvcScheduler(discordClient, rvcConfig ?? {
    enabled: false,
    tickIntervalSec: 30,
    entries: [],
  });
  const apiServer = new ApiServer({
    port,
    host,
    store,
    pomodoroEngine,
    countdownEngine,
    mprisSource,
    tokenManager,
  });

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

  // Wire Pomodoro state into presence store
  pomodoroEngine.on("fact", (fact) => {
    store.setPomodoro(fact);
  });

  // Wire Countdown state into presence store
  countdownEngine.on("fact", (fact) => {
    store.setCountdown(fact);
  });
  store.setCountdown(countdownEngine.getFact());

  // Periodic System Metrics reader (every 10 seconds instead of 5 — reduce CPU)
  store.setSystem(systemMetricsReader.read());
  const systemInterval = setInterval(() => {
    store.setSystem(systemMetricsReader.read());
  }, 10_000);

  // Start lyrics manager
  lyricsManager.start();

  // Wire Discord client health into presence store
  discordClient.on("health", (health) => {
    store.setHealth(health);
  });

  // Wire resolved presence to Discord output scheduler + RVC rotation
  store.on("event", (event) => {
    if (event.type === "presence.resolved") {
      discordScheduler.updatePresence(event.payload);
      rvcScheduler.updateRealPresence(event.payload);
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

  // Start RVC rotation if enabled
  if (rvcConfig?.enabled) {
    rvcScheduler.start();
    console.log(`[daemon] RVC rotation started (${rvcConfig.entries.filter((e: any) => e.enabled).length} entries)`);
  }

  const shutdown = async () => {
    console.log(`[daemon] Shutting down presenced...`);
    clearInterval(systemInterval);
    pomodoroEngine.destroy();
    countdownEngine.destroy();
    tokenManager.destroy();
    await discordScheduler.clear();
    await rvcScheduler.clear();
    await new Promise((resolve) => setTimeout(resolve, 50));
    discordClient.stop();
    niriSource.stop();
    mprisSource.stop();
    await apiServer.stop();
    store.stop();
    database.close();
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
