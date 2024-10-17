"use server";

import { CapturedPieces } from "@/components/game/GameBoard.chessjs";
import { db } from "./db";

export async function loadGame(id: string) {
  const game = await db.game.findUnique({
    where: { id },
  });

  if (game) {
    return {
      ...game,
      capturedPieces: game.capturedPieces as CapturedPieces,
    };
  }

  return null;
}
