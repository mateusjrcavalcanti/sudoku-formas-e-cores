export type Shape =
  | "circulo"
  | "triangulo"
  | "quadrado"
  | "retangulo"
  | "pentagono"
  | "hexagono";

export type CellValue = Shape | null;
export type Board = CellValue[][];
export type Solution = Shape[][];
export type FixedCells = boolean[][];
export type Conflicts = boolean[][];
export type Difficulty = "muito-facil" | "facil" | "medio";

export type Position = Readonly<{
  row: number;
  column: number;
}>;

export type Game = {
  difficulty: Difficulty;
  settings: DifficultySettings;
  puzzle: Board;
  solution: Solution;
  fixed: FixedCells;
};

export type CreateGameOptions = {
  difficulty?: Difficulty;
  clues?: number;
};

export type DifficultySettings = Readonly<{
  blockColumns: number | null;
  blockRows: number | null;
  clues: number;
  label: string;
  shapes: readonly Shape[];
  size: number;
}>;

export const shapes = [
  "circulo",
  "triangulo",
  "quadrado",
  "retangulo",
  "pentagono",
  "hexagono",
] as const satisfies readonly Shape[];

export const shapeLabels: Record<Shape, string> = {
  circulo: "Círculo",
  triangulo: "Triângulo",
  quadrado: "Quadrado",
  retangulo: "Retângulo",
  pentagono: "Pentágono",
  hexagono: "Hexágono",
};

type Unit = Position[];

export const difficulties: Record<Difficulty, DifficultySettings> = {
  "muito-facil": {
    blockColumns: null,
    blockRows: null,
    clues: 4,
    label: "Muito fácil",
    shapes: shapes.slice(0, 3),
    size: 3,
  },
  facil: {
    blockColumns: 2,
    blockRows: 2,
    clues: 8,
    label: "Fácil",
    shapes: shapes.slice(0, 4),
    size: 4,
  },
  medio: {
    blockColumns: 3,
    blockRows: 2,
    clues: 18,
    label: "Médio",
    shapes,
    size: 6,
  },
};

export const defaultDifficulty: Difficulty = "medio";

export function createGame({
  clues,
  difficulty = defaultDifficulty,
}: CreateGameOptions = {}): Game {
  const settings = difficulties[difficulty];
  const solution = generateSolution(settings);
  const puzzle = hideCells(
    solution,
    normalizeClues(clues ?? settings.clues, settings),
    settings,
  );
  const fixed = mapBoard(puzzle, (cell) => cell !== null);

  return { difficulty, fixed, puzzle, settings, solution };
}

export function updateBoard(
  board: Board,
  position: Position,
  value: CellValue,
): Board {
  return mapBoard(board, (cell, current) =>
    samePosition(current, position) ? value : cell,
  );
}

export function isComplete(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell !== null));
}

export function getConflicts(board: Board): Conflicts {
  const conflictKeys = new Set<string>();

  buildUnits(resolveSettings(board)).forEach((unit) => {
    const repeated = findRepeatedPositions(unit, board);

    repeated.forEach((position) => {
      conflictKeys.add(toPositionKey(position));
    });
  });

  const settings = resolveSettings(board);

  return createGrid(settings, ({ row, column }) =>
    conflictKeys.has(toPositionKey({ row, column })),
  );
}

export function isSolved(board: Board, solution: Solution): boolean {
  return board.every((row, rowIndex) =>
    row.every((cell, columnIndex) => cell === solution[rowIndex][columnIndex]),
  );
}

function generateSolution(settings: DifficultySettings): Solution {
  const board = createGrid(settings, () => null);
  const solved = fillNextCell(board, 0, settings);

  if (!solved) {
    throw new Error("Não foi possível gerar uma solução de Sudoku.");
  }

  return board as unknown as Solution;
}

function fillNextCell(
  board: Board,
  index: number,
  settings: DifficultySettings,
): boolean {
  if (index === settings.size * settings.size) {
    return true;
  }

  const position = indexToPosition(index, settings);

  for (const shape of shuffle(settings.shapes)) {
    if (!canPlaceShape(board, position, shape, settings)) {
      continue;
    }

    board[position.row][position.column] = shape;

    if (fillNextCell(board, index + 1, settings)) {
      return true;
    }

    board[position.row][position.column] = null;
  }

  return false;
}

