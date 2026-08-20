import { DatabaseSync } from "node:sqlite";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { PresenceRules, ManualOverride, DEFAULT_PRIORITIES, AppRule } from "@presenced/contracts";

export interface DatabaseOptions {
  dbPath?: string;
}

export class DatabaseManager {
  private db: DatabaseSync;
  private readonly dbPath: string;

  constructor(options: DatabaseOptions = {}) {
    this.dbPath = options.dbPath ?? DatabaseManager.getDefaultDbPath();

    // Ensure directory exists if not memory
    if (this.dbPath !== ":memory:") {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    this.db = new DatabaseSync(this.dbPath);
    this.initTables();
  }

  public static getDefaultDbPath(): string {
    const configHome = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
    return path.join(configHome, "presenced", "presenced.db");
  }

  private initTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS kv_store (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS app_rules (
        app_id TEXT PRIMARY KEY,
        category TEXT,
        custom_title TEXT,
        ignore_app INTEGER NOT NULL DEFAULT 0,
        priority_offset INTEGER,
        updated_at INTEGER NOT NULL
      );
    `);
  }

  public getRules(): PresenceRules {
    const defaultRules: PresenceRules = {
      priorities: { ...DEFAULT_PRIORITIES },
      appRules: {},
      privacyMode: false,
    };

    try {
      const row = this.db.prepare("SELECT value FROM kv_store WHERE key = ?").get("rules") as
        | { value: string }
        | undefined;

      if (!row) {
        return defaultRules;
      }

      const parsed = JSON.parse(row.value) as PresenceRules;
      return {
        priorities: { ...DEFAULT_PRIORITIES, ...(parsed.priorities || {}) },
        appRules: parsed.appRules || {},
        privacyMode: Boolean(parsed.privacyMode),
      };
    } catch {
      return defaultRules;
    }
  }

  public saveRules(rules: PresenceRules): void {
    const stmt = this.db.prepare(`
      INSERT INTO kv_store (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `);
    stmt.run("rules", JSON.stringify(rules), Date.now());
  }

  public getPrivacyMode(): boolean {
    try {
      const row = this.db.prepare("SELECT value FROM kv_store WHERE key = ?").get("privacy_mode") as
        | { value: string }
        | undefined;
      return row ? JSON.parse(row.value) === true : false;
    } catch {
      return false;
    }
  }

  public savePrivacyMode(enabled: boolean): void {
    const stmt = this.db.prepare(`
      INSERT INTO kv_store (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `);
    stmt.run("privacy_mode", JSON.stringify(enabled), Date.now());
  }

  public getManualOverride(): ManualOverride | null {
    try {
      const row = this.db
        .prepare("SELECT value FROM kv_store WHERE key = ?")
        .get("manual_override") as { value: string } | undefined;
      if (!row) return null;
      const override = JSON.parse(row.value) as ManualOverride;
      // Check expiry
      if (override.expiresAt && override.expiresAt < Date.now()) {
        this.saveManualOverride(null);
        return null;
      }
      return override;
    } catch {
      return null;
    }
  }

  public saveManualOverride(override: ManualOverride | null): void {
    const stmt = this.db.prepare(`
      INSERT INTO kv_store (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `);
    stmt.run("manual_override", JSON.stringify(override), Date.now());
  }

  public close(): void {
    this.db.close();
  }
}
