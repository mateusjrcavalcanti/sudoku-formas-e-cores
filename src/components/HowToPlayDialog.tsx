import { Eraser, Mouse, MousePointerClick, Shapes, X } from "lucide-react";
import { Piece, type VisualMode } from "./Piece";
import type { DifficultySettings, Shape } from "../lib/sudoku";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

type HowToPlayDialogProps = {
  settings: DifficultySettings;
  visualMode: VisualMode;
  onClose: () => void;
};

export function HowToPlayDialog({
  settings,
  visualMode,
  onClose,
}: HowToPlayDialogProps) {
  const board = createExampleBoard(settings);
  const pieceName = visualMode === "numbers" ? "números coloridos" : "formas";
  const pieceNameSingular = visualMode === "numbers" ? "número" : "forma";
  const blockDescription =
    settings.blockRows && settings.blockColumns
      ? `Cada bloco ${settings.blockRows}x${settings.blockColumns} também usa todos os ${pieceName} sem repetir.`
      : "Neste modo não há blocos: olhe apenas para linhas e colunas.";

  return (
    <div
      aria-labelledby="how-to-play-title"
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-center justify-center bg-stone-950/55 px-4 py-6"
      role="dialog"
    >
      <div className="max-h-full w-full max-w-2xl overflow-auto rounded-lg bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-cyan-700">
              Ajuda
            </p>
            <h2 id="how-to-play-title" className="mt-1 text-2xl font-semibold">
              Como brincar
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Modo {settings.label}: tabuleiro {settings.size}x{settings.size}{" "}
              com {settings.shapes.length} {pieceName}.
            </p>
          </div>

          <Button
            aria-label="Fechar ajuda"
            onClick={onClose}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="mt-5 space-y-4 text-sm leading-6 text-stone-700">
          <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
            <h3 className="font-semibold text-stone-950">Regras deste modo</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <RuleExample
                board={board}
                highlight={{ kind: "row", index: 0 }}
                label="Linha"
                visualMode={visualMode}
                settings={settings}
                text={`A linha precisa ter todos os ${pieceName} sem repetir.`}
              />
              <RuleExample
                board={board}
                highlight={{ kind: "column", index: 0 }}
                label="Coluna"
                visualMode={visualMode}
                settings={settings}
                text={`A coluna também não pode repetir ${pieceNameSingular}.`}
              />
              <RuleExample
                board={board}
                highlight={{ kind: "block" }}
                label={settings.blockRows ? "Bloco" : "Sem blocos"}
                visualMode={visualMode}
                settings={settings}
                text={blockDescription}
              />
            </div>
          </div>

          <div className="flex gap-3 rounded-md bg-cyan-50 p-3">
            <Shapes className="mt-1 size-5 shrink-0 text-cyan-700" />
            <p>
              Escolha {visualMode === "numbers" ? "um número" : "uma forma"}.
              {visualMode === "numbers" ? " Ele" : " Ela"} fica pronto para
              entrar no tabuleiro.
            </p>
          </div>

          <div className="flex gap-3 rounded-md bg-stone-50 p-3">
            <MousePointerClick className="mt-1 size-5 shrink-0 text-stone-800" />
            <p>
              Clique com o botão esquerdo em uma casa vazia para colocar{" "}
              {visualMode === "numbers" ? "o número" : "a forma"} escolhida.
            </p>
          </div>

          <div className="flex gap-3 rounded-md bg-rose-50 p-3">
            <Mouse className="mt-1 size-5 shrink-0 text-rose-700" />
            <p>
              Clique com o botão direito em uma casa para apagar o que você
              colocou.
            </p>
          </div>

          <div className="flex gap-3 rounded-md bg-amber-50 p-3">
            <Eraser className="mt-1 size-5 shrink-0 text-amber-700" />
            <p>
              Você também pode escolher o apagar e clicar nas casas que quer
              limpar.
            </p>
          </div>

          <p>
            Se uma casa ficar vermelha, tem {pieceNameSingular} repetido por
            perto.
          </p>
        </div>
      </div>
    </div>
  );
}

type Highlight =
  | { kind: "row"; index: number }
  | { kind: "column"; index: number }
  | { kind: "block" };

type RuleExampleProps = {
  board: Shape[][];
  highlight: Highlight;
  label: string;
  settings: DifficultySettings;
  text: string;
  visualMode: VisualMode;
};

function RuleExample({
  board,
  highlight,
  label,
  settings,
  text,
  visualMode,
}: RuleExampleProps) {
  return (
    <div className="rounded-md bg-white p-3 shadow-sm ring-1 ring-stone-200">
      <p className="font-semibold text-stone-950">{label}</p>
      <MiniBoard
        board={board}
        highlight={highlight}
        settings={settings}
        visualMode={visualMode}
      />
      <p className="mt-2 text-xs leading-5 text-stone-600">{text}</p>
    </div>
  );
}

type MiniBoardProps = {
  board: Shape[][];
  highlight: Highlight;
  settings: DifficultySettings;
  visualMode: VisualMode;
};

function MiniBoard({
  board,
  highlight,
  settings,
  visualMode,
}: MiniBoardProps) {
  return (
    <div
      aria-hidden="true"
      className="mt-2 grid aspect-square overflow-hidden rounded-md border-2 border-stone-900 bg-stone-900"
      style={{
        gridTemplateColumns: `repeat(${settings.size}, minmax(0, 1fr))`,
      }}
    >
      {board.flatMap((row, rowIndex) =>
        row.map((shape, columnIndex) => {
          const highlighted = isHighlighted(rowIndex, columnIndex, highlight, settings);

          return (
            <div
              className={cn(
                "flex aspect-square items-center justify-center bg-white",
                getColumnBorderClass(columnIndex, settings),
                getRowBorderClass(rowIndex, settings),
                highlighted ? "bg-cyan-50" : "opacity-35",
              )}
              key={`${rowIndex}-${columnIndex}`}
            >
              <Piece
                className="h-[56%] w-[56%]"
                mode={visualMode}
                settings={settings}
                shape={shape}
              />
            </div>
          );
        }),
      )}
    </div>
  );
}

function createExampleBoard(settings: DifficultySettings): Shape[][] {
  return Array.from({ length: settings.size }, (_, row) =>
    Array.from({ length: settings.size }, (_, column) => {
      const blockOffset =
        settings.blockRows && settings.blockColumns
          ? settings.blockColumns * (row % settings.blockRows) +
            Math.floor(row / settings.blockRows)
          : row;
      const shapeIndex = (blockOffset + column) % settings.size;

      return settings.shapes[shapeIndex];
    }),
  );
}

function isHighlighted(
  row: number,
  column: number,
  highlight: Highlight,
  settings: DifficultySettings,
): boolean {
  if (highlight.kind === "row") {
    return row === highlight.index;
  }

  if (highlight.kind === "column") {
    return column === highlight.index;
  }

  if (!settings.blockRows || !settings.blockColumns) {
    return false;
  }

  return row < settings.blockRows && column < settings.blockColumns;
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

  return closesBlock ? "border-r-2 border-stone-900" : "border-r border-stone-300";
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

  return closesBlock ? "border-b-2 border-stone-900" : "border-b border-stone-300";
}
