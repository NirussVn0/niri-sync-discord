import { defineConfig } from "tsup";
import * as fs from "node:fs";
import * as path from "node:path";

export default defineConfig({
  entry: ["src/main.ts", "src/cli.ts"],
  format: ["esm"],
  platform: "node",
  target: "node22",
  clean: true,
  bundle: true,
  banner: {
    js: 'import { createRequire as __createRequire } from "node:module"; const require = __createRequire(import.meta.url);',
  },
  noExternal: [
    "@presenced/contracts",
    "@presenced/core",
    "hono",
    "@hono/node-server",
    "@hono/node-ws",
    "ws",
    "zod",
  ],
  external: [
    "node:fs",
    "node:path",
    "node:os",
    "node:crypto",
    "node:child_process",
    "node:http",
    "node:net",
    "node:sqlite",
    "node:stream",
    "node:events",
    "node:module",
    "events",
    "stream",
    "http",
    "crypto",
    "net",
    "fs",
    "path",
    "os",
  ],
  async onSuccess() {
    const distDir = path.resolve("dist");
    const files = fs.readdirSync(distDir);
    for (const file of files) {
      if (file.endsWith(".js")) {
        const filePath = path.join(distDir, file);
        let content = fs.readFileSync(filePath, "utf8");
        if (content.includes('from "sqlite"')) {
          content = content.replace(/from "sqlite"/g, 'from "node:sqlite"');
          fs.writeFileSync(filePath, content, "utf8");
        }
      }
    }
  },
  dts: false,
  sourcemap: false,
});
