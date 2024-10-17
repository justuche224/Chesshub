import ChessGame from "@/components/game/GameBoard.chessjs";
import { initializeGame } from "@/lib/initializationGame";
import { saveGame } from "@/lib/saveGame";

export type Player = {
  id: string;
  name: string;
  level: number;
  isConnected: boolean;
  color: "w" | "b";
  image: string;
};

const initialPlayers = {
  white: {
    id: "67067fa2681ae95570e0a7ff",
    name: "Justin",
    level: 2,
    isConnected: true,
    color: "w" as const,
    image: "https://i.postimg.cc/W4pgt3Qk/man-user-color-icon.png",
  },
  black: {
    id: "670fba724d9ea219b675f78c",
    name: "Joshua",
    level: 2,
    isConnected: true,
    color: "b" as const,
    image: "https://i.postimg.cc/W4pgt3Qk/man-user-color-icon.png",
  },
};

const ResetPage = async () => {
  // const game = await initializeGame(
  //   initialPlayers.white.id,
  //   initialPlayers.black.id
  // );
  // console.log(game);

  return (
    <ChessGame white={initialPlayers.white} black={initialPlayers.black} />
  );
};

export default ResetPage;
