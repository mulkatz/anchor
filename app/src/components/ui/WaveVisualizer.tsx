import { type FC, useEffect, useRef } from 'react';

interface WaveVisualizerProps {
  analyser: AnalyserNode | null;
  width?: number;
  height?: number;
  color?: string;
  glowColor?: string;
}

/**
 * Audio wave visualizer using Canvas
 * Creates smooth, calming wave visualization from audio frequency data
 */
export const WaveVisualizer: FC<WaveVisualizerProps> = ({
  analyser,
  width = 300,
  height = 150,
  color = '#64FFDA', // biolum-cyan
  glowColor = 'rgba(100, 255, 218, 0.5)',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution for retina displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Audio data buffer
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Animation loop
    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      // Get frequency data
      analyser.getByteFrequencyData(dataArray);

      // Clear canvas with fade effect (creates trail)
      ctx.fillStyle = 'rgba(10, 17, 40, 0.2)'; // void-blue with transparency
      ctx.fillRect(0, 0, width, height);

      // Draw multiple wave layers for depth
      const layers = [
        { opacity: 0.3, offset: 0, amplitude: 0.5 },
        { opacity: 0.5, offset: 20, amplitude: 0.7 },
        { opacity: 1, offset: 40, amplitude: 1 },
      ];

      layers.forEach((layer) => {
        ctx.beginPath();
        ctx.strokeStyle = color.replace(')', `, ${layer.opacity})`).replace('rgb', 'rgba');
        ctx.lineWidth = 3;
        ctx.shadowBlur = 20;
        ctx.shadowColor = glowColor;

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          // Normalize frequency data (0-255) to wave height
          const value = dataArray[i] / 255.0;
          const y =
            height / 2 +
            Math.sin((i / bufferLength) * Math.PI * 4 + Date.now() / 1000) *
              20 *
              value *
              layer.amplitude +
            layer.offset;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            // Smooth curves using quadratic bezier
            const prevX = x - sliceWidth;
            const prevY =
              height / 2 +
              ((Math.sin(((i - 1) / bufferLength) * Math.PI * 4 + Date.now() / 1000) *
                20 *
                dataArray[i - 1]) /
                255.0) *
                layer.amplitude +
              layer.offset;
            const cpX = (prevX + x) / 2;
            const cpY = (prevY + y) / 2;
            ctx.quadraticCurveTo(cpX, cpY, x, y);
          }

          x += sliceWidth;
        }

        ctx.stroke();
      });
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, width, height, color, glowColor]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-lg"
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
};
