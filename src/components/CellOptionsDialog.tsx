import { X } from "lucide-react";
import { Piece, type VisualMode } from "./Piece";
import type { CellValue, DifficultySettings, Position, Shape } from "../lib/sudoku";
import { shapeLabels } from "../lib/sudoku";
import { Button } from "./ui/button";

type CellOptionsDialogProps = {
  currentValue: CellValue;
  mode: VisualMode;
  position: Position;
  settings: DifficultySettings;
  onChoose: (value: Shape | null) => void;
  onClose: () => void;
};

export function CellOptionsDialog({
  currentValue,
  mode,
  position,
  settings,
  onChoose,
  onClose,
}: CellOptionsDialogProps) {
  return (
    <div
      aria-labelledby="cell-options-title"
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-end justify-center bg-stone-950/45 px-3 pb-3 pt-16 sm:items-center sm:p-4 lg:hidden"
      role="dialog"
    >
      <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-stone-200 pb-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-700">
              Linha {position.row + 1}, coluna {position.column + 1}
            </p>
            <h2 id="cell-options-title" className="mt-1 text-lg font-semibold">
              Escolha {mode === "numbers" ? "um número" : "uma forma"}
            </h2>
          </div>

          <Button
            aria-label="Fechar opções"
            onClick={onClose}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {settings.shapes.map((shape) => {
            const selected = shape === currentValue;

            return (
              <button
                aria-label={shapeLabels[shape]}
                aria-pressed={selected}
                className="flex aspect-square items-center justify-center rounded-md border border-stone-300 bg-stone-50 transition-colors hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 aria-pressed:border-cyan-700 aria-pressed:bg-cyan-50"
                key={shape}
                onClick={() => onChoose(shape)}
                type="button"
              >
                <Piece
                  className="h-[62%] w-[62%]"
                  mode={mode}
                  settings={settings}
                  shape={shape}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
