"use client";
import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import pieces from "./pieces";

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

export default ({ onStatusChange, customGameState }) => {
  const [game, setGame] = useState(new Chess());
  const [gameStatus, setGameStatus] = useState({});
  const [availableMoves, setAvailableMoves] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState("");
  const [rightClickedSquares, setRightClickedSquares] = useState([]);
  const [promotionMoves, setPromotionMoves] = useState([]);

  function highlightAvailableMoves(square) {
    setRightClickedSquares([]);

    const isPieceHighlightable =
      game.get(square)?.color == game.turn() && square != selectedSquare;

    setSelectedSquare(isPieceHighlightable ? square : "");
    setAvailableMoves(
      isPieceHighlightable ? game.moves({ square, verbose: true }) : []
    );

    return isPieceHighlightable;
  }

  function onSquareClick(square) {
    if (gameStatus.gameOver) return;

    // Toggle and highlight possible moves. quit and return the function if setting toggle state to true
    if (highlightAvailableMoves(square)) {
      return;
    }

    const nextMoves = game
      .moves({ selectedSquare, verbose: true })
      .filter((move) => move.from == selectedSquare && move.to == square);

    // Check for promotion
    if (nextMoves.some((move) => move.promotion)) {
      setPromotionMoves(nextMoves);
      handleGameStatusUpdate();
      return;
    }

    movePiece(nextMoves[0]);
  }

  function movePiece(move) {
    if (!move) return;

    game.move(move);
    setAvailableMoves([]);
    setSelectedSquare("");
  }

  function onPromotionPieceSelect(piece) {
    const promoteTo = piece[1].toLowerCase() ?? "q";
    const nextMove = promotionMoves.find((move) => move.promotion == promoteTo);

    movePiece(nextMove);
    setPromotionMoves([]);
  }

  function onSquareRightClick(square) {
    setRightClickedSquares((rcs) => {
      const newrcs = rcs.filter((s) => s != square);
      if (newrcs.length == rcs.length) newrcs.push(square);
      return newrcs;
    });
  }

  function handleGameStatusUpdate() {
    const previousPlayer = game.turn() == "w" ? "Black" : "White";
    const currentPlayer = game.turn() == "w" ? "White" : "Black";

    let status = {
      gameOver: true,
      history: game.history({ verbose: true }),
      gameState: game.isCheckmate()
        ? "checkmate"
        : game.inCheck()
        ? "in check"
        : game.isStalemate()
        ? "stalemate"
        : game.isInsufficientMaterial()
        ? "insufficient material"
        : game.isThreefoldRepetition()
        ? "threefold repetition"
        : game.isDraw()
        ? "50-move rule"
        : promotionMoves.length > 0
        ? `promote`
        : "normal",
    };

    switch (status.gameState) {
      case "checkmate":
        status.message = `${previousPlayer} wins by Checkmate`;
        status.winner = game.turn();
        break;
      case "in check":
        status.message = `${currentPlayer} is in check. ${currentPlayer}'s move`;
        break;
      case "stalemate":
        status.message =
          "The game is a draw by Stalemate. Neither player can make a valid move.";
        break;
      case "insufficient material":
        status.message =
          "The game is a draw due to Insufficient Material. Neither side can force a checkmate.";
        break;
      case "threefold repetition":
        status.message =
          "The game is a draw by threefold repetition. The same position has occurred three times, leading to an automatic draw.";
        break;
      case "50-move rule":
        status.message =
          "The game is a draw by the 50-Move Rule. 50 moves passed without a pawn move or capture.";
        break;
      case "promote":
        status.message = `${currentPlayer}'s pawn has reached the last rank! Promote to continue.`;
        break;
      default:
        status.gameOver = false;
        status.message = `${currentPlayer}'s move`;
    }

    // Set game status state whenever we request for the game status
    setGameStatus(status);
    // Call onStatusChange prop function with the status if it exists
    onStatusChange?.(status);
    return status;
  }

  function renderPieceCapturedBy(color) {
    const capturedPieces = game
      .history({ verbose: true })
      ?.filter((move) => move.captured && move.color == color);

    return (
      <div className="captured-container w-full bg-slate-500/70 rounded shadow-lg my-2 mx-auto flex flex-wrap justify-center items-center">
        {capturedPieces.map(
          (move) => pieces[(color == "w" ? "b" : "w") + move.captured]
        )}

        {capturedPieces.length == 0 && (
          <p className="text-sm p-2">Captured pieces will appear here.</p>
        )}
      </div>
    );
  }

  const gameBoard = game.board().flat();
  const currentPlayerKing = gameBoard.find(
    (square) => square?.type == "k" && square?.color == game.turn()
  );
  return (
    <div className="max-w-[500px] mx-auto">
      {renderPieceCapturedBy("w")}

      <Chessboard
        id="chessboard"
        position={game.fen()}
        arePiecesDraggable={false}
        onSquareClick={onSquareClick}
        onSquareRightClick={onSquareRightClick}
        getPositionObject={handleGameStatusUpdate}
        customBoardStyle={{
          borderRadius: "4px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        }}
        customSquareStyles={{
          ...mergeStyles(
            gameBoard
              .filter((square) => square && square.color != game.turn())
              .map((square) => square.square),
            grayedOutStyles
          ),
          [currentPlayerKing.square]:
            gameStatus.gameState == "checkmate" ||
            gameStatus.gameState == "in check"
              ? checkStyles
              : gameStatus.gameState == "stalemate"
              ? staleStyles
              : {},
          ...mergeStyles(
            [gameStatus.history?.at(-1)?.from, gameStatus.history?.at(-1)?.to],
            historyStyles
          ),
          ...mergeStyles([...rightClickedSquares.values()], markedStyles),
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
        promotionToSquare="d5"
        promotionDialogVariant="modal"
        showPromotionDialog={promotionMoves.length > 0}
      />
      {renderPieceCapturedBy("b")}
    </div>
  );
};
