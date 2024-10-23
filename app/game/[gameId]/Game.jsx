"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, Hand, Flag, MessageSquare, User } from "lucide-react";
import { Player } from "@/app/game-test/page";
import Chessgame from "./Chessgame";
import { cn } from "@/lib/utils";
const GamePage = ({
  whitePlayerId,
  blackPlayerId,
  currentPlayerId,
  initialGame,
}) => {
  const [status, setStatus] = useState({});

  const white = { id: whitePlayerId };
  const black = { id: blackPlayerId };

  console.log(status, whitePlayerId, blackPlayerId, initialGame);

  return (
    <div className="bg-wrapper bg-gradient-to-tl from-slate-900 to-gray-600">
      <div className="container text-white min-h-screen p-4 flex flex-col md:flex-row md:justify-around md:items-center md:gap-8">
        <div className="md:w-1/3 lg:w-1/4 xl:w-1/5 self-stretch flex md:flex-col">
          <ArrowLeft className="w-6 h-6 md:w-8 md:h-8" />

          <div className="flex justify-around mb-4 md:flex-col grow md:gap-4">
            <PlayerInfo
              player={currentPlayerId === whitePlayerId ? black : white}
            />

            <div className="mt-4 md:mt-8">
              <div className="text-center md:text-left">
                <p>
                  <strong>Game Status: </strong>
                  <br />
                  {status.message}
                </p>
              </div>
              <div className="mt-4 flex justify-between md:flex-col md:gap-4"></div>
            </div>

            <PlayerInfo
              player={currentPlayerId === whitePlayerId ? white : black}
            />
          </div>
        </div>

        <div className="">
          <Chessgame
            onStatusChange={setStatus}
            player1Id={whitePlayerId}
            player2Id={blackPlayerId}
            initialGame={initialGame}
            currentPlayerId={currentPlayerId}
          />
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
    </div>
  );
};
const PlayerInfo = ({ player, className = "" }) => {
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
        "flex flex-col items-center md:flex-row md:items-center md:gap-4",
        className
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
      <div className="md:flex md:flex-col">
        <span className="text-sm mt-1 md:text-base md:mt-0">
          {player.name || `user${player.id}`}
        </span>
        <span className="text-xs opacity-70 md:text-sm"></span>
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
