import ChessGame from "@/components/game/GameBoard.chessjs";

export type Player = {
  name: string;
  level: number;
  isConnected: boolean;
  color: "w" | "b";
  image: string;
};

const initialPlayers = {
  white: {
    name: "Justin",
    level: 2,
    isConnected: true,
    color: "w" as const,
    image: "https://i.postimg.cc/W4pgt3Qk/man-user-color-icon.png",
  },
  black: {
    name: "Joshua",
    level: 2,
    isConnected: true,
    color: "b" as const,
    image: "https://i.postimg.cc/W4pgt3Qk/man-user-color-icon.png",
  },
};

const ResetPage = () => {
  return (
    <ChessGame white={initialPlayers.white} black={initialPlayers.black} />
  );
};

export default ResetPage;
