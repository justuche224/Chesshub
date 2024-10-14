"use client";

import React, { useState, useEffect } from "react";
import { Chess, Square, Move } from "chess.js";

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
  const [availableMoves, setAvailableMoves] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("");
  const [capturedPieces, setCapturedPieces] = useState<{
    white: ChessPiece[];
    black: ChessPiece[];
  }>({
    white: [],
    black: [],
  });
  const [previousMove, setPreviousMove] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

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
      .map((p) =>
        p ? (p.color === "b" ? p.type.toUpperCase() : p.type) : ""
      ) as ChessPiece[];
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

  const getAvailableMoves = (square: Square): string[] => {
    return chess
      .moves({ square: square, verbose: true })
      .map((move) => move.to);
  };

  const handleSquareClick = (index: number) => {
    const square: Square = (["a", "b", "c", "d", "e", "f", "g", "h"][
      index % 8
    ] +
      (8 - Math.floor(index / 8))) as Square;
    const piece = chess.get(square);

    if (chess.isGameOver()) {
      setStatus("Game over. Start a new game to continue playing.");
      return;
    }

    if (selectedSquare === null) {
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
        setAvailableMoves(getAvailableMoves(square));
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
      try {
        const move = chess.move({
          from: selectedSquare,
          to: square,
          promotion: "q",
        });

        if (move) {
          setBoard(getInitialBoard());
          updateStatus();
          setSelectedSquare(null);
          setAvailableMoves([]);

          // Update captured pieces
          if (move.captured) {
            setCapturedPieces((prev) => {
              const capturedPiece =
                move.color === "w"
                  ? move.captured.toUpperCase()
                  : move.captured.toLowerCase();
              return {
                ...prev,
                [move.color === "w" ? "white" : "black"]: [
                  ...prev[move.color === "w" ? "white" : "black"],
                  capturedPiece as ChessPiece,
                ],
              };
            });
          }

          // Update previous move
          setPreviousMove({ from: move.from as Square, to: move.to as Square });

          // Update move history
          setMoveHistory((prev) => [...prev, chess.history().slice(-1)[0]]);
        } else {
          const reason = getInvalidMoveReason(selectedSquare, square);
          setStatus(reason);
          setSelectedSquare(null);
          setAvailableMoves([]);
        }
      } catch (error) {
        console.error("An error occurred while making the move:", error);
        setStatus("An error occurred. Please try again.");
        setSelectedSquare(null);
        setAvailableMoves([]);
      }
    }
  };

  const getInvalidMoveReason = (from: Square, to: Square): string => {
    const tempChess = new Chess(chess.fen());
    const move = { from, to, promotion: "q" };

    // Check if the move is generally valid
    if (
      !tempChess
        .moves({ verbose: true })
        .some((m) => m.from === from && m.to === to)
    ) {
      return "Invalid move for this piece.";
    }

    // Try to make the move
    try {
      tempChess.move(move);
    } catch (error) {
      // Check for specific reasons
      if (tempChess.isCheck()) {
        return "You cannot make a move that leaves your king in check.";
      }
      if (tempChess.isCheckmate()) {
        return "This move would result in checkmate against you.";
      }
      if (tempChess.isStalemate()) {
        return "This move would result in a stalemate.";
      }
      //TODO Add more checks
    }

    return "Invalid move. Please try again.";
  };

  const renderCapturedPieces = (color: "white" | "black") => (
    <div className="flex flex-wrap mt-2">
      {capturedPieces[color].map((piece, index) => (
        <div key={index} className="text-2xl mr-1">
          {pieces[piece]}
        </div>
      ))}
    </div>
  );

  const renderMoveHistory = () => (
    <div className="mt-4 p-2 bg-gray-100 rounded text-black">
      <h3 className="font-bold mb-2">Move History</h3>
      <div className="grid grid-cols-2 gap-2">
        {moveHistory.map((move, index) => (
          <div
            key={index}
            className={index % 2 === 0 ? "text-right" : "text-left"}
          >
            {index % 2 === 0 && `${Math.floor(index / 2) + 1}.`} {move}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center font-sans">
      <h1 className="text-2xl font-bold mb-4">Chesshub</h1>
      <div className="w-full max-w-2xl flex justify-between px-2">
        <div className="text-center">
          <div
            style={{
              backgroundImage:
                "url(https://i.postimg.cc/fRNxn5C5/man-person-icon.png)",
            }}
            className={`w-16 h-16 bg-contain rounded-full border-8 ${
              chess.turn() === "w" ? "border-green-500" : ""
            }`}
          ></div>
          <h2 className={`${chess.turn() === "w" ? "underline" : ""}`}>
            White
          </h2>
          {renderCapturedPieces("white")}
        </div>
        <div className="text-center">
          <div
            style={{
              backgroundImage:
                "url(https://i.postimg.cc/W4pgt3Qk/man-user-color-icon.png)",
            }}
            className={`w-16 h-16 bg-contain rounded-full border-8 ${
              chess.turn() === "b" ? "border-green-500" : ""
            }`}
          ></div>
          <h2 className={`${chess.turn() === "b" ? "underline" : ""}`}>
            Black
          </h2>
          {renderCapturedPieces("black")}
        </div>
      </div>
      <div className="mb-4">{status}</div>
      <div className="grid grid-cols-8 gap-0">
        {board.map((piece, index) => {
          const square =
            ["a", "b", "c", "d", "e", "f", "g", "h"][index % 8] +
            (8 - Math.floor(index / 8));
          const isSelected = selectedSquare === square;
          const isAvailableMove = availableMoves.includes(square);
          const isPartOfPreviousMove =
            previousMove &&
            (previousMove.from === square || previousMove.to === square);
          return (
            <div
              key={index}
              className={`w-14 h-14 flex items-center justify-center cursor-pointer 
                                ${
                                  (Math.floor(index / 8) + index) % 2 === 0
                                    ? "bg-[#f0d9b5]"
                                    : "bg-[#b58863]"
                                }
                                ${isSelected ? "border-2 border-blue-500" : ""}
                                ${
                                  isAvailableMove
                                    ? "border-2 border-green-500"
                                    : ""
                                }
                                ${isPartOfPreviousMove ? "bg-yellow-200" : ""}`}
              onClick={() => handleSquareClick(index)}
            >
              {piece && <div className="text-3xl">{pieces[piece]}</div>}
              {isAvailableMove && !piece && (
                <div className="w-3 h-3 rounded-full bg-green-500 opacity-50"></div>
              )}
            </div>
          );
        })}
      </div>
      {renderMoveHistory()}
    </div>
  );
};

export default ChessGame;
