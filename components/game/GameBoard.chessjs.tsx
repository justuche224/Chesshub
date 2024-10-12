"use client";
import React, { useState, useEffect } from "react";
import { Chess, Square } from "chess.js";

type ChessPiece =
  | "r"
  | "n"
  | "b"
  | "q"
  | "k"
  | "p"
  | "R"
  | "N"
  | "B"
  | "Q"
  | "K"
  | "P"
  | "";

type PieceMap = {
  [key in Exclude<ChessPiece, "">]: string;
};

const ChessGame: React.FC = () => {
  const [chess] = useState<Chess>(new Chess());
  const [board, setBoard] = useState<ChessPiece[]>(getInitialBoard());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  const pieces: PieceMap = {
    r: "♖",
    n: "♘",
    b: "♗",
    q: "♕",
    k: "♔",
    p: "♙",
    R: "♜",
    N: "♞",
    B: "♝",
    Q: "♛",
    K: "♚",
    P: "♟",
  };

  useEffect(() => {
    updateStatus();
  }, [chess]);

  function getInitialBoard(): ChessPiece[] {
    return chess
      .board()
      .flat()
      .map((p) => (p ? p.type : "")) as ChessPiece[];
  }

  function updateStatus() {
    if (chess.isCheckmate()) {
      setStatus(`Checkmate! ${chess.turn() === "w" ? "Black" : "White"} wins.`);
    } else if (chess.isDraw()) {
      setStatus("Draw!");
    } else {
      setStatus(`Current turn: ${chess.turn() === "w" ? "White" : "Black"}`);
    }
  }

  const handleSquareClick = (index: number) => {
    const square: Square = (["a", "b", "c", "d", "e", "f", "g", "h"][
      index % 8
    ] +
      (8 - Math.floor(index / 8))) as Square;
    const piece = chess.get(square);

    // If the game is over, don't allow any more moves
    if (chess.isGameOver()) {
      setStatus("Game over. Start a new game to continue playing.");
      return;
    }

    // If no piece is selected and a piece exists on the clicked square
    if (selectedSquare === null) {
      // Ensure the player selects their own piece
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
        setStatus(
          `Selected ${
            piece.color === "w" ? "White" : "Black"
          } ${piece.type.toUpperCase()}. Choose a destination.`
        );
      } else {
        setStatus(
          `It's ${chess.turn() === "w" ? "White" : "Black"}'s turn. Select a ${
            chess.turn() === "w" ? "White" : "Black"
          } piece.`
        );
      }
    } else {
      // Attempt the move
      try {
        const move = chess.move({
          from: selectedSquare,
          to: square,
          promotion: "q", // always promote to queen (we might allow the players to choose later in development)
        });

        if (move) {
          // Valid move
          setBoard(getInitialBoard());
          updateStatus();
          setSelectedSquare(null); // Reset after a valid move
        } else {
          // Invalid move: keep the selected piece active and show a message
          setStatus("Invalid move. Try again or select a different piece.");
          setSelectedSquare(null); // Reset selected square to allow new selection
        }
      } catch (error) {
        // Handle any unexpected errors
        console.error("An error occurred while making the move:", error);
        setStatus("An error occurred. Please try again.");
        setSelectedSquare(null); // Reset selected square to allow new selection
      }
    }
  };

  return (
    <div className="flex flex-col items-center font-sans">
      <h1 className="text-2xl font-bold mb-4">Chess Game</h1>
      <div className="mb-4">{status}</div>
      <div className="grid grid-cols-8 gap-0">
        {board.map((piece, index) => (
          <div
            key={index}
            className={`w-14 h-14 flex items-center justify-center cursor-pointer ${
              (Math.floor(index / 8) + index) % 2 === 0
                ? "bg-[#f0d9b5]"
                : "bg-[#b58863]"
            } ${
              selectedSquare ===
              ["a", "b", "c", "d", "e", "f", "g", "h"][index % 8] +
                (8 - Math.floor(index / 8))
                ? "border-2 border-blue-500"
                : ""
            }`}
            onClick={() => handleSquareClick(index)}
          >
            {piece && <div className="text-3xl">{pieces[piece]}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChessGame;
