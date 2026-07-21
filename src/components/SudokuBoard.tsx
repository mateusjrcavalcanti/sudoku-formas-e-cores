import { Piece, type VisualMode } from "./Piece";
import type { Board, DifficultySettings, Position } from "../lib/sudoku";
import { cn } from "../lib/utils";

type SudokuBoardProps = {
  board: Board;
  conflicts: boolean[][];
  fixed: boolean[][];
  mode: VisualMode;
  settings: DifficultySettings;
  onClearCell: (position: Position) => void;
  onPlayCell: (position: Position) => void;
};

export function SudokuBoard({
  board,
  conflicts,
  fixed,
  mode,
  settings,
  onClearCell,
  onPlayCell,
}: SudokuBoardProps) {
  return (
    <section
      aria-label="Tabuleiro do sudoku"
      className="flex min-h-0 w-full justify-center"
    >
      <div
        className="grid aspect-square w-full max-w-[min(92vw,calc(100dvh-210px),640px)] overflow-hidden rounded-lg border-4 border-stone-950 bg-stone-950 shadow-sm sm:max-w-[min(88vw,calc(100dvh-230px),640px)] lg:max-w-[min(62vw,calc(100dvh-230px),640px)]"
        style={{
          gridTemplateColumns: `repeat(${settings.size}, minmax(0, 1fr))`,
        }}
      >
        {board.flatMap((row, rowIndex) =>
          row.map((cell, columnIndex) => {
            const isFixed = fixed[rowIndex][columnIndex];
            const hasCellConflict = conflicts[rowIndex][columnIndex];

            return (
              <button
                aria-label={`Linha ${rowIndex + 1}, coluna ${columnIndex + 1}`}
                className={cn(
                  "relative flex aspect-square items-center justify-center border-stone-950 bg-white transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700",
                  getColumnBorderClass(columnIndex, settings),
                  getRowBorderClass(rowIndex, settings),
                  isFixed && "cursor-not-allowed bg-stone-200",
                  !isFixed && !hasCellConflict && "hover:bg-cyan-50",
                  hasCellConflict &&
                    "bg-red-200 shadow-[inset_0_0_0_3px_rgba(220,38,38,0.72)]",
                )}
                aria-disabled={isFixed}
                key={`${rowIndex}-${columnIndex}`}
                onClick={() => onPlayCell({ row: rowIndex, column: columnIndex })}
                onContextMenu={(event) => {
                  event.preventDefault();
                  onClearCell({ row: rowIndex, column: columnIndex });
                }}
                type="button"
              >
                <Piece
                  className={cn(
                    "h-[58%] w-[58%] select-none",
                    mode === "numbers" && "h-[54%] w-[54%]",
                    isFixed && mode === "shapes" && "opacity-85",
                  )}
                  mode={mode}
                  settings={settings}
                  shape={cell}
                />
              </button>
            );
          }),
        )}
      </div>
    </section>
  );
}

function getColumnBorderClass(
  columnIndex: number,
  settings: DifficultySettings,
): string {
  const isLastColumn = columnIndex === settings.size - 1;
  const closesBlock =
    settings.blockColumns !== null &&
    (columnIndex + 1) % settings.blockColumns === 0;

  if (isLastColumn) {
    return "";
  }

  return closesBlock ? "border-r-4" : "border-r";
}

function getRowBorderClass(
  rowIndex: number,
  settings: DifficultySettings,
): string {
  const isLastRow = rowIndex === settings.size - 1;
  const closesBlock =
    settings.blockRows !== null && (rowIndex + 1) % settings.blockRows === 0;

  if (isLastRow) {
    return "";
  }

  return closesBlock ? "border-b-4" : "border-b";
}
