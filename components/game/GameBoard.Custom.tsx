"use client";
import React, { useState } from "react";

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
  const [board, setBoard] = useState<ChessPiece[]>([
    "r",
    "n",
    "b",
    "q",
    "k",
    "b",
    "n",
    "r",
    "p",
    "p",
    "p",
    "p",
    "p",
    "p",
    "p",
    "p",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "P",
    "P",
    "P",
    "P",
    "P",
    "P",
    "P",
    "P",
    "R",
    "N",
    "B",
    "Q",
    "K",
    "B",
    "N",
    "R",
  ]);

  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);

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

  const handleSquareClick = (index: number) => {
    if (selectedSquare === null) {
      setSelectedSquare(index);
    } else {
      const newBoard = [...board];
      newBoard[index] = newBoard[selectedSquare];
      newBoard[selectedSquare] = "";
      setBoard(newBoard);
      setSelectedSquare(null);
    }
  };

  return (
    <div className="flex flex-col items-center font-sans">
      <h1 className="text-2xl font-bold mb-4">Chess Game</h1>
      <div className="grid grid-cols-8 gap-0">
        {board.map((piece, index) => (
          <div
            key={index}
            className={`w-14 h-14 flex items-center justify-center cursor-pointer ${
              (Math.floor(index / 8) + index) % 2 === 0
                ? "bg-[#f0d9b5]"
                : "bg-[#b58863]"
            } ${selectedSquare === index ? "border-2 border-blue-500" : ""}`}
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
