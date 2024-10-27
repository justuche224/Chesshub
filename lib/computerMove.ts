import { Chess, Move } from "chess.js";
import { AIType } from "@prisma/client";

type ComputerMoveProp = {
  difficulty: AIType;
  fen: string;
};

export const computerMove = async ({
  difficulty,
  fen,
}: ComputerMoveProp): Promise<Move | null> => {
  const chess = new Chess(fen);

  if (difficulty === AIType.BasicAI) {
    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * moves.length);
    const randomMove = moves[randomIndex];
    chess.move(randomMove);
    // console.log("AI's move:", randomMove);
    return randomMove;
  }

  if (difficulty === AIType.SmartAI) {
    const moves = chess.moves({ verbose: true });
    const captureMoves = moves.filter((move) => move.captured);

    if (captureMoves.length > 0) {
      const randomCapture =
        captureMoves[Math.floor(Math.random() * captureMoves.length)];
      chess.move(randomCapture);
      console.log("AI captures:", randomCapture);
      return randomCapture;
    }

    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    chess.move(randomMove);
    // console.log("AI's move:", randomMove);
    return randomMove;
  }

  if (difficulty === AIType.SmarterAI) {
    // Evaluate board based on material count
    const evaluateBoard = (): number => {
      const piecesValue: Record<string, number> = {
        p: 1, // Pawn
        n: 3, // Knight
        b: 3, // Bishop
        r: 5, // Rook
        q: 9, // Queen
        k: 1000, // King (checkmate should be prioritized)
      };

      let evaluation = 0;
      // Traverse the board and calculate value
      const board = chess.board();
      board.forEach((row) => {
        row.forEach((piece) => {
          if (piece) {
            const value = piecesValue[piece.type] || 0;
            evaluation += piece.color === "w" ? value : -value;
          }
        });
      });
      return evaluation;
    };

    // AI selects move based on evaluation
    const moves = chess.moves({ verbose: true });
    let bestMove: Move | null = null;
    let bestEvaluation = -Infinity;

    moves.forEach((move) => {
      chess.move(move);
      const boardEvaluation = evaluateBoard();
      chess.undo(); // Revert the move

      if (boardEvaluation > bestEvaluation) {
        bestEvaluation = boardEvaluation;
        bestMove = move;
      }
    });

    if (bestMove) {
      chess.move(bestMove);
      // console.log("AI's smart move:", bestMove);
      return bestMove;
    }
  }

  return null;
};
