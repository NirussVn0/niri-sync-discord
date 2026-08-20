#!/usr/bin/env node
import * as fs from "node:fs";
import { execSync } from "node:child_process";
import { DiscordRpcClient } from "./outputs/discord/discord-client.js";
import { DatabaseManager } from "./state/database.js";
import { bootstrap } from "./main.js";

interface CliArgs {
  help: boolean;
  version: boolean;
  diagnostics: boolean;
  port?: number;
  host?: string;
  dbPath?: string;
  discordClientId?: string;
}

function parseArgs(args: string[]): CliArgs {
  const result: CliArgs = {
    help: false,
    version: false,
    diagnostics: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      result.help = true;
    } else if (arg === "--version" || arg === "-v") {
      result.version = true;
    } else if (arg === "--diagnostics" || arg === "-d") {
      result.diagnostics = true;
    } else if ((arg === "--port" || arg === "-p") && i + 1 < args.length) {
      const val = args[++i];
      if (val !== undefined) result.port = Number(val);
    } else if (arg === "--host" && i + 1 < args.length) {
      const val = args[++i];
      if (val !== undefined) result.host = val;
    } else if (arg === "--db-path" && i + 1 < args.length) {
      const val = args[++i];
      if (val !== undefined) result.dbPath = val;
    } else if (arg === "--discord-client-id" && i + 1 < args.length) {
      const val = args[++i];
      if (val !== undefined) result.discordClientId = val;
    }
  }

  return result;
}

export function runDiagnostics(): Record<string, unknown> {
  const diag: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    pid: process.pid,
  };

  // Check Niri
  try {
    const niriOutput = execSync("which niri", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    diag.niri = {
      available: true,
      path: niriOutput.trim(),
    };
  } catch {
    diag.niri = {
      available: false,
      error: "niri binary not found in PATH",
    };
  }

  // Check playerctl
  try {
    const playerctlOutput = execSync("which playerctl", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    diag.playerctl = {
      available: true,
      path: playerctlOutput.trim(),
    };
  } catch {
    diag.playerctl = {
      available: false,
      error: "playerctl binary not found in PATH",
    };
  }

  // Check Discord IPC Socket
  const discordIpcPath = DiscordRpcClient.findIpcSocketPath();
  diag.discordIpc = {
    socketFound: Boolean(discordIpcPath),
    socketPath: discordIpcPath ?? null,
  };

  // Check SQLite DB
  const defaultDbPath = DatabaseManager.getDefaultDbPath();
  diag.database = {
    defaultPath: defaultDbPath,
    exists: fs.existsSync(defaultDbPath),
  };

  return diag;
}

export async function runCli(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(`
presenced - Local-First Linux Presence Engine for Niri + Discord

USAGE:
  presenced [OPTIONS]

OPTIONS:
  -h, --help                  Print this help information
  -v, --version               Print version information
  -d, --diagnostics           Run system diagnostic checks and print report
  -p, --port <PORT>           HTTP/WS API port (default: 4242 or $PORT)
      --host <HOST>           HTTP/WS host to bind (default: 127.0.0.1 or $HOST)
      --db-path <PATH>        Custom path to SQLite database
      --discord-client-id <ID> Custom Discord Application Client ID

ENVIRONMENT VARIABLES:
  PORT                        HTTP/WS API port (default: 4242)
  HOST                        Host interface to bind (default: 127.0.0.1)
  DB_PATH                     SQLite database location
  DISCORD_CLIENT_ID           Discord Application Client ID
`);
    process.exit(0);
  }

  if (args.version) {
    console.log("presenced v0.1.0");
    process.exit(0);
  }

  if (args.diagnostics) {
    console.log(JSON.stringify(runDiagnostics(), null, 2));
    process.exit(0);
  }

  if (args.port) process.env.PORT = String(args.port);
  if (args.host) process.env.HOST = args.host;
  if (args.dbPath) process.env.DB_PATH = args.dbPath;
  if (args.discordClientId) process.env.DISCORD_CLIENT_ID = args.discordClientId;

  await bootstrap();
}

// Auto-run if executed directly
if (process.argv[1]?.endsWith("cli.js") || process.argv[1]?.endsWith("cli.ts")) {
  runCli().catch((err) => {
    console.error(`[cli] Fatal error:`, err);
    process.exit(1);
  });
}
