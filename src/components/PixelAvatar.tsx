"use client";

import { useEffect, useRef, useState } from "react";

const SPRITE_FRAMES = [
  // Frame 0 - idle standing
  [
    "..CCCC..",
    ".CSSSSC.",
    "CSSEESSC",
    "CSSSSSC.",
    ".CCCCCC.",
    "..FFFF..",
    ".FFFFFF.",
    ".FBBBFF.",
    ".FBBBFF.",
    ".FFFFFF.",
    "..FFFF..",
    "..F..F..",
    ".FF..FF.",
  ],
  // Frame 1 - idle blink
  [
    "..CCCC..",
    ".CSSSSC.",
    "CSS--SSC",
    "CSSSSSC.",
    ".CCCCCC.",
    "..FFFF..",
    ".FFFFFF.",
    ".FBBBFF.",
    ".FBBBFF.",
    ".FFFFFF.",
    "..FFFF..",
    "..F..F..",
    ".FF..FF.",
  ],
  // Frame 2 - idle arm up
  [
    "..CCCC..",
    ".CSSSSC.",
    "CSSEESSC",
    "CSSSSSC.",
    ".CCCCCC.",
    "..FFFF..",
    ".FFFFFFC",
    ".FBBBFFC",
    ".FBBBFF.",
    ".FFFFFF.",
    "..FFFF..",
    "..F..F..",
    ".FF..FF.",
  ],
];

const PALETTE: Record<string, string> = {
  C: "#00F5FF",
  S: "#1a1a3e",
  E: "#00FF88",
  F: "#0a0f2e",
  B: "#FF00E5",
  "-": "#A0A0A0",
  ".": "transparent",
};

export function PixelAvatar({ size = 80 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const sequence = [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 2, 0, 0];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % sequence.length;
      setFrame(sequence[idx]);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sprite = SPRITE_FRAMES[frame];
    const pixelSize = size / 8;

    canvas.width = size;
    canvas.height = size * (sprite.length / 8);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    sprite.forEach((row, y) => {
      [...row].forEach((pixel, x) => {
        const color = PALETTE[pixel];
        if (color && color !== "transparent") {
          ctx.fillStyle = color;
          ctx.fillRect(
            Math.round(x * pixelSize),
            Math.round(y * pixelSize),
            Math.ceil(pixelSize),
            Math.ceil(pixelSize)
          );
        }
      });
    });
  }, [frame, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size,
        height: size * 1.625,
        imageRendering: "pixelated",
      }}
      aria-label="Pixel art avatar of Ved"
    />
  );
}
