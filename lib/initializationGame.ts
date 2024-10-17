"use server";

import { Chess } from "chess.js";
import { db } from "./db";

export async function initializeGame(
  whitePlayerId: string,
  blackPlayerId: string
) {
  const chess = new Chess();

  const game = await db.game.create({
    data: {
      whitePlayerId,
      blackPlayerId,
      fen: chess.fen(),
      moveHistory: [],
      capturedPieces: { white: [], black: [] },
      status: "ongoing",
    },
  });

  return game;
}
