import type { VisualMode } from "./Piece";
import { CheckCircle2 } from "lucide-react";

type GameStatusProps = {
  complete: boolean;
  hasConflict: boolean;
  mode: VisualMode;
  solved: boolean;
};

export function GameStatus({
  complete,
  hasConflict,
  mode,
  solved,
}: GameStatusProps) {
  const pieceName = mode === "numbers" ? "número" : "forma";
  const pieceNamePlural = mode === "numbers" ? "números" : "formas";
  const message = solved
    ? "Muito bem! Você completou tudo."
    : hasConflict
      ? `Ops! Tem ${pieceName} repetido.`
      : complete
        ? `Quase lá! Revise os ${pieceNamePlural}.`
        : `Escolha ${mode === "numbers" ? "um número" : "uma forma"} e complete os espaços.`;

  return (
    <div className="rounded-md border border-stone-300 bg-white p-4 text-sm leading-6 text-stone-600 shadow-sm">
      <div className="mb-2 flex items-center gap-2 font-medium text-stone-950">
        <CheckCircle2 className="size-4 text-cyan-700" />
        Como está indo?
      </div>
      {message}
    </div>
  );
}
