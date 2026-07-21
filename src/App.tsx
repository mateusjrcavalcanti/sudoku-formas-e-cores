import { useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { CellOptionsDialog } from "./components/CellOptionsDialog";
import { Confetti } from "./components/Confetti";
import { GameStatus } from "./components/GameStatus";
import { HowToPlayDialog } from "./components/HowToPlayDialog";
import {
  MusicControls,
  type SoundEffectEvent,
} from "./components/MusicControls";
import type { VisualMode } from "./components/Piece";
import { ShapePicker } from "./components/ShapePicker";
import { SudokuBoard } from "./components/SudokuBoard";
import { loadGameState, saveGameState } from "./lib/game-storage";
import { cn } from "./lib/utils";
import {
  type Board,
  type CellValue,
  type Difficulty,
  type Game,
  type Position,
  type Shape,
  createGame,
  defaultDifficulty,
  getConflicts,
  isComplete,
  isSolved,
  updateBoard,
} from "./lib/sudoku";

type AppState = {
  activeTool: CellValue;
  board: Board;
  game: Game;
  history: {
    past: Board[];
    future: Board[];
  };
  isStarted: boolean;
  elapsedSeconds: number;
  visualMode: VisualMode;
};

function createInitialState(): AppState {
  const savedState = loadGameState();

  if (savedState) {
    return isSolved(savedState.board, savedState.game.solution)
      ? {
          ...savedState,
          board: savedState.game.solution,
          history: {
            past: [],
            future: [],
          },
          isStarted: false,
        }
      : savedState;
  }

  return createPreviewGame();
}

function createPreviewGame(difficulty: Difficulty = defaultDifficulty): AppState {
  const game = createGame({ difficulty });

  return {
    activeTool: game.settings.shapes[0],
    board: game.puzzle,
    game,
    history: {
      past: [],
      future: [],
    },
    isStarted: false,
    elapsedSeconds: 0,
    visualMode: "shapes",
  };
}

function createStartedGame(difficulty: Difficulty = defaultDifficulty): AppState {
  const game = createGame({ difficulty });

  return {
    activeTool: game.settings.shapes[0],
    board: game.puzzle,
    game,
    history: {
      past: [],
      future: [],
    },
    isStarted: true,
    elapsedSeconds: 0,
    visualMode: "shapes",
  };
}

export function App() {
  const [state, setState] = useState(createInitialState);
  const isCompactLayout = useCompactLayout();
  const wasSolvedRef = useRef(isSolved(state.board, state.game.solution));
  const [celebrationKey, setCelebrationKey] = useState(0);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSoundOpen, setIsSoundOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<Position | null>(null);
  const [soundEffect, setSoundEffect] = useState<SoundEffectEvent | null>(null);
  const { activeTool, board, game } = state;
  const conflicts = useMemo(() => getConflicts(board), [board]);
  const solved = isSolved(board, game.solution);
  const complete = isComplete(board);
  const hasConflict = conflicts.some((row) => row.some(Boolean));
  const canRedo = state.history.future.length > 0;
  const canUndo = state.history.past.length > 0;
  const displayBoard = state.isStarted ? board : game.solution;
  const displayConflicts = state.isStarted
    ? conflicts
    : game.solution.map((row) => row.map(() => false));
  const displayFixed = state.isStarted
    ? game.fixed
    : game.solution.map((row) => row.map(() => true));
  const selectedCellValue = selectedCell
    ? (board[selectedCell.row]?.[selectedCell.column] ?? null)
    : null;

  useEffect(() => {
    saveGameState(state);
  }, [state]);

  useEffect(() => {
    if (!state.isStarted || !isCompactLayout) {
      setSelectedCell(null);
    }
  }, [isCompactLayout, state.isStarted]);

  useEffect(() => {
    if (!state.isStarted || solved) {
      return;
    }

    const timer = window.setInterval(() => {
      setState((current) => ({
        ...current,
        elapsedSeconds: current.elapsedSeconds + 1,
      }));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [state.isStarted, solved]);

  useEffect(() => {
    if (state.isStarted && solved && !wasSolvedRef.current) {
      setCelebrationKey((current) => current + 1);
      playSoundEffect("success");
    }

    wasSolvedRef.current = solved;
  }, [solved, state.isStarted]);

  function startNewGame() {
    setState((current) => ({
      ...createStartedGame(current.game.difficulty),
      visualMode: current.visualMode,
    }));
    setSelectedCell(null);
    setCelebrationKey(0);
  }

  function startCurrentGame() {
    if (isSolved(board, game.solution)) {
      startNewGame();
      return;
    }

    setState((current) => ({
      ...current,
      isStarted: true,
      elapsedSeconds: 0,
    }));
  }

  function completeGame() {
    setState((current) => ({
      ...current,
      board: current.game.solution,
      history: {
        past: [],
        future: [],
      },
      isStarted: false,
    }));
    setSelectedCell(null);
    setCelebrationKey((current) => current + 1);
    playSoundEffect("success");
  }

  function playCell(position: Position) {
    if (!state.isStarted) {
      return;
    }

    if (game.fixed[position.row][position.column]) {
      return;
    }

    if (isCompactLayout) {
      if (board[position.row][position.column] !== null) {
        commitBoardChange(position, null);
        return;
      }

      setSelectedCell(position);
      return;
    }

    commitBoardChange(position, activeTool);
  }

  function clearCell(position: Position) {
    if (!state.isStarted) {
      return;
    }

    if (game.fixed[position.row][position.column]) {
      return;
    }

    commitBoardChange(position, null);
  }

  function chooseTool(tool: Shape | null) {
    setState((current) => ({
      ...current,
      activeTool: tool,
    }));
  }

  function chooseCellValue(value: Shape | null) {
    if (!selectedCell) {
      return;
    }

    commitBoardChange(selectedCell, value);
    setSelectedCell(null);
  }

  function changeDifficulty(difficulty: Difficulty) {
    setState((current) =>
      ({
        ...(current.isStarted
          ? createStartedGame(difficulty)
          : createPreviewGame(difficulty)),
        visualMode: current.visualMode,
      }),
    );
    setSelectedCell(null);
    setCelebrationKey(0);
  }

  function toggleVisualMode() {
    setState((current) => ({
      ...current,
      visualMode: current.visualMode === "shapes" ? "numbers" : "shapes",
    }));
  }

  function commitBoardChange(position: Position, value: CellValue) {
    const nextBoard = updateBoard(board, position, value);

    if (areBoardsEqual(board, nextBoard)) {
      return;
    }

    if (!solved && getConflicts(nextBoard).some((row) => row.some(Boolean))) {
      playSoundEffect("error");
    }

    setState((current) => ({
      ...current,
      board: nextBoard,
      history: {
        past: [...current.history.past, current.board],
        future: [],
      },
    }));
  }

  function undo() {
    setState((current) => {
      const previousBoard = current.history.past[current.history.past.length - 1];

      if (!previousBoard) {
        return current;
      }

      return {
        ...current,
        board: previousBoard,
        history: {
          past: current.history.past.slice(0, -1),
          future: [current.board, ...current.history.future],
        },
      };
    });
  }

  function redo() {
    setState((current) => {
      const nextBoard = current.history.future[0];

      if (!nextBoard) {
        return current;
      }

      return {
        ...current,
        board: nextBoard,
        history: {
          past: [...current.history.past, current.board],
          future: current.history.future.slice(1),
        },
      };
    });
  }

  function playSoundEffect(type: SoundEffectEvent["type"]) {
    setSoundEffect((current) => ({
      id: (current?.id ?? 0) + 1,
      type,
    }));
  }

  return (
    <main className="h-dvh overflow-hidden bg-[#f7f5f1] text-stone-950">
      <Confetti triggerKey={celebrationKey} />

      <section className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col px-3 py-3 sm:px-5 sm:py-4 lg:px-8 lg:py-6">
        <AppHeader
          canRedo={canRedo}
          canUndo={canUndo}
          difficulty={game.difficulty}
          elapsedSeconds={state.elapsedSeconds}
          settings={game.settings}
          visualMode={state.visualMode}
          onChangeDifficulty={changeDifficulty}
          onComplete={completeGame}
          onHelp={() => setIsHelpOpen(true)}
          onNewGame={startNewGame}
          onRedo={redo}
          onSound={() => setIsSoundOpen(true)}
          onToggleVisualMode={toggleVisualMode}
          onUndo={undo}
        />

        <div
          className={cn(
            "grid min-h-0 flex-1 gap-3 py-3 transition-all duration-500 sm:gap-4 sm:py-4 lg:gap-6 lg:py-6",
            state.isStarted
              ? "grid-rows-[minmax(0,1fr)_auto] items-start lg:grid-cols-[minmax(0,1fr)_260px] lg:grid-rows-1"
              : "place-items-center",
          )}
        >
          <div
            className={cn(
              "relative flex min-h-0 w-full items-center justify-center",
              state.isStarted ? "animate-board-active" : "animate-board-preview",
            )}
          >
            <div
              className={cn(
                "flex min-h-0 w-full justify-center transition duration-500",
                !state.isStarted && "pointer-events-none blur-sm",
              )}
            >
              <SudokuBoard
                board={displayBoard}
                conflicts={displayConflicts}
                fixed={displayFixed}
                mode={state.visualMode}
                settings={game.settings}
                onClearCell={clearCell}
                onPlayCell={playCell}
              />
            </div>

            {!state.isStarted && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  className="animate-start-button rounded-md bg-stone-950 px-7 py-3 text-base font-semibold text-white shadow-xl transition-colors hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
                  onClick={startCurrentGame}
                  type="button"
                >
                  Começar
                </button>
              </div>
            )}
          </div>

          {state.isStarted && (
            <aside className="animate-side-panel min-h-0 space-y-2 lg:space-y-3">
              <div className="hidden lg:block">
                <ShapePicker
                  activeTool={activeTool}
                  mode={state.visualMode}
                  settings={game.settings}
                  shapes={game.settings.shapes}
                  onSelectTool={chooseTool}
                />
              </div>
              <GameStatus
                complete={complete}
                hasConflict={hasConflict}
                mode={state.visualMode}
                solved={solved}
              />
            </aside>
          )}
        </div>
      </section>

      <MusicControls
        effectEvent={soundEffect}
        isOpen={isSoundOpen}
        isStarted={state.isStarted}
        onClose={() => setIsSoundOpen(false)}
      />
      {isHelpOpen && (
        <HowToPlayDialog
          settings={game.settings}
          visualMode={state.visualMode}
          onClose={() => setIsHelpOpen(false)}
        />
      )}
      {selectedCell && (
        <CellOptionsDialog
          currentValue={selectedCellValue}
          mode={state.visualMode}
          position={selectedCell}
          settings={game.settings}
          onChoose={chooseCellValue}
          onClose={() => setSelectedCell(null)}
        />
      )}
    </main>
  );
}

function useCompactLayout(): boolean {
  const [isCompact, setIsCompact] = useState(() =>
    window.matchMedia("(max-width: 1023px)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");

    function updateCompactLayout() {
      setIsCompact(mediaQuery.matches);
    }

    updateCompactLayout();
    mediaQuery.addEventListener("change", updateCompactLayout);

    return () => {
      mediaQuery.removeEventListener("change", updateCompactLayout);
    };
  }, []);

  return isCompact;
}

function areBoardsEqual(first: Board, second: Board): boolean {
  return first.every((row, rowIndex) =>
    row.every((cell, columnIndex) => cell === second[rowIndex][columnIndex]),
  );
}
