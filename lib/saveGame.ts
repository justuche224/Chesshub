"use server";

import { CapturedPieces } from "@/components/game/GameBoard.chessjs";
// Updated makeMove function
import { db } from "./db";

export async function saveGame(gameData: {
  id: string;
  fen: string;
  moveHistory: string[];
  // capturedPieces: CapturedPieces;
  status: string;
}) {
  const { id, ...data } = gameData;
  // console.log(gameData.capturedPieces);

  return db.game.update({
    where: { id },
    data,
  });
}

export async function saveCapturedPieces(gameData: {
  id: string;
  capturedPieces: CapturedPieces;
}) {
  const { id, ...data } = gameData;
  console.log(gameData.capturedPieces);

  return db.game.update({
    where: { id },
    data,
  });
}
