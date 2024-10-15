import React, { useState, useEffect } from "react";
import { Chess, Square } from "chess.js";
import { ArrowLeft, Hand, Flag, MessageSquare } from "lucide-react";

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

const ChessMobileGame: React.FC = () => {
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
        black: []
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
        P: "♟"
    };

    useEffect(() => {
        updateStatus();
        const interval = setInterval(() => {
            setTimer(prevTimer => (prevTimer > 0 ? prevTimer - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [chess]);

    function getInitialBoard(): ChessPiece[] {
        return chess
            .board()
            .flat()
            .map(p =>
                p ? (p.color === "b" ? p.type.toUpperCase() : p.type) : ""
            ) as ChessPiece[];
    }

    function updateStatus() {
        if (chess.isCheckmate()) {
            setStatus(
                `Checkmate! ${chess.turn() === "w" ? "Black" : "White"} wins.`
            );
        } else if (chess.isDraw()) {
            setStatus("Draw!");
        } else {
            setStatus(
                `Current turn: ${chess.turn() === "w" ? "White" : "Black"}`
            );
        }
    }

    const getAvailableMoves = (square: Square): string[] => {
        return chess
            .moves({ square: square, verbose: true })
            .map(move => move.to);
    };

    const handleSquareClick = (index: number) => {
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
                    `It's ${
                        chess.turn() === "w" ? "White" : "Black"
                    }'s turn. Select a ${
                        chess.turn() === "w" ? "White" : "Black"
                    } piece.`
                );
            }
        } else {
            try {
                const move = chess.move({
                    from: selectedSquare,
                    to: square,
                    promotion: "q"
                });

                if (move) {
                    setBoard(getInitialBoard());
                    updateStatus();
                    setSelectedSquare(null);
                    setAvailableMoves([]);
                    setTimer(45);

                    if (move.captured) {
                        setCapturedPieces(prev => ({
                            ...prev,
                            [move.color === "w" ? "white" : "black"]: [
                                ...prev[move.color === "w" ? "white" : "black"],
                                (move.color === "w"
                                    ? move.captured.toUpperCase()
                                    : move.captured.toLowerCase()) as ChessPiece
                            ]
                        }));
                    }

                    setPreviousMove({
                        from: move.from as Square,
                        to: move.to as Square
                    });
                    setMoveHistory(prev => [
                        ...prev,
                        chess.history().slice(-1)[0]
                    ]);
                } else {
                    setStatus(getInvalidMoveReason(selectedSquare, square));
                    setSelectedSquare(null);
                    setAvailableMoves([]);
                }
            } catch (error) {
                console.error(
                    "An error occurred while making the move:",
                    error
                );
                setStatus("An error occurred. Please try again.");
                setSelectedSquare(null);
                setAvailableMoves([]);
            }
        }
    };

    const getInvalidMoveReason = (from: Square, to: Square): string => {
        const tempChess = new Chess(chess.fen());
        const move = { from, to, promotion: "q" };

        if (
            !tempChess
                .moves({ verbose: true })
                .some(m => m.from === from && m.to === to)
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
                    {pieces[piece]}
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
        <div className="bg-gradient-to-tl from-slate-900 to-gray-600 text-white min-h-[100svh] min-h-screen p-4 flex flex-col">
            <div className="mb-4">
                <ArrowLeft className="w-6 h-6" />
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
                        <img
                            src="https://i.postimg.cc/W4pgt3Qk/man-user-color-icon.png"
                            alt="Aishwarya"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="text-sm mt-1">Aishwarya</span>
                    <span className="text-xs opacity-70">Level 2</span>
                </div>

                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border-4 border-red-500 flex items-center justify-center">
                        <span className="text-sm font-bold">
                            {String(Math.floor(timer / 60)).padStart(2, "0")}:
                            {String(timer % 60).padStart(2, "0")}
                        </span>
                    </div>
                    <span className="text-sm mt-1 bg-gray-700 px-2 py-1 rounded">
                        {chess.turn() === "w" ? "Aishwarya" : "Vineeta"} move
                    </span>
                </div>

                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-pink-300 overflow-hidden">
                        <img
                            src="https://i.postimg.cc/fRNxn5C5/man-person-icon.png"
                            alt="Vineeta"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="text-sm mt-1">Vineeta</span>
                    <span className="text-xs opacity-70">Level 2</span>
                </div>
            </div>

            <div className="flex-grow">
                <div className="grid grid-cols-8 gap-0 aspect-square">
                    {board.map((piece, index) => {
                        const square =
                            ["a", "b", "c", "d", "e", "f", "g", "h"][
                                index % 8
                            ] +
                            (8 - Math.floor(index / 8));
                        const isSelected = selectedSquare === square;
                        const isAvailableMove = availableMoves.includes(square);
                        const isPartOfPreviousMove =
                            previousMove &&
                            (previousMove.from === square ||
                                previousMove.to === square);
                        return (
                            <div
                                key={index}
                                className={`aspect-square flex items-center justify-center cursor-pointer 
                                    ${
                                        (Math.floor(index / 8) + index) % 2 ===
                                        0
                                            ? "bg-[#f0d9b5]"
                                            : "bg-[#b58863]"
                                    }
                                    ${
                                        isSelected
                                            ? "border-2 border-blue-500"
                                            : ""
                                    }
                                    ${
                                        isAvailableMove
                                            ? "border-2 border-green-500"
                                            : ""
                                    }
                                    ${
                                        isPartOfPreviousMove
                                            ? "bg-yellow-200"
                                            : ""
                                    }`}
                                onClick={() => handleSquareClick(index)}
                            >
                                {piece && (
                                    <div className="text-3xl">
                                        {pieces[piece]}
                                    </div>
                                )}
                                {isAvailableMove && !piece && (
                                    <div className="w-3 h-3 rounded-full bg-green-500 opacity-50"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {renderMoveHistory()}
            <div className="mt-4 text-center">{status}</div>
            <div className="mt-4 flex justify-between">
                <div>
                    <h3 className="text-sm font-bold mb-1">
                        Captured by Aishwarya
                    </h3>
                    {renderCapturedPieces("white")}
                </div>
                <div>
                    <h3 className="text-sm font-bold mb-1">
                        Captured by Vineeta
                    </h3>
                    {renderCapturedPieces("black")}
                </div>
            </div>

            <div className="flex justify-around mt-4">
                <button className="flex flex-col items-center opacity-70">
                    <Hand className="w-6 h-6" />
                    <span className="text-xs mt-1">Offer draw</span>
                </button>
                <button className="flex flex-col items-center opacity-70">
                    <Flag className="w-6 h-6" />
                    <span className="text-xs mt-1">Resign</span>
                </button>
                <button className="flex flex-col items-center opacity-70">
                    <MessageSquare className="w-6 h-6" />
                    <span className="text-xs mt-1">Chat</span>
                </button>
            </div>
        </div>
    );
};

export default ChessMobileGame;
