import { z } from "zod";
import type { Board, CellValue, Game } from "./sudoku";
import { difficulties, shapes } from "./sudoku";

const STORAGE_KEY = "sudoku-formas-e-cores:game-state:v1";

const shapeSchema = z.enum(shapes);
const cellSchema = shapeSchema.nullable();
const difficultySchema = z.enum(["muito-facil", "facil", "medio"]);
const visualModeSchema = z.enum(["shapes", "numbers"]);
const difficultySettingsSchema = z.object({
  blockColumns: z.number().int().positive().nullable(),
  blockRows: z.number().int().positive().nullable(),
  clues: z.number().int().nonnegative(),
  label: z.string(),
  shapes: z.array(shapeSchema),
  size: z.number().int().positive(),
});
const boardSchema = z.array(z.array(cellSchema));
const solutionSchema = z.array(z.array(shapeSchema));
const fixedCellsSchema = z.array(z.array(z.boolean()));

const gameStateSchema = z.object({
  activeTool: cellSchema,
  board: boardSchema,
  elapsedSeconds: z.number().int().nonnegative().catch(0).default(0),
  game: z.object({
    difficulty: difficultySchema,
    fixed: fixedCellsSchema,
    puzzle: boardSchema,
    settings: difficultySettingsSchema,
    solution: solutionSchema,
  }),
  history: z.object({
    future: z.array(boardSchema),
    past: z.array(boardSchema),
  }),
  isStarted: z.boolean().catch(false).default(false),
  visualMode: visualModeSchema.catch("shapes").default("shapes"),
}).superRefine((state, context) => {
  const settings = difficulties[state.game.difficulty];

  if (!hasBoardSize(state.board, settings.size)) {
    context.addIssue({
      code: "custom",
      message: "Board size does not match difficulty.",
      path: ["board"],
    });
  }

  if (!hasBoardSize(state.game.puzzle, settings.size)) {
    context.addIssue({
      code: "custom",
      message: "Puzzle size does not match difficulty.",
      path: ["game", "puzzle"],
    });
  }

  if (!hasBoardSize(state.game.solution, settings.size)) {
    context.addIssue({
      code: "custom",
      message: "Solution size does not match difficulty.",
      path: ["game", "solution"],
    });
  }

  if (!hasBoardSize(state.game.fixed, settings.size)) {
    context.addIssue({
      code: "custom",
      message: "Fixed cells size does not match difficulty.",
      path: ["game", "fixed"],
    });
  }
});

export type PersistedGameState = {
  activeTool: CellValue;
  board: Board;
  elapsedSeconds: number;
  game: Game;
  history: {
    future: Board[];
    past: Board[];
  };
  isStarted: boolean;
  visualMode: "shapes" | "numbers";
};

export function loadGameState(): PersistedGameState | null {
  const rawState = window.localStorage.getItem(STORAGE_KEY);

  if (!rawState) {
    return null;
  }

  try {
    const result = gameStateSchema.safeParse(JSON.parse(rawState));

    if (result.success) {
      return {
        ...result.data,
        game: {
          ...result.data.game,
          settings: difficulties[result.data.game.difficulty],
        },
      };
    }

    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveGameState(state: PersistedGameState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hasBoardSize(board: unknown[][], size: number): boolean {
  return board.length === size && board.every((row) => row.length === size);
}
