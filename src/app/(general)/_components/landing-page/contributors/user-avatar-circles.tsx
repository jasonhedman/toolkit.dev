import React from "react";

import { AvatarCircles } from "@/components/magicui/avatar-circles";

interface UserAvatarCirclesByLoginProps {
  logins: string[];
  totalUsers: number;
  numAvatarsToShow?: number;
  size?: number;
}
export const UserAvatarCirclesByLogin: React.FC<
  UserAvatarCirclesByLoginProps
> = ({ logins, totalUsers, numAvatarsToShow = 4, size = 36 }) => {
  const numAvatars = Math.min(totalUsers, numAvatarsToShow);

  return (
    <AvatarCircles
      avatarUrls={logins
        .slice(0, numAvatars)
        .map((login) => `https://github.com/${login}.png`)}
      numPeople={Math.max(totalUsers - numAvatars, 0)}
      size={size}
    />
  );
};
