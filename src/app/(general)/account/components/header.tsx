import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@prisma/client";

interface Props {
  user: User;
}

export const AccountHeader: React.FC<Props> = ({ user }) => {
  return (
    <div>
      <div className="flex items-center gap-4">
        <Avatar className="size-16 rounded-md md:size-20">
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback>
            {(user.name ?? user.email)?.charAt(0).toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          {user.name && <h1 className="text-4xl font-bold">{user.name}</h1>}
          {user.email && (
            <p className="text-muted-foreground text-lg">{user.email}</p>
          )}
          {!user.name && !user.email && (
            <p className="text-muted-foreground text-lg">No name or email</p>
          )}
        </div>
      </div>
    </div>
  );
};
