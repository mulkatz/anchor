import { useEffect, useRef, useState, useCallback } from 'react';

interface UsePinkNoiseReturn {
  isPlaying: boolean;
  start: () => void;
  stop: () => void;
  analyser: AnalyserNode | null;
}

/**
 * Custom hook for generating and playing pink noise (1/f noise)
 * Pink noise is calming, womb-like sound used for anxiety reduction
 *
 * Uses Web Audio API to generate noise procedurally (no audio files needed)
 */
export const usePinkNoise = (): UsePinkNoiseReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Generate pink noise buffer
  const createPinkNoiseBuffer = useCallback((context: AudioContext, duration: number = 2) => {
    const sampleRate = context.sampleRate;
    const bufferSize = sampleRate * duration;
    const buffer = context.createBuffer(2, bufferSize, sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const data = buffer.getChannelData(channel);
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        // Generate white noise
        const white = Math.random() * 2 - 1;

        // Paul Kellett's pink noise algorithm (Voss-McCartney)
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;

        // Sum and normalize
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    }

    return buffer;
  }, []);

  // Start playing pink noise
  const start = useCallback(() => {
    if (!audioContextRef.current) {
      // Create audio context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const context = new AudioContextClass();
      audioContextRef.current = context;

      // Create analyser for visualization
      const analyser = context.createAnalyser();
      analyser.fftSize = 256; // Lower = smoother visualization
      analyser.smoothingTimeConstant = 0.9; // Very smooth
      analyserRef.current = analyser;

      // Create gain node for volume control
      const gainNode = context.createGain();
      gainNode.gain.value = 0.3; // 30% volume (gentle)
      gainNodeRef.current = gainNode;
    }

    const context = audioContextRef.current;
    if (context.state === 'suspended') {
      context.resume();
    }

    // Create and start pink noise
    const buffer = createPinkNoiseBuffer(context);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true; // Loop the noise indefinitely

    // Connect: source -> gain -> analyser -> destination
    source.connect(gainNodeRef.current!);
    gainNodeRef.current!.connect(analyserRef.current!);
    analyserRef.current!.connect(context.destination);

    source.start(0);
    noiseNodeRef.current = source;
    setIsPlaying(true);
  }, [createPinkNoiseBuffer]);

  // Stop playing
  const stop = useCallback(() => {
    if (noiseNodeRef.current) {
      noiseNodeRef.current.stop();
      noiseNodeRef.current.disconnect();
      noiseNodeRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stop]);

  return {
    isPlaying,
    start,
    stop,
    analyser: analyserRef.current,
  };
};
