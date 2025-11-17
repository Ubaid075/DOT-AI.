import React from 'react';
import { PublicGalleryImage } from '../types';
import { DownloadIcon } from './Icons';
import Button from './Button';

interface PublicGalleryProps {
    images: PublicGalleryImage[];
}

const PublicGallery: React.FC<PublicGalleryProps> = ({ images }) => {
  return (
    <div className="container mx-auto max-w-7xl pb-12">
      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((image) => (
            <GalleryImageCard key={image.id} image={image} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500 dark:text-gray-400">The gallery is currently empty.</p>
          <p className="text-gray-400 dark:text-gray-500 mt-2">Check back soon for amazing creations!</p>
        </div>
      )}
    </div>
  );
};

const GalleryImageCard: React.FC<{ image: PublicGalleryImage }> = ({ image }) => {
  return (
    <div className="relative group overflow-hidden rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 aspect-[3/4]">
      <img
        src={image.imageUrl}
        alt={image.title}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="p-4 flex flex-col justify-end h-full text-white">
          <h3 className="font-bold text-lg">{image.title}</h3>
          <p className="text-sm text-gray-300 mb-4">{image.style}</p>
          <Button
            onClick={() => window.open(image.imageUrl, '_blank')}
            variant="secondary"
            className="w-full !bg-white/90 !text-black hover:!bg-white"
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PublicGallery;