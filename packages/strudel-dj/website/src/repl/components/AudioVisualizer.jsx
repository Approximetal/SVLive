import React, { useEffect, useRef } from 'react';
// @ts-ignore
import { getGlobalAnalyser } from '@strudel/webaudio';

export function AudioVisualizer() {
  const canvasRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let analyser;

    const render = () => {
      if (canvas) {
        // Resize canvas if needed
        if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        if (!analyser) {
            try {
            analyser = getGlobalAnalyser();
            } catch (e) {
            // ignore
            }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (analyser) {
            const bufferLength = analyser.frequencyBinCount; // 1024 usually
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);

            // Visualizer Logic
            // Draw a mirrored spectrum
            const width = canvas.width;
            const height = canvas.height;
            const barWidth = (width / bufferLength) * 2.5; // Zoom in a bit
            
            // Center line
            const centerY = height / 2;

            for (let i = 0; i < bufferLength; i++) {
                const value = dataArray[i];
                const percent = value / 255;
                const barHeight = height * percent * 0.5;

                // Apfel Palette Colors
                // Pink: #e94560 -> (233, 69, 96)
                // Blue: #0f3460 -> (15, 52, 96)
                // Cyan: #00fff5 -> (0, 255, 245)
                
                // Gradient from pink to cyan
                const r = 233 - (233 * (i/bufferLength));
                const g = 69 + ((255-69) * (i/bufferLength));
                const b = 96 + ((245-96) * (i/bufferLength));

                ctx.fillStyle = `rgba(${r},${g},${b}, ${percent * 0.5})`;
                
                // Draw mirrored bars
                const x = i * barWidth;
                // ctx.fillRect(x, height - barHeight, barWidth, barHeight); // Standard bottom
                
                // Let's do a floating waveform in the middle
                // ctx.fillRect(x, centerY - barHeight/2, barWidth, barHeight);
                
                // Or just bottom for now, simpler and cleaner
                ctx.fillRect(x, height - barHeight, barWidth, barHeight);
            }
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="audio-visualizer"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.8
      }}
    />
  );
}

