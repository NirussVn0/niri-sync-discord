import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import * as crypto from "node:crypto";

export interface TokenManagerOptions {
  tokenPath?: string;
  enableAuth?: boolean;
}

export class TokenManager {
  private readonly token: string;
  private readonly tokenPath: string;
  private readonly enabled: boolean;

  constructor(options: TokenManagerOptions = {}) {
    this.enabled = options.enableAuth ?? false;
    this.token = crypto.randomBytes(32).toString("hex");
    this.tokenPath = options.tokenPath ?? TokenManager.getDefaultTokenPath();

    if (this.enabled) {
      this.writeTokenFile();
    }
  }

  public static getDefaultTokenPath(): string {
    const runtimeDir = process.env.XDG_RUNTIME_DIR;
    if (runtimeDir && fs.existsSync(runtimeDir)) {
      return path.join(runtimeDir, "presenced.token");
    }
    const uid = typeof process.getuid === "function" ? process.getuid() : 1000;
    return path.join(os.tmpdir(), `presenced-${uid}.token`);
  }

  public getToken(): string {
    return this.token;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public validate(providedToken: string | undefined | null): boolean {
    if (!this.enabled) return true;
    if (!providedToken) return false;

    // Constant-time comparison to prevent timing attacks
    const expectedBuf = Buffer.from(this.token, "utf8");
    const providedBuf = Buffer.from(providedToken, "utf8");

    if (expectedBuf.length !== providedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, providedBuf);
  }

  private writeTokenFile(): void {
    try {
      const dir = path.dirname(this.tokenPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write token file strictly with 0600 permissions
      fs.writeFileSync(this.tokenPath, this.token, {
        mode: 0o600,
        encoding: "utf8",
      });
    } catch {
      // ignore write failures
    }
  }

  public destroy(): void {
    if (this.enabled) {
      try {
        if (fs.existsSync(this.tokenPath)) {
          fs.unlinkSync(this.tokenPath);
        }
      } catch {
        // ignore cleanup error
      }
    }
  }
}