function canPlaceShape(
  board: Board,
  position: Position,
  shape: Shape,
  settings: DifficultySettings,
): boolean {
  return buildUnits(settings)
    .filter((unit) => unitContains(unit, position))
    .every((unit) =>
      unit.every(({ row, column }) => board[row][column] !== shape),
    );
}

function hideCells(
  solution: Solution,
  clues: number,
  settings: DifficultySettings,
): Board {
  const visibleKeys = new Set(
    shuffle(range(settings.size * settings.size))
      .slice(0, clues)
      .map((index) => toPositionKey(indexToPosition(index, settings))),
  );

  return mapBoard(solution, (shape, position) =>
    visibleKeys.has(toPositionKey(position)) ? shape : null,
  );
}

function findRepeatedPositions(unit: Unit, board: Board): Position[] {
  const positionsByShape = new Map<Shape, Position[]>();

  unit.forEach((position) => {
    const value = board[position.row][position.column];

    if (value === null) {
      return;
    }

    positionsByShape.set(value, [
      ...(positionsByShape.get(value) ?? []),
      position,
    ]);
  });

  return [...positionsByShape.values()].flatMap((positions) =>
    positions.length > 1 ? positions : [],
  );
}

function buildUnits(settings: DifficultySettings): Unit[] {
  return [
    ...range(settings.size).map((row) =>
      range(settings.size).map((column) => ({ row, column })),
    ),
    ...range(settings.size).map((column) =>
      range(settings.size).map((row) => ({ row, column })),
    ),
    ...buildBlockUnits(settings),
  ];
}

function buildBlockUnits(settings: DifficultySettings): Unit[] {
  if (!settings.blockRows || !settings.blockColumns) {
    return [];
  }

  const blockRows = settings.size / settings.blockRows;
  const blockColumns = settings.size / settings.blockColumns;

  return range(blockRows).flatMap((blockRow) =>
    range(blockColumns).map((blockColumn) => {
      const rowStart = blockRow * settings.blockRows!;
      const columnStart = blockColumn * settings.blockColumns!;

      return range(settings.blockRows! * settings.blockColumns!).map((index) => ({
        row: rowStart + Math.floor(index / settings.blockColumns!),
        column: columnStart + (index % settings.blockColumns!),
      }));
    }),
  );
}

function mapBoard<T>(
  board: Board | Solution,
  mapper: (cell: Shape | CellValue, position: Position) => T,
): T[][] {
  return board.map((row, rowIndex) =>
    row.map((cell, columnIndex) =>
      mapper(cell, { row: rowIndex, column: columnIndex }),
    ),
  );
}

function createGrid<T>(
  settings: DifficultySettings,
  factory: (position: Position) => T,
): T[][] {
  return range(settings.size).map((row) =>
    range(settings.size).map((column) => factory({ row, column })),
  );
}

function normalizeClues(clues: number, settings: DifficultySettings): number {
  if (!Number.isFinite(clues)) {
    return settings.clues;
  }

  return Math.min(Math.max(Math.floor(clues), 0), settings.size * settings.size);
}

function indexToPosition(index: number, settings: DifficultySettings): Position {
  return {
    row: Math.floor(index / settings.size),
    column: index % settings.size,
  };
}

function resolveSettings(board: Board | Solution): DifficultySettings {
  const size = board.length;
  const difficulty = Object.values(difficulties).find(
    (settings) => settings.size === size,
  );

  if (!difficulty) {
    throw new Error(`Tamanho de tabuleiro não suportado: ${size}.`);
  }

  return difficulty;
}

function samePosition(first: Position, second: Position): boolean {
  return first.row === second.row && first.column === second.column;
}

function toPositionKey({ row, column }: Position): string {
  return `${row}:${column}`;
}

function unitContains(unit: Unit, position: Position): boolean {
  return unit.some((candidate) => samePosition(candidate, position));
}

function range(length: number): number[] {
  return Array.from({ length }, (_, index) => index);
}

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}
