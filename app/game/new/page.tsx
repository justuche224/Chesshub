import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import UserList from "./UserList";

const page = async () => {
  const user = await currentUser(); // Fetch current user

  if (!user) {
    return (
      <div>
        <h1>Please login</h1>
      </div>
    );
  }
  const allUsers = await db.user.findMany(); // Fetch all users

  // Filter out the current user
  const otherUsers = allUsers.filter((u) => u.id !== user?.id);

  return <UserList otherUsers={otherUsers} userId={user.id!!} />;
};

export default page;
