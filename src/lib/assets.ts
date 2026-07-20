import type { Shape } from "./sudoku";

export function shapeSrc(shape: Shape | "vazio") {
  return `${import.meta.env.BASE_URL}img/${shape}.svg`;
}
