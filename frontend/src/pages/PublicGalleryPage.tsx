import React, { useState, useEffect } from 'react';
import PublicGallery from '../components/PublicGallery';
import { PublicGalleryImage } from '../types';
import { api } from '../services/api';
import { toast } from '../hooks/useToast';

const PublicGalleryPage: React.FC = () => {
  const [images, setImages] = useState<PublicGalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { data } = await api.get('/images/gallery');
        setImages(data);
      } catch (err) {
        setError('Failed to load the gallery. Please try again later.');
        toast.error('Could not fetch gallery images.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchGalleryImages();
  }, []);

  return (
    <div>
        <div className="text-center mb-12 pt-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Public Gallery
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A showcase of high-resolution images generated with DOT Ai.
            </p>
        </div>

        {isLoading && <div className="text-center py-20 text-gray-500 dark:text-gray-400">Loading gallery...</div>}
        {error && <div className="text-center py-20 text-red-500">{error}</div>}
        
        {!isLoading && !error && (
            <PublicGallery images={images} />
        )}
    </div>
  );
};

export default PublicGalleryPage;