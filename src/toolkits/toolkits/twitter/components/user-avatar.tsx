import React from "react";

interface TwitterAvatarProps {
  src?: string;
  username: string;
  className?: string;
}

export const TwitterAvatar: React.FC<TwitterAvatarProps> = ({ 
  src, 
  username, 
  className = "size-8" 
}) => {
  if (src) {
    return (
      <img
        src={src}
        alt={`@${username}`}
        className={`rounded-full ${className}`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }
  
  return (
    <div className={`bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium ${className}`}>
      {username.charAt(0).toUpperCase()}
    </div>
  );
};