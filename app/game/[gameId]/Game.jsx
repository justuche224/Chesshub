"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, Hand, Flag, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Chessgame from "./Chessgame";

const GamePage = ({ whitePlayer, blackPlayer, currentPlayer, initialGame }) => {
  const [status, setStatus] = useState({});

  return (
    <div className="bg-wrapper bg-gradient-to-tl from-slate-900 to-gray-600 w-full h-full">
      <ArrowLeft className="w-14 h-14 md:w-16 md:h-16 p-4 text-white" />
      <div className="container text-white min-h-screen flex flex-col md:flex-row md:justify-around md:items-center md:gap-8">
        <div className="md:w-1/3 lg:w-1/4 xl:w-1/5 self-stretch flex md:flex-col gap-4">
          <div className="flex sm:flex-row-reverse flex-col md:flex-col justify-around mb-4 p-4 grow md:gap-4">
            <PlayerInfo
              player={currentPlayer === whitePlayer ? blackPlayer : whitePlayer}
              currentPlayer={currentPlayer}
            />

            <div className="text-center self-center my-4 md:text-left">
              <p>
                <strong>Game Status: </strong>
                <br />
                {status.message}
              </p>
            </div>

            <PlayerInfo
              player={currentPlayer === whitePlayer ? whitePlayer : blackPlayer}
              currentPlayer={currentPlayer}
            />
          </div>
        </div>

        <div className="max-w-screen w-screen">
          <Chessgame
            onStatusChange={setStatus}
            whitePlayer={whitePlayer}
            blackPlayer={blackPlayer}
            initialGame={initialGame}
            currentPlayer={currentPlayer}
          />
        </div>
        <div className="flex justify-around mt-4 p-4 md:mt-8 md:flex-col md:justify-between md:gap-7">
          <ActionButton icon={<Hand className="w-6 h-6" />} text="Draw" />
          <ActionButton icon={<Flag className="w-6 h-6" />} text="Resign" />
          <ActionButton
            icon={<MessageSquare className="w-6 h-6" />}
            text="Chat"
          />
        </div>
      </div>
    </div>
  );
};
const PlayerInfo = ({ player, currentPlayer }) => {
  const [rand, setRand] = useState(Math.random);

  const defaultImage = (
    <div
      className={`w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden flex justify-center items-center`}
      style={{ backgroundColor: `hsl(${rand * 360}, 50%, 40%)` }}
    >
      <User className="w-10 h-10" />
    </div>
  );

  return (
    <div
      className={cn(
        "flex flex-col items-center md:flex-row md:items-center md:gap-4 px-4 py-2 rounded-lg shadow-inset",
        currentPlayer.color === player.color
          ? " ring ring-green-500/50 bg-green-500/20 shadow-green-500"
          : "ring ring-red-500/50 bg-red-500/20 shadow-red-500"
      )}
    >
      {player.image ? (
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-300 overflow-hidden">
          <Image
            width={48}
            height={48}
            src={player.image}
            alt={player.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        defaultImage
      )}
      <div className="flex flex-col items-center md:items-stretch">
        <span className="text-sm mt-1 md:text-base md:mt-0">
          @{player.username || `user${player.id}`}
        </span>
        <span className="text-xs font-bold opacity-70 md:text-sm">
          {player.color === "w" ? "White" : "Black"}
        </span>
      </div>
    </div>
  );
};

const ActionButton = ({ icon, text }) => (
  <button className="flex flex-col items-center opacity-70 md:flex-row md:gap-2">
    {icon}
    <span className="text-xs mt-1 md:text-sm md:mt-0">{text}</span>
  </button>
);

export default GamePage;
