import { describe, it, expect } from "vitest";
import { DiscordFraming } from "../outputs/discord/discord-framing.js";
import { DiscordOpcode } from "../outputs/discord/discord-types.js";

describe("DiscordFraming", () => {
  it("encodes a payload with 8-byte little-endian opcode and length header", () => {
    const payload = { v: 1, client_id: "12345" };
    const encoded = DiscordFraming.encodeFrame(DiscordOpcode.HANDSHAKE, payload);

    expect(encoded.readUInt32LE(0)).toBe(DiscordOpcode.HANDSHAKE);

    const payloadBytes = Buffer.from(JSON.stringify(payload), "utf8");
    expect(encoded.readUInt32LE(4)).toBe(payloadBytes.length);
    expect(encoded.subarray(8).toString("utf8")).toBe(JSON.stringify(payload));
  });

  it("decodes multiple frames from a single continuous buffer", () => {
    const frame1 = DiscordFraming.encodeFrame(DiscordOpcode.HANDSHAKE, { v: 1 });
    const frame2 = DiscordFraming.encodeFrame(DiscordOpcode.PING, { nonce: "abc" });

    const combined = Buffer.concat([frame1, frame2]);
    const { frames, remaining } = DiscordFraming.decodeFrames(combined);

    expect(frames.length).toBe(2);
    expect(frames[0]?.opcode).toBe(DiscordOpcode.HANDSHAKE);
    expect(frames[0]?.data).toEqual({ v: 1 });
    expect(frames[1]?.opcode).toBe(DiscordOpcode.PING);
    expect(frames[1]?.data).toEqual({ nonce: "abc" });
    expect(remaining.length).toBe(0);
  });

  it("handles partial chunks correctly without crashing", () => {
    const fullFrame = DiscordFraming.encodeFrame(DiscordOpcode.FRAME, { cmd: "SET_ACTIVITY" });

    // Split into 2 chunks
    const chunk1 = fullFrame.subarray(0, 10);
    const chunk2 = fullFrame.subarray(10);

    const res1 = DiscordFraming.decodeFrames(chunk1);
    expect(res1.frames.length).toBe(0);
    expect(res1.remaining.length).toBe(10);

    const combined = Buffer.concat([res1.remaining, chunk2]);
    const res2 = DiscordFraming.decodeFrames(combined);
    expect(res2.frames.length).toBe(1);
    expect(res2.frames[0]?.opcode).toBe(DiscordOpcode.FRAME);
    expect(res2.remaining.length).toBe(0);
  });
});
