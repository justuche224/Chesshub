import { Chess } from "chess.js";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { player1Id, player2Id } = body;

    if (!player1Id || !player2Id) {
      return new NextResponse("Both player IDs are required", { status: 400 });
    }

    const chess = new Chess();

    const newGame = await db.game.create({
      data: {
        fen: chess.fen(),
        status: "active",
        whitePlayerId: player1Id,
        blackPlayerId: player2Id,
        currentPlayer: chess.turn() === "w" ? player1Id : player2Id,
        moves: {
          create: [],
        },
      },
      include: {
        moves: true,
      },
    });
    console.log(newGame);

    return NextResponse.json(newGame);
  } catch (error) {
    console.error("Error processing move:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
