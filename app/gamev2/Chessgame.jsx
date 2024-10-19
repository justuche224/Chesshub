"use client";
import React, { useState, useEffect } from "react";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";

import {
  styles as mergeStyles,
  grayedOutStyles,
  highlightedStyles,
  highlightedCapturedStyles,
  markedStyles,
  selectedStyles,
  historyStyles,
  checkStyles,
  staleStyles,
} from "./square-styles";

export default ({ onStatusChange }) => {
  const [game, setGame] = useState(new Chess());
  const [availableMoves, setAvailableMoves] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState("");
  const [rightClickedSquares, setRightClickedSquares] = useState([]);
  const [promotionMoves, setPromotionMoves] = useState([]);
  const [checkOrStale, setCheckOrStale] = useState({});

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
      onStatusChange?.({
        ...getGameStatus(),
        message: `${
          game.turn() === "w" ? "White" : "Black"
        }'s pawn has reached the last rank! Promote to continue.`,
      });
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

  function validateStatus(squares) {
    // Check for stalemate, check, checkmate, whose turn...
    const currentPlayerKing = Object.entries(squares).find(
      ([_, piece]) => piece == game.turn() + "K"
    )[0];

    if (game.isStalemate() || game.inCheck()) {
      setCheckOrStale({
        square: currentPlayerKing,
        isStale: game.isStalemate(),
      });
    } else setCheckOrStale({});

    console.log(game.history({ verbose: true }));
    onStatusChange?.(getGameStatus());
  }

  function getGameStatus() {
    let status = {
      gameOver: true,
      captured: game
        .history({ verbose: true })
        .filter((moves) => moves.captured)
        .map((moves) => (moves.color == "w" ? "b" : "w") + moves.captured),
    };

    if (!game.isGameOver()) {
      return {
        ...status,
        gameOver: false,
        message: `${game.turn() === "w" ? "White" : "Black"}'s move`,
      };
    }

    if (game.isCheckmate()) {
      status.gameOverMethod = "Checkmate";
      status.winner = game.turn();
      status.message = `${
        game.turn() == "w" ? "White" : "Black"
      } wins by Checkmate`;
    } else if (game.isDraw()) {
      status.draw = true;

      if (game.isStalemate()) {
        status.message =
          "The game is a draw by Stalemate. Neither player can make a valid move.";
        status.gameOverMethod = "Stalemate";
      } else if (game.isInsufficientMaterial()) {
        status.message =
          "The game is a draw due to Insufficient Material. Neither side can force a checkmate.";
        status.gameOverMethod = "Insufficient Material";
      } else if (game.isThreefoldRepetition()) {
        status.message =
          "The game is a draw by threefold repetition. The same position has occurred three times, leading to an automatic draw.";
        status.gameOverMethod = "Threefold Repetition";
      } else {
        status.message =
          "The game is a draw by the 50-Move Rule. 50 moves passed without a pawn move or capture.";
        status.gameOverMethod = "50 Move Rule";
      }
    }

    return status;
  }

  return (
    <div>
      <Chessboard
        id="ClickToMove"
        boardWidth={460}
        position={game.fen()}
        arePiecesDraggable={false}
        onSquareClick={onSquareClick}
        onSquareRightClick={onSquareRightClick}
        getPositionObject={validateStatus}
        customBoardStyle={{
          borderRadius: "4px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
          margin: "auto",
        }}
        customSquareStyles={{
          ...mergeStyles(
            game
              .board()
              .flat()
              .filter((square) => square && square.color != game.turn())
              .map((square) => square.square),
            grayedOutStyles
          ),
          [checkOrStale.square]: checkOrStale.isStale
            ? staleStyles
            : checkStyles,
          ...mergeStyles(
            [
              game.history({ verbose: true }).at(-1)?.from,
              game.history({ verbose: true }).at(-1)?.to,
            ],
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
        }}
        onPromotionPieceSelect={onPromotionPieceSelect}
        promotionToSquare="d5"
        // promotionDialogVariant="modal"
        showPromotionDialog={promotionMoves.length > 0}
      />
    </div>
  );
};
