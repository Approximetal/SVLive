import { Pattern, clamp } from '@strudel/core';
import { getDrawContext, getTheme } from '@strudel/draw';
import { analysers, getAnalyzerData } from 'superdough';

function clearScreen(smear = 0, smearRGB = `0,0,0`, ctx = getDrawContext()) {
  if (!smear) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  } else {
    ctx.fillStyle = `rgba(${smearRGB},${1 - smear})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}

export function drawRadialTimeScope(
  analyser,
  {
    color = 'white',
    thickness = 2,
    scale = 0.25,
    ctx = getDrawContext(),
    id = 1,
  } = {},
) {
  ctx.lineWidth = thickness;
  ctx.strokeStyle = color;
  const canvas = ctx.canvas;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = Math.min(cx, cy) * 0.5;

  if (!analyser) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.stroke();
    return;
  }

  const dataArray = getAnalyzerData('time', id);
  const bufferSize = analyser.frequencyBinCount;

  ctx.beginPath();
  // We want to connect the end back to start, so we go up to bufferSize
  for (let i = 0; i <= bufferSize; i++) {
    const index = i % bufferSize;
    const angle = (i / bufferSize) * 2 * Math.PI - Math.PI / 2; // Start at top
    const v = dataArray[index]; 
    const r = radius + (v * radius * scale);
    
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}

export function drawRadialFrequencyScope(
  analyser,
  {
    color = 'white',
    scale = 0.25,
    min = -100,
    max = 0,
    ctx = getDrawContext(),
    id = 1,
    thickness = 2
  } = {},
) {
   if (!analyser) {
    return;
  }
  
  const dataArray = getAnalyzerData('frequency', id);
  const bufferSize = analyser.frequencyBinCount;
  const canvas = ctx.canvas;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const maxRadius = Math.min(cx, cy) * 0.9;
  const minRadius = maxRadius * 0.3; // Inner hole

  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;

  // Mirror the spectrum to make it look symmetric and full circle
  // Or just wrap it around. Let's mirror it for symmetry (left/right style)
  // Actually standard radial spectrum usually wraps low->high around circle
  // But 2*PI continuity is an issue with spectrum (low != high).
  // So mirroring is better: low at top, high at bottom? Or low at top, going both ways?
  // Let's do: low at top (12 o'clock), high at bottom (6 o'clock), mirrored left/right.

  ctx.beginPath();
  
  const totalPoints = bufferSize; 
  // We will draw lines radiating from center
  
  // Let's do a filled polygon shape
  ctx.moveTo(cx, cy - minRadius); // Start at top inner

  // Right side (0 to PI)
  for (let i = 0; i < bufferSize; i++) {
    const normalized = clamp((dataArray[i] - min) / (max - min), 0, 1);
    const v = normalized * scale; // Scale factor
    const r = minRadius + (maxRadius - minRadius) * normalized;
    
    // Map i to angle: 0 -> -PI/2 (top), bufferSize -> PI/2 (bottom)
    // Actually let's do full circle.
    // Low freqs are usually more important.
    // Let's map linear index to angle? Log scale is better for freq.
    
    // Simple linear mapping for now to match other scopes
    const angle = (i / bufferSize) * Math.PI - Math.PI / 2;
    
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    ctx.lineTo(x, y);
  }
  
  // Left side (mirror)
   for (let i = bufferSize - 1; i >= 0; i--) {
    const normalized = clamp((dataArray[i] - min) / (max - min), 0, 1);
    const r = minRadius + (maxRadius - minRadius) * normalized;
    
    const angle = (i / bufferSize) * Math.PI - Math.PI / 2;
    // Mirror angle across Y axis? No, mirror across X=0 (which is vertical center line)
    // Angle is from -PI/2 (top) to PI/2 (bottom)
    // Mirror angle: -PI/2 -> -PI/2. 0 -> PI. 
    // Actually simpler: just negate the X component relative to cx?
    
    // Let's recompute
    const x = cx - r * Math.cos(angle); // Mirror X
    const y = cy + r * Math.sin(angle); // Same Y
    
    ctx.lineTo(x, y);
   }

  ctx.closePath();
  // ctx.fill(); // Fill or stroke?
  // Let's stroke for "cool" wireframe look, fill might be too heavy
  ctx.stroke();
  
  // Also draw the inner circle
  ctx.beginPath();
  ctx.arc(cx, cy, minRadius, 0, 2 * Math.PI);
  ctx.stroke();
}

let latestColor = {};

Pattern.prototype.rscope = function (config = {}) {
  let id = config.id ?? 1;
  return this.analyze(id).draw(
    (haps) => {
      config.color = haps[0]?.value?.color || getTheme().foreground;
      latestColor[id] = config.color;
      clearScreen(config.smear, '0,0,0', config.ctx);
      drawRadialTimeScope(analysers[id], config);
    },
    { id },
  );
};

Pattern.prototype.rspectrum = function (config = {}) {
  let id = config.id ?? 1;
  return this.analyze(id).draw(
    (haps) => {
      config.color = haps[0]?.value?.color || getTheme().foreground;
      latestColor[id] = config.color;
      clearScreen(config.smear, '0,0,0', config.ctx);
      drawRadialFrequencyScope(analysers[id], config);
    },
    { id },
  );
};

