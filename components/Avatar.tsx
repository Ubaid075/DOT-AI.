import React from 'react';
import { User } from '../types';
import { UserIcon } from './Icons';

interface AvatarProps {
  user: User | null;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ user, className }) => {
  const baseClasses = "rounded-full object-cover";

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={`${baseClasses} ${className}`}
      />
    );
  }

  return (
    <div className={`flex items-center justify-center bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 ${baseClasses} ${className}`}>
      <UserIcon className="w-2/3 h-2/3" />
    </div>
  );
};

export default Avatar;