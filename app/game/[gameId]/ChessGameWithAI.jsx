import React, { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { computerMove } from "@/lib/computerMove";
import pieces from "./pieces";
import { toast } from "sonner";
import {
  mergeStyles,
  grayedOutStyles,
  highlightedStyles,
  highlightedCapturedStyles,
  markedStyles,
  selectedStyles,
  historyStyles,
  checkStyles,
  staleStyles,
} from "./square-styles";

export default function ChessboardWithAI({
  onStatusChange,
  initialFen = new Chess().fen(),
  difficulty,
  playerColor = "w",
}) {
  const [game, setGame] = useState(new Chess(initialFen));
  const [gameStatus, setGameStatus] = useState({});
  const [availableMoves, setAvailableMoves] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState("");
  const [rightClickedSquares, setRightClickedSquares] = useState([]);
  const [promotionMoves, setPromotionMoves] = useState([]);
  const [isAIThinking, setIsAIThinking] = useState(false);

  useEffect(() => {
    // If it's AI's turn at the start, make a move
    if (game.turn() !== playerColor && !gameStatus.gameOver) {
      makeAIMove();
    }
  }, []);

  const makeAIMove = async () => {
    if (gameStatus.gameOver) return;
    setIsAIThinking(true);

    try {
      const aiMove = await computerMove({
        difficulty,
        fen: game.fen(),
      });

      if (aiMove) {
        const newGame = new Chess(game.fen());
        newGame.move(aiMove);
        setGame(newGame);
        handleGameStatusUpdate();
        toast.success("AI made a move");
      }
    } catch (error) {
      console.error("AI move error:", error);
      toast.error("AI failed to make a move");
    } finally {
      setIsAIThinking(false);
    }
  };

  function highlightAvailableMoves(square) {
    setRightClickedSquares([]);

    const isPieceHighlightable =
      game.get(square)?.color === playerColor &&
      game.get(square)?.color === game.turn() &&
      square !== selectedSquare;

    setSelectedSquare(isPieceHighlightable ? square : "");
    setAvailableMoves(
      isPieceHighlightable ? game.moves({ square, verbose: true }) : []
    );

    return isPieceHighlightable;
  }

  async function onSquareClick(square) {
    if (gameStatus.gameOver || isAIThinking) return;
    if (game.turn() !== playerColor) {
      toast.error("It's not your turn!");
      return;
    }

    if (highlightAvailableMoves(square)) {
      return;
    }

    const nextMoves = game
      .moves({ square: selectedSquare, verbose: true })
      .filter((move) => move.from === selectedSquare && move.to === square);

    if (nextMoves.some((move) => move.promotion)) {
      setPromotionMoves(nextMoves);
      handleGameStatusUpdate();
      return;
    }

    await movePiece(nextMoves[0]);
  }

  async function movePiece(move) {
    if (!move) return;

    const newGame = new Chess(game.fen());
    newGame.move(move);
    setGame(newGame);
    setAvailableMoves([]);
    setSelectedSquare("");
    handleGameStatusUpdate();

    // If the game isn't over, let the AI make its move
    if (!gameStatus.gameOver && newGame.turn() !== playerColor) {
      await makeAIMove();
    }
  }

  function onPromotionPieceSelect(piece) {
    const promoteTo = piece[1].toLowerCase() ?? "q";
    const nextMove = promotionMoves.find(
      (move) => move.promotion === promoteTo
    );

    movePiece(nextMove);
    setPromotionMoves([]);
  }

  function onSquareRightClick(square) {
    setRightClickedSquares((rcs) => {
      const newrcs = rcs.filter((s) => s !== square);
      if (newrcs.length === rcs.length) newrcs.push(square);
      return newrcs;
    });
  }

  function handleGameStatusUpdate() {
    const previousPlayer = game.turn() === "w" ? "Black" : "White";
    const currentPlayer = game.turn() === "w" ? "White" : "Black";

    let status = {
      gameOver: true,
      history: game.history({ verbose: true }),
      gameState: game.isCheckmate()
        ? "checkmate"
        : game.isStalemate()
        ? "stalemate"
        : game.inCheck()
        ? "in check"
        : game.isInsufficientMaterial()
        ? "insufficient material"
        : game.isThreefoldRepetition()
        ? "threefold repetition"
        : game.isDraw()
        ? "50-move rule"
        : promotionMoves.length > 0
        ? "promote"
        : "normal",
    };

    switch (status.gameState) {
      case "checkmate":
        status.message = `${previousPlayer} wins by Checkmate`;
        status.winner = game.turn() === "w" ? "b" : "w";
        break;
      case "in check":
        status.message = `${currentPlayer} is in check. ${currentPlayer}'s move`;
        break;
      case "stalemate":
        status.message = "Draw by Stalemate";
        break;
      case "insufficient material":
        status.message = "Draw by Insufficient Material";
        break;
      case "threefold repetition":
        status.message = "Draw by Threefold Repetition";
        break;
      case "50-move rule":
        status.message = "Draw by 50-Move Rule";
        break;
      case "promote":
        status.message = `Promote your pawn`;
        break;
      default:
        status.gameOver = false;
        status.message = `${currentPlayer}'s move`;
    }

    setGameStatus(status);
    onStatusChange?.(status);
    return status;
  }

  function renderPieceCapturedBy(color) {
    const capturedPieces = game
      .history({ verbose: true })
      ?.filter((move) => move.captured && move.color === color);

    return (
      <div className="w-full bg-slate-500/70 rounded shadow-lg my-2 mx-auto flex flex-wrap justify-center items-center">
        {capturedPieces.map(
          (move) => pieces[(color === "w" ? "b" : "w") + move.captured]
        )}
        {capturedPieces.length === 0 && (
          <p className="text-sm p-2">Captured pieces will appear here.</p>
        )}
      </div>
    );
  }

  const gameBoard = game.board().flat();
  const currentPlayerKing = gameBoard.find(
    (square) => square?.type === "k" && square?.color === game.turn()
  );

  return (
    <div className="max-w-[500px] mx-auto relative">
      {isAIThinking && (
        <div className="absolute top-0 left-0 right-0 text-center bg-blue-500 text-white py-2 rounded-t z-10">
          AI is thinking...
        </div>
      )}

      {renderPieceCapturedBy("w")}

      <Chessboard
        id="chessboard"
        position={game.fen()}
        arePiecesDraggable={false}
        boardOrientation={playerColor === "b" ? "black" : "white"}
        onSquareClick={onSquareClick}
        onSquareRightClick={onSquareRightClick}
        customBoardStyle={{
          borderRadius: "4px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        }}
        customSquareStyles={{
          ...mergeStyles(
            gameBoard
              .filter((square) => square && square.color !== game.turn())
              .map((square) => square.square),
            grayedOutStyles
          ),
          [currentPlayerKing?.square]:
            gameStatus.gameState === "checkmate" ||
            gameStatus.gameState === "in check"
              ? checkStyles
              : gameStatus.gameState === "stalemate"
              ? staleStyles
              : {},
          ...mergeStyles(
            [gameStatus.history?.at(-1)?.from, gameStatus.history?.at(-1)?.to],
            historyStyles
          ),
          ...mergeStyles([...rightClickedSquares], markedStyles),
          [selectedSquare]: selectedStyles,
          ...mergeStyles(
            availableMoves.map((move) => move.to),
            highlightedStyles
          ),
          ...mergeStyles(
            availableMoves
              .filter((move) => move.captured)
              .map((move) => move.to),
            highlightedCapturedStyles
          ),
          ...mergeStyles(
            gameStatus.gameOver
              ? gameBoard.map((square) => square?.square)
              : [],
            grayedOutStyles
          ),
        }}
        onPromotionPieceSelect={onPromotionPieceSelect}
        promotionToSquare={promotionMoves[0]?.to}
        promotionDialogVariant="modal"
        showPromotionDialog={promotionMoves.length > 0}
      />

      {renderPieceCapturedBy("b")}
    </div>
  );
}
