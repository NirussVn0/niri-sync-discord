import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "node:events";
import * as net from "node:net";
import { DiscordRpcClient } from "../outputs/discord/discord-client.js";
import { DiscordFraming } from "../outputs/discord/discord-framing.js";
import { DiscordOpcode } from "../outputs/discord/discord-types.js";

class MockSocket extends EventEmitter {
  public writtenData: Buffer[] = [];
  public destroyed = false;

  public write(chunk: Buffer, cb?: (err?: Error) => void): boolean {
    this.writtenData.push(chunk);
    if (cb) cb();
    return true;
  }

  public destroy(): void {
    this.destroyed = true;
    this.emit("close");
  }

  // Helper for test to simulate incoming frame from Discord
  public receiveFrame(opcode: number, payload: unknown): void {
    const frame = DiscordFraming.encodeFrame(opcode, payload);
    this.emit("data", frame);
  }
}

describe("DiscordRpcClient", () => {
  let mockSocket: MockSocket;
  let client: DiscordRpcClient;

  beforeEach(() => {
    mockSocket = new MockSocket();
    client = new DiscordRpcClient({
      clientId: "123456",
      autoReconnect: false,
      connectFn: () => {
        // Trigger connect on next tick
        setTimeout(() => mockSocket.emit("connect"), 10);
        return mockSocket as unknown as net.Socket;
      },
    });
  });

  afterEach(() => {
    client.stop();
  });

  it("sends handshake on connect and handles READY frame", async () => {
    client.start();

    // Wait for connect
    await new Promise((resolve) => setTimeout(resolve, 30));

    // Verify handshake was written
    expect(mockSocket.writtenData.length).toBeGreaterThanOrEqual(1);
    const { frames } = DiscordFraming.decodeFrames(mockSocket.writtenData[0]!);
    expect(frames[0]?.opcode).toBe(DiscordOpcode.HANDSHAKE);
    expect((frames[0]?.data as { client_id: string }).client_id).toBe("123456");

    // Simulate Discord server responding with READY
    mockSocket.receiveFrame(DiscordOpcode.FRAME, {
      evt: "READY",
      data: { v: 1, user: { username: "TestUser" } },
    });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(client.isConnected()).toBe(true);
    expect(client.getHealth().status).toBe("connected");
  });

  it("sends SET_ACTIVITY frame when setActivity is called", async () => {
    client.start();
    await new Promise((resolve) => setTimeout(resolve, 30));

    // Send READY
    mockSocket.receiveFrame(DiscordOpcode.FRAME, {
      evt: "READY",
      data: { v: 1 },
    });
    await new Promise((resolve) => setTimeout(resolve, 20));

    mockSocket.writtenData = []; // clear handshake

    await client.setActivity({
      details: "Bohemian Rhapsody",
      state: "Queen",
    });

    expect(mockSocket.writtenData.length).toBe(1);
    const { frames } = DiscordFraming.decodeFrames(mockSocket.writtenData[0]!);
    expect(frames[0]?.opcode).toBe(DiscordOpcode.FRAME);
    const cmd = frames[0]?.data as { cmd: string; args: { activity: { details: string } } };
    expect(cmd.cmd).toBe("SET_ACTIVITY");
    expect(cmd.args.activity.details).toBe("Bohemian Rhapsody");
  });
});
