import confetti from "canvas-confetti";
import { useEffect } from "react";

type ConfettiProps = {
  triggerKey: number;
};

const colors = [
  "#ef4444",
  "#f59e0b",
  "#22c55e",
  "#06b6d4",
  "#6366f1",
  "#ec4899",
];

export function Confetti({ triggerKey }: ConfettiProps) {
  useEffect(() => {
    if (triggerKey === 0) {
      return;
    }

    confetti({
      colors,
      disableForReducedMotion: true,
      gravity: 0.85,
      origin: { y: 0.6 },
      particleCount: 220,
      spread: 100,
      startVelocity: 48,
      ticks: 260,
    });

    confetti({
      colors,
      disableForReducedMotion: true,
      angle: 60,
      gravity: 0.8,
      origin: { x: 0, y: 0.72 },
      particleCount: 120,
      spread: 70,
      startVelocity: 58,
      ticks: 260,
    });

    confetti({
      colors,
      disableForReducedMotion: true,
      angle: 120,
      gravity: 0.8,
      origin: { x: 1, y: 0.72 },
      particleCount: 120,
      spread: 70,
      startVelocity: 58,
      ticks: 260,
    });

    window.setTimeout(() => {
      confetti({
        colors,
        disableForReducedMotion: true,
        gravity: 1.05,
        origin: { y: 0 },
        particleCount: 180,
        spread: 140,
        startVelocity: 30,
        ticks: 320,
      });
    }, 260);
  }, [triggerKey]);

  return null;
}
