import {
  Binary,
  Check,
  HelpCircle,
  Redo2,
  RotateCcw,
  Shapes,
  Undo2,
  Volume2,
} from "lucide-react";
import type { VisualMode } from "./Piece";
import type { Difficulty, DifficultySettings } from "../lib/sudoku";
import { difficulties } from "../lib/sudoku";
import { Button } from "./ui/button";

type AppHeaderProps = {
  canRedo: boolean;
  canUndo: boolean;
  difficulty: Difficulty;
  elapsedSeconds: number;
  visualMode: VisualMode;
  settings: DifficultySettings;
  onChangeDifficulty: (difficulty: Difficulty) => void;
  onComplete: () => void;
  onHelp: () => void;
  onNewGame: () => void;
  onRedo: () => void;
  onSound: () => void;
  onToggleVisualMode: () => void;
  onUndo: () => void;
};

export function AppHeader({
  canRedo,
  canUndo,
  difficulty,
  elapsedSeconds,
  visualMode,
  settings,
  onChangeDifficulty,
  onComplete,
  onHelp,
  onNewGame,
  onRedo,
  onSound,
  onToggleVisualMode,
  onUndo,
}: AppHeaderProps) {
  const visualLabel =
    visualMode === "numbers" ? "Usar formas" : "Usar números coloridos";
  const blockText =
    settings.blockRows && settings.blockColumns
      ? `bloco ${settings.blockRows}x${settings.blockColumns}`
      : "sem blocos";

  return (
    <header className="flex shrink-0 flex-col gap-2 border-b border-stone-300 pb-2 sm:gap-3 sm:pb-4 lg:gap-4 lg:pb-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-cyan-700 sm:text-sm sm:tracking-[0.18em]">
          Sudoku {settings.size}x{settings.size}
        </p>
        <h1 className="mt-1 text-xl font-semibold leading-tight sm:mt-2 sm:text-3xl lg:text-4xl">
          Sudoku de Formas e Cores
        </h1>
        <p className="mt-2 hidden max-w-2xl text-sm leading-6 text-stone-600 sm:block">
          Complete cada linha e coluna usando {settings.shapes.length}{" "}
          {visualMode === "numbers" ? "números coloridos" : "formas"} sem
          repetir. Este modo é {blockText}.
        </p>
      </div>

      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex items-center gap-2">
          <label className="inline-flex h-9 w-fit min-w-0 items-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-stone-950 shadow-sm ring-1 ring-stone-200 sm:h-10">
            <span className="sr-only">Dificuldade</span>
            <select
              aria-label="Dificuldade"
              className="w-auto min-w-0 bg-transparent text-sm font-semibold outline-none"
              onChange={(event) =>
                onChangeDifficulty(event.target.value as Difficulty)
              }
              value={difficulty}
            >
              {Object.entries(difficulties).map(([value, option]) => (
                <option key={value} value={value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="inline-flex h-9 items-center rounded-md bg-white px-3 text-sm font-semibold text-stone-950 shadow-sm ring-1 ring-stone-200 sm:h-10 sm:px-4">
            {formatElapsedTime(elapsedSeconds)}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:flex sm:items-center">
          <Button
            aria-label={visualLabel}
            onClick={onToggleVisualMode}
            title={visualLabel}
            size="icon"
            type="button"
            variant="secondary"
          >
            {visualMode === "numbers" ? (
              <Shapes className="size-4" />
            ) : (
              <Binary className="size-4" />
            )}
          </Button>

          <Button
            aria-label="Como brincar"
            onClick={onHelp}
            size="icon"
            title="Como brincar"
            type="button"
            variant="secondary"
          >
            <HelpCircle className="size-4" />
          </Button>

          <Button
            aria-label="Som"
            onClick={onSound}
            size="icon"
            title="Som"
            type="button"
            variant="secondary"
          >
            <Volume2 className="size-4" />
          </Button>

          <Button
            aria-label="Desfazer"
            disabled={!canUndo}
            onClick={onUndo}
            size="icon"
            title="Desfazer"
            type="button"
            variant="secondary"
          >
            <Undo2 className="size-4" />
          </Button>

          <Button
            aria-label="Refazer"
            disabled={!canRedo}
            onClick={onRedo}
            size="icon"
            title="Refazer"
            type="button"
            variant="secondary"
          >
            <Redo2 className="size-4" />
          </Button>

          <Button
            aria-label="Completar jogo"
            onClick={onComplete}
            size="icon"
            title="Completar jogo"
            type="button"
            variant="secondary"
          >
            <Check className="size-4" />
          </Button>

          <Button
            aria-label="Novo jogo"
            onClick={onNewGame}
            size="icon"
            title="Novo jogo"
            type="button"
            variant="secondary"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

function formatElapsedTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}
