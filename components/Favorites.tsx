import React from 'react';
// FIX: Corrected import path for useAuth
import { useAuth } from '../context/AuthContext';
import { Favorite } from '../types';
import { TrashIcon, ImageIcon } from './Icons';
import Button from './Button';

const Favorites: React.FC = () => {
  const { currentUser, toggleFavorite } = useAuth();
  const favorites = currentUser?.favorites || [];

  return (
    <div className="container mx-auto max-w-7xl py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
          My Favorites
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Your collection of saved AI-generated images.
        </p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((favorite) => (
            <FavoriteCard key={favorite.id} favorite={favorite} onRemove={toggleFavorite} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <ImageIcon className="w-24 h-24 mx-auto" />
          <p className="text-xl mt-4">You haven't favorited any images yet.</p>
          <p className="text-gray-400 dark:text-gray-500 mt-2">Generated images will have a favorite button.</p>
        </div>
      )}
    </div>
  );
};

const FavoriteCard: React.FC<{ favorite: Favorite; onRemove: (fav: Omit<Favorite, 'id' | 'createdAt' | 'userId'>) => void }> = ({ favorite, onRemove }) => {
  return (
    <div className="relative group overflow-hidden rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 aspect-[1/1]">
      <img
        src={favorite.imageUrl}
        alt={favorite.prompt}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="p-4 flex flex-col justify-end h-full text-white">
          <p className="text-sm text-gray-200 line-clamp-3 mb-4">{favorite.prompt}</p>
          <Button
            onClick={() => onRemove({ imageUrl: favorite.imageUrl, prompt: favorite.prompt })}
            variant="secondary"
            className="w-full !bg-red-600 !text-white hover:!bg-red-700"
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Favorites;