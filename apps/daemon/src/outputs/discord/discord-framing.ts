export interface DecodedFrame {
  opcode: number;
  data: unknown;
}

export class DiscordFraming {
  /**
   * Encodes a payload with the Discord IPC header (8-byte header: opcode + length in Little Endian).
   */
  public static encodeFrame(opcode: number, payload: unknown): Buffer {
    const payloadStr = JSON.stringify(payload);
    const payloadBytes = Buffer.from(payloadStr, "utf8");
    const buffer = Buffer.alloc(8 + payloadBytes.length);

    buffer.writeUInt32LE(opcode, 0);
    buffer.writeUInt32LE(payloadBytes.length, 4);
    payloadBytes.copy(buffer, 8);

    return buffer;
  }

  /**
   * Decodes complete frames from a buffer stream, returning parsed frames and any leftover bytes.
   */
  public static decodeFrames(buffer: Buffer): {
    frames: DecodedFrame[];
    remaining: Buffer;
  } {
    const frames: DecodedFrame[] = [];
    let offset = 0;

    while (offset + 8 <= buffer.length) {
      const opcode = buffer.readUInt32LE(offset);
      const length = buffer.readUInt32LE(offset + 4);

      if (offset + 8 + length > buffer.length) {
        // Incomplete frame, wait for more chunks
        break;
      }

      const payloadSlice = buffer.subarray(offset + 8, offset + 8 + length);
      try {
        const payloadStr = payloadSlice.toString("utf8");
        const data: unknown = JSON.parse(payloadStr);
        frames.push({ opcode, data });
      } catch {
        // Ignore unparseable frame payload
      }

      offset += 8 + length;
    }

    const remaining = buffer.subarray(offset);
    return { frames, remaining };
  }
}
