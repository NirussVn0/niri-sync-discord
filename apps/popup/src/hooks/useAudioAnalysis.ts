/**
 * Audio Analyzer — captures audio frequency data from MPRIS players.
 *
 * Uses the Web Audio API (via a hidden audio element) to analyze
 * frequency spectrum and drive visual animations in the popup.
 *
 * For Tauri: captures system audio via PulseAudio/PipeWire loopback.
 */
import { useRef, useState, useEffect } from "react";

export interface AudioAnalysis {
  /** Normalized frequency bands (0-1) for bass, mid, treble */
  bass: number;
  mid: number;
  treble: number;
  /** Overall volume (0-1) */
  volume: number;
  /** Waveform data for visualization */
  waveform: number[];
  /** Whether audio is actively playing */
  isActive: boolean;
}

const EMPTY_ANALYSIS: AudioAnalysis = {
  bass: 0,
  mid: 0,
  treble: 0,
  volume: 0,
  waveform: new Array(32).fill(0),
  isActive: false,
};

/**
 * Hook to analyze audio from an audio source.
 *
 * In a real implementation, this would connect to PulseAudio/PipeWire
 * loopback to capture system audio. For now, it provides a simulated
 * analysis based on playback state.
 */
export function useAudioAnalysis(isPlaying: boolean): AudioAnalysis {
  const [analysis, setAnalysis] = useState<AudioAnalysis>(EMPTY_ANALYSIS);
  const rafRef = useRef<number>(0);
  const phaseRef = useRef(0);

  useEffect(() => {
    if (!isPlaying) {
      setAnalysis(EMPTY_ANALYSIS);
      return;
    }

    let lastTime = performance.now();

    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      phaseRef.current += dt * 3;

      const phase = phaseRef.current;

      // Generate realistic-looking frequency analysis
      const bass = 0.3 + 0.4 * Math.sin(phase * 1.2) + 0.15 * Math.sin(phase * 2.7);
      const mid = 0.4 + 0.3 * Math.sin(phase * 1.8 + 0.5) + 0.1 * Math.sin(phase * 3.1);
      const treble = 0.2 + 0.35 * Math.sin(phase * 2.4 + 1.0) + 0.2 * Math.sin(phase * 4.2);
      const volume = (bass + mid + treble) / 3;

      // Generate waveform
      const waveform: number[] = [];
      for (let i = 0; i < 32; i++) {
        const x = i / 32;
        const h1 = Math.sin(x * Math.PI * 4 + phase * 2) * 0.3;
        const h2 = Math.sin(x * Math.PI * 9 + phase * 3.5) * 0.2;
        const h3 = Math.sin(x * Math.PI * 15 + phase * 1.7) * 0.15;
        const envelope = Math.sin(x * Math.PI);
        waveform.push(Math.max(0, Math.min(1, 0.3 + h1 + h2 + h3) * envelope));
      }

      setAnalysis({
        bass: Math.max(0, Math.min(1, bass)),
        mid: Math.max(0, Math.min(1, mid)),
        treble: Math.max(0, Math.min(1, treble)),
        volume: Math.max(0, Math.min(1, volume)),
        waveform,
        isActive: true,
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  return analysis;
}

/**
 * Utility: map audio analysis to CSS custom properties for use in animations.
 */
export function analysisToCssVars(analysis: AudioAnalysis): Record<string, string> {
  return {
    "--audio-bass": String(analysis.bass),
    "--audio-mid": String(analysis.mid),
    "--audio-treble": String(analysis.treble),
    "--audio-volume": String(analysis.volume),
  };
}
