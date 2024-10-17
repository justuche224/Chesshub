"use client";

import React, { useState, useEffect, use } from "react";
import { Chess, Square } from "chess.js";
import { ArrowLeft, Hand, Flag, MessageSquare } from "lucide-react";
import { Player } from "@/app/game/page";
import Image from "next/image";
import { saveCapturedPieces, saveGame } from "@/lib/saveGame";
import { loadGame } from "@/lib/loadGame";

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

export type CapturedPieces = {
  white: ChessPiece[];
  black: ChessPiece[];
};

type PieceMap = {
  [key in Exclude<ChessPiece, "">]: string;
};

const ChessGame: React.FC<{
  gameId?: string;
  white: Player;
  black: Player;
}> = ({ gameId = "671035153d19b1dab00fe4a0", white, black }) => {
  const [chess] = useState<Chess>(new Chess());
  const [board, setBoard] = useState<ChessPiece[]>(getInitialBoard());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [availableMoves, setAvailableMoves] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("");
  const [gameLoading, setGameLoading] = useState(true);
  const [capturedPieces, setCapturedPieces] = useState<CapturedPieces>({
    white: [],
    black: [],
  });
  const [previousMove, setPreviousMove] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [timer, setTimer] = useState<number>(45);

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
    const interval = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [chess]);

  const loadGameState = async (id: string) => {
    const loadedGame = await loadGame(id);
    if (loadedGame) {
      chess.load(loadedGame.fen);
      setBoard(getInitialBoard());
      setMoveHistory(loadedGame.moveHistory);
      console.log(loadedGame.capturedPieces);

      const parsedCapturedPieces: { white: ChessPiece[]; black: ChessPiece[] } =
        {
          white: loadedGame.capturedPieces.white as ChessPiece[],
          black: loadedGame.capturedPieces.black as ChessPiece[],
        };
      setCapturedPieces(parsedCapturedPieces);

      setStatus(loadedGame.status);
      updateStatus();
    }
  };

  useEffect(() => {
    if (gameId) {
      setGameLoading(true);
      loadGameState(gameId);
      setGameLoading(false);
    }
  }, [gameId]);

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

  const handleSquareClick = async (index: number) => {
    const square = (["a", "b", "c", "d", "e", "f", "g", "h"][index % 8] +
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
          setTimer(45);

          if (move.captured) {
            setCapturedPieces((prev) => ({
              ...prev,
              [move.color === "w" ? "white" : "black"]: [
                ...prev[move.color === "w" ? "white" : "black"],
                (move.color === "w"
                  ? move!.captured!.toUpperCase()
                  : move!.captured!.toLowerCase()) as ChessPiece,
              ],
            }));
          }
          setPreviousMove({
            from: move.from as Square,
            to: move.to as Square,
          });
          setMoveHistory((prev) => [...prev, chess.history().slice(-1)[0]]);
          const gameData = {
            id: gameId,
            fen: chess.fen(),
            moveHistory,
            // capturedPieces,
            status: "ongoing",
          };

          const savedGame = await saveGame(gameData);
          // console.log(capturedPieces);
        } else {
          setStatus(getInvalidMoveReason(selectedSquare as Square, square));
          setSelectedSquare(null);
          setAvailableMoves([]);
        }
      } catch (error) {
        console.error("An error occurred while making the move:", error);
        setStatus("Invalid Move! Please try again.");
        setSelectedSquare(null);
        setAvailableMoves([]);
      }
    }
  };
  useEffect(() => {
    if (gameLoading) {
      console.log("gameloading");
      return;
    }
    console.log(capturedPieces);

    saveCapturedPieces({ id: gameId, capturedPieces });
  }, [capturedPieces]);

  const getInvalidMoveReason = (from: Square, to: Square): string => {
    const tempChess = new Chess(chess.fen());
    const move = { from, to, promotion: "q" };

    if (
      !tempChess
        .moves({ verbose: true })
        .some((m) => m.from === from && m.to === to)
    ) {
      return "Invalid move for this piece.";
    }

    try {
      tempChess.move(move);
    } catch (error) {
      if (tempChess.isCheck()) {
        return "You cannot make a move that leaves your king in check.";
      }
      if (tempChess.isCheckmate()) {
        return "This move would result in checkmate against you.";
      }
      if (tempChess.isStalemate()) {
        return "This move would result in a stalemate.";
      }
    }

    return "Invalid move. Please try again.";
  };

  const renderCapturedPieces = (color: "white" | "black") => (
    <div className="flex flex-wrap mt-2">
      {capturedPieces[color].map((piece, index) => (
        <div key={index} className="text-xl mr-1">
          {piece ? pieces[piece as keyof PieceMap] : ""}
        </div>
      ))}
    </div>
  );
  const renderMoveHistory = () => (
    <div className="mt-4 p-2 bg-gray-800 rounded-lg max-h-32 overflow-y-auto">
      <h3 className="font-bold mb-2 text-sm">Move History</h3>
      <div className="text-xs">
        {moveHistory.map((move, index) => (
          <span key={index}>
            {index % 2 === 0 && `${Math.floor(index / 2) + 1}. `}
            {move}{" "}
          </span>
        ))}
      </div>
    </div>
  );
  return (
    <div className="bg-gradient-to-tl from-slate-900 to-gray-600 text-white min-h-screen p-4 flex flex-col md:flex-row md:justify-center md:items-center md:gap-8">
      <div className="md:w-1/3 lg:w-1/4 xl:w-1/5">
        <div className="mb-4 md:mb-8">
          <ArrowLeft className="w-6 h-6 md:w-8 md:h-8" />
        </div>

        <div className="flex justify-between items-center mb-4 md:flex-col md:items-start md:gap-4">
          <PlayerInfo player={white} />
          <TimerAndTurn
            timer={timer}
            turn={chess.turn()}
            white={white}
            black={black}
          />
          <PlayerInfo player={black} />
        </div>

        <div className="mt-4 md:mt-8">
          <div className="text-center md:text-left">{status}</div>
          <div className="mt-4 flex justify-between md:flex-col md:gap-4">
            <CapturedPieces
              title={`Captured by ${white.name}`}
              color="white"
              pieces={capturedPieces.white}
              renderPiece={renderCapturedPieces}
            />
            <CapturedPieces
              title={`Captured by ${black.name}`}
              color="black"
              pieces={capturedPieces.black}
              renderPiece={renderCapturedPieces}
            />
          </div>
        </div>

        {renderMoveHistory()}
      </div>

      <div className="flex-grow mt-4 md:mt-0 md:w-2/3 lg:w-1/2 xl:w-2/5">
        <div className="grid grid-cols-8 gap-0 aspect-square max-w-md mx-auto">
          {board.map((piece, index) => (
            <ChessSquare
              key={index}
              index={index}
              piece={piece}
              selectedSquare={selectedSquare}
              availableMoves={availableMoves}
              previousMove={previousMove}
              pieces={pieces}
              onSquareClick={handleSquareClick}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-around mt-4 md:mt-8 md:flex-col md:justify-between md:gap-7">
        <ActionButton icon={<Hand className="w-6 h-6" />} text="Draw" />
        <ActionButton icon={<Flag className="w-6 h-6" />} text="Resign" />
        <ActionButton
          icon={<MessageSquare className="w-6 h-6" />}
          text="Chat"
        />
      </div>
    </div>
  );
};

const PlayerInfo: React.FC<{
  player: Player;
}> = ({ player }) => (
  <div className="flex flex-col items-center md:flex-row md:items-center md:gap-4">
    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-300 overflow-hidden">
      <Image
        width={48}
        height={48}
        src={player.image}
        alt={player.name}
        className="w-full h-full object-cover"
      />
    </div>
    <div className="md:flex md:flex-col">
      <span className="text-sm mt-1 md:text-base md:mt-0">{player.name}</span>
      <span className="text-xs opacity-70 md:text-sm">
        Level {player.level}
      </span>
    </div>
  </div>
);

const TimerAndTurn: React.FC<{
  timer: number;
  turn: "w" | "b";
  white: Player;
  black: Player;
}> = ({ timer, turn, white, black }) => (
  <div className="flex flex-col items-center md:flex-row md:gap-4">
    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-red-500 flex items-center justify-center">
      <span className="text-sm font-bold md:text-base">
        {String(Math.floor(timer / 60)).padStart(2, "0")}:
        {String(timer % 60).padStart(2, "0")}
      </span>
    </div>
    <span className="text-sm mt-1 bg-gray-700 px-2 py-1 rounded md:text-base">
      {turn === "w" ? white.name : black.name} move
    </span>
  </div>
);

const CapturedPieces: React.FC<{
  title: string;
  color: "white" | "black";
  pieces: ChessPiece[];
  renderPiece: (color: "white" | "black") => JSX.Element;
}> = ({ title, color, pieces, renderPiece }) => (
  <div>
    <h3 className="text-sm font-bold mb-1 md:text-base">{title}</h3>
    {renderPiece(color)}
  </div>
);

const ActionButton: React.FC<{ icon: React.ReactNode; text: string }> = ({
  icon,
  text,
}) => (
  <button className="flex flex-col items-center opacity-70 md:flex-row md:gap-2">
    {icon}
    <span className="text-xs mt-1 md:text-sm md:mt-0">{text}</span>
  </button>
);

const ChessSquare: React.FC<{
  index: number;
  piece: ChessPiece;
  selectedSquare: string | null;
  availableMoves: string[];
  previousMove: { from: Square; to: Square } | null;
  pieces: PieceMap;
  onSquareClick: (index: number) => void;
}> = ({
  index,
  piece,
  selectedSquare,
  availableMoves,
  previousMove,
  pieces,
  onSquareClick,
}) => {
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
      className={`aspect-square flex items-center justify-center cursor-pointer 
        ${
          (Math.floor(index / 8) + index) % 2 === 0
            ? "bg-[#f0d9b5]"
            : "bg-[#b58863]"
        }
        ${isSelected ? "border-2 border-blue-500" : ""}
        ${isAvailableMove ? "border-2 border-green-500" : ""}
        ${isPartOfPreviousMove ? "bg-yellow-200" : ""}`}
      onClick={() => onSquareClick(index)}
    >
      {piece && <div className="text-3xl md:text-4xl">{pieces[piece]}</div>}
      {isAvailableMove && !piece && (
        <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-green-500 opacity-50"></div>
      )}
    </div>
  );
};

export default ChessGame;
