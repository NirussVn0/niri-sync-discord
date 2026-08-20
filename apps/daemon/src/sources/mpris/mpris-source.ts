import { EventEmitter } from "node:events";
import { spawn, ChildProcess } from "node:child_process";
import * as readline from "node:readline";
import { MediaFact, IntegrationHealth } from "@presenced/contracts";
import { MprisParser } from "./mpris-parser.js";

export interface MprisSourceOptions {
  binaryPath?: string;
  autoReconnect?: boolean;
  initialBackoffMs?: number;
  maxBackoffMs?: number;
  spawnFn?: (command: string, args: string[]) => ChildProcess;
}

export class MprisSource extends EventEmitter {
  private parser = new MprisParser();
  private childProcess: ChildProcess | null = null;
  private running = false;
  private currentHealth: IntegrationHealth = {
    source: "mpris",
    status: "disconnected",
  };
  private backoffMs: number;
  private readonly initialBackoffMs: number;
  private readonly maxBackoffMs: number;
  private readonly binaryPath: string;
  private readonly autoReconnect: boolean;
  private readonly spawnFn: (command: string, args: string[]) => ChildProcess;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(options: MprisSourceOptions = {}) {
    super();
    this.binaryPath = options.binaryPath ?? "playerctl";
    this.autoReconnect = options.autoReconnect ?? true;
    this.initialBackoffMs = options.initialBackoffMs ?? 1000;
    this.maxBackoffMs = options.maxBackoffMs ?? 30000;
    this.backoffMs = this.initialBackoffMs;
    this.spawnFn =
      options.spawnFn ??
      ((cmd, args) => spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] }));
  }

  public getHealth(): IntegrationHealth {
    return this.currentHealth;
  }

  private setHealth(status: IntegrationHealth["status"], details?: string, error?: string): void {
    this.currentHealth = {
      source: "mpris",
      status,
      lastEventAt: status === "connected" ? Date.now() : this.currentHealth.lastEventAt,
      ...(details ? { details } : {}),
      ...(error ? { error } : {}),
    };
    this.emit("health", this.currentHealth);
  }

  public start(): void {
    if (this.running) return;
    this.running = true;
    this.connect();
  }

  public stop(): void {
    this.running = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.childProcess) {
      this.childProcess.kill("SIGTERM");
      this.childProcess = null;
    }
    this.setHealth("disconnected", "MPRIS source stopped");
  }

  public playPause(): void {
    try {
      this.spawnFn(this.binaryPath, ["play-pause"]);
    } catch {
      // ignore
    }
  }

  public next(): void {
    try {
      this.spawnFn(this.binaryPath, ["next"]);
    } catch {
      // ignore
    }
  }

  public previous(): void {
    try {
      this.spawnFn(this.binaryPath, ["previous"]);
    } catch {
      // ignore
    }
  }

  private connect(): void {
    if (!this.running) return;

    const args = [
      "metadata",
      "--format",
      "{{playerName}}\t{{status}}\t{{title}}\t{{artist}}\t{{album}}\t{{mpris:artUrl}}\t{{mpris:length}}\t{{position}}",
      "--follow",
    ];

    try {
      this.childProcess = this.spawnFn(this.binaryPath, args);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.setHealth("unsupported", "Failed to spawn playerctl", errorMsg);
      this.scheduleReconnect();
      return;
    }

    if (!this.childProcess.stdout) {
      this.setHealth("degraded", "No stdout stream from playerctl");
      this.scheduleReconnect();
      return;
    }

    const rl = readline.createInterface({
      input: this.childProcess.stdout,
      crlfDelay: Infinity,
    });

    let hasReceivedFirstLine = false;

    rl.on("line", (line) => {
      if (!hasReceivedFirstLine) {
        hasReceivedFirstLine = true;
        this.backoffMs = this.initialBackoffMs;
        this.setHealth("connected", "Streaming MPRIS metadata");
      }

      const fact = this.parser.parseLine(line);
      if (fact !== null) {
        this.emit("fact", fact);
      }
    });

    this.childProcess.on("error", (err) => {
      const isNotFound = (err as NodeJS.ErrnoException).code === "ENOENT";
      const status = isNotFound ? "unsupported" : "degraded";
      this.setHealth(status, "playerctl process error", err.message);
      this.scheduleReconnect();
    });

    this.childProcess.on("close", (code, signal) => {
      this.emit("fact", null);
      if (!this.running) return;
      this.setHealth(
        "reconnecting",
        `playerctl stream closed (exit code: ${code ?? "none"}, signal: ${signal ?? "none"})`
      );
      this.scheduleReconnect();
    });
  }

  private scheduleReconnect(): void {
    if (!this.running || !this.autoReconnect) return;
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.backoffMs = Math.min(this.backoffMs * 1.5, this.maxBackoffMs);
      this.connect();
    }, this.backoffMs);
  }
}
