import { Eraser, HelpCircle } from "lucide-react";
import { Piece, type VisualMode } from "./Piece";
import type { CellValue, Shape } from "../lib/sudoku";
import { shapeLabels } from "../lib/sudoku";
import type { DifficultySettings } from "../lib/sudoku";

type ShapePickerProps = {
  activeTool: CellValue;
  mode: VisualMode;
  settings: DifficultySettings;
  shapes: readonly Shape[];
  onSelectTool: (value: Shape | null) => void;
};

export function ShapePicker({
  activeTool,
  mode,
  settings,
  shapes,
  onSelectTool,
}: ShapePickerProps) {
  const availableShapes = shapes.filter((shape) => shape !== activeTool);
  const shouldShowEraser = activeTool !== null;

  return (
    <div className="rounded-md border border-stone-300 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">
          {mode === "numbers" ? "Números" : "Formas"}
        </h2>
        <div className="group relative">
          <HelpCircle className="size-4 text-stone-500" aria-hidden="true" />
          <span className="pointer-events-none absolute right-0 top-7 hidden w-52 rounded-md bg-stone-950 px-3 py-2 text-xs leading-5 text-white shadow-lg group-hover:block">
            Escolha {mode === "numbers" ? "um número" : "uma forma"} e clique no
            tabuleiro para colocar.
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-md border-2 border-cyan-700 bg-cyan-50 p-3">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-800">
          {mode === "numbers" ? "Seu número" : "Sua forma"}
        </p>
        <div className="mt-2 flex h-20 items-center justify-center">
          {activeTool ? (
            <Piece
              className="h-14 w-14"
              mode={mode}
              settings={settings}
              shape={activeTool}
            />
          ) : (
            <Eraser className="size-10 text-stone-800" aria-label="Apagar" />
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {availableShapes.map((shape) => (
          <button
            aria-label={shapeLabels[shape]}
            className="flex aspect-square items-center justify-center rounded-md border border-stone-300 bg-stone-50 transition-colors hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 disabled:opacity-50"
            key={shape}
            onClick={() => onSelectTool(shape)}
            type="button"
          >
            <Piece
              className="h-[62%] w-[62%]"
              mode={mode}
              settings={settings}
              shape={shape}
            />
          </button>
        ))}

        {shouldShowEraser && (
          <button
            aria-label="Apagar"
            className="flex aspect-square items-center justify-center rounded-md border border-stone-300 bg-stone-50 transition-colors hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
            onClick={() => onSelectTool(null)}
            type="button"
          >
            <Eraser className="size-8 text-stone-800" />
          </button>
        )}
      </div>
    </div>
  );
}
