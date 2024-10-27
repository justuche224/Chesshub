import { db } from "@/lib/db";
import GamePage from "./Game";
import { currentUser } from "@/lib/auth";
import { UserWithColor } from "@/types";

const page = async ({ params }: { params: { gameId: string } }) => {
  const user = await currentUser();

  if (!user) {
    return (
      <div>
        <h1>Login mate!</h1>
      </div>
    );
  }

  const gameId = params.gameId;

  const game = await db.gameWithAi.findUnique({
    where: { id: gameId },
    include: { moves: { orderBy: { createdAt: "asc" } }, player: true },
  });

  if (!game) {
    return (
      <div>
        <h1>Game not found!</h1>
      </div>
    );
  }

  const player: UserWithColor = {
    id: user.id!!,
    username: user.name,
    email: user.email,
    image: user.image,
    color: "",
  };

  if (game.playerId !== player.id) {
    return (
      <div>
        <h1>You dont have access to this match!</h1>
      </div>
    );
  }

  player.color = game.playerColor;

  return (
    <GamePage
      player={player}
      aiType={game.aiType}
      currentPlayer={player}
      initialGame={game}
    />
  );
};

export default page;
