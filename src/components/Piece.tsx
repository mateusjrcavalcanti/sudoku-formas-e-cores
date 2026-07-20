import { shapeSrc } from "../lib/assets";
import type { DifficultySettings, Shape } from "../lib/sudoku";
import { shapeLabels } from "../lib/sudoku";
import { cn } from "../lib/utils";

export type VisualMode = "shapes" | "numbers";

type PieceProps = {
  className?: string;
  mode: VisualMode;
  settings: DifficultySettings;
  shape: Shape | null;
};

const numberStyles: Record<Shape, string> = {
  circulo: "bg-red-100 text-red-700 ring-red-200",
  triangulo: "bg-amber-100 text-amber-700 ring-amber-200",
  quadrado: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  retangulo: "bg-cyan-100 text-cyan-700 ring-cyan-200",
  pentagono: "bg-indigo-100 text-indigo-700 ring-indigo-200",
  hexagono: "bg-pink-100 text-pink-700 ring-pink-200",
};

export function Piece({ className, mode, settings, shape }: PieceProps) {
  if (!shape) {
    return mode === "shapes" ? (
      <img
        alt="Vazio"
        className={cn("object-contain opacity-20", className)}
        draggable={false}
        src={shapeSrc("vazio")}
      />
    ) : (
      <span aria-label="Vazio" className={cn("block", className)} />
    );
  }

  if (mode === "numbers") {
    const number = settings.shapes.indexOf(shape) + 1;

    return (
      <span
        aria-label={`${number}, ${shapeLabels[shape]}`}
        className={cn(
          "inline-flex aspect-square items-center justify-center rounded-md text-[clamp(1rem,8cqw,2.5rem)] font-black leading-none ring-2",
          numberStyles[shape],
          className,
        )}
      >
        {number}
      </span>
    );
  }

  return (
    <img
      alt={shapeLabels[shape]}
      className={cn("object-contain", className)}
      draggable={false}
      src={shapeSrc(shape)}
    />
  );
}
