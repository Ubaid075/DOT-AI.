import React, { useState, useRef, useEffect } from 'react';
import { AspectRatio, ImageStyle, ImageQuality } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { GENERATION_COST } from '../constants';
import { DownloadIcon, ImageIcon, WandIcon, MinusIcon, PlusIcon, ResetIcon, HeartIcon, SquareIcon, PortraitIcon, LandscapeIcon } from './Icons';
import Button from './Button';
import Modal from './Modal';
import { toast } from '../hooks/useToast';

const aspectRatioOptions = [
  { value: AspectRatio.SQUARE, label: 'Square', icon: <SquareIcon /> },
  { value: AspectRatio.PORTRAIT, label: 'Portrait', icon: <PortraitIcon /> },
  { value: AspectRatio.LANDSCAPE, label: 'Landscape', icon: <LandscapeIcon /> },
];

const Generator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [style, setStyle] = useState<ImageStyle>(ImageStyle.AESTHETIC);
  const [quality, setQuality] = useState<ImageQuality>(ImageQuality.HDR);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [imageMetadata, setImageMetadata] = useState<{ width: number; height: number; size: string } | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const startPanPosition = useRef({ x: 0, y: 0 });

  const { currentUser, setCurrentUser, toggleFavorite } = useAuth();

  const dataURLtoBlob = (dataurl: string): Blob | null => {
    const arr = dataurl.split(',');
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    
    if (generatedImage) {
      const img = new Image();
      img.onload = () => {
        const blob = dataURLtoBlob(generatedImage);
        const sizeInBytes = blob ? blob.size : 0;
        
        setImageMetadata({
          width: img.naturalWidth,
          height: img.naturalHeight,
          size: formatBytes(sizeInBytes),
        });
      };
      img.src = generatedImage;
    } else {
      setImageMetadata(null);
    }
  }, [generatedImage]);


  const handleGenerate = async () => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.credits < GENERATION_COST)) {
      setIsModalOpen(true);
      return;
    }
    if (!prompt.trim()) {
      toast.error('Please enter a prompt.');
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);
    try {
      const response = await api.post('/images/generate', {
        prompt,
        aspectRatio,
        style,
        quality
      });
      setGeneratedImage(response.data.imageUrl);
      setCurrentUser(response.data.user); // Update user with new credit count
      toast.success('Image generated successfully!');
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to generate image. Please try again.";
        toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (!generatedImage) return;
    toast.success('Download started!');
    const link = document.createElement('a');
    link.href = generatedImage;
    const fileName = prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'generated_image';
    link.download = `${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => setScale(s => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.25, 1));
  const handleResetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    if (scale <= 1) return;
    e.preventDefault();
    isPanning.current = true;
    startPanPosition.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    e.currentTarget.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning.current || scale <= 1) return;
    e.preventDefault();
    const newX = e.clientX - startPanPosition.current.x;
    const newY = e.clientY - startPanPosition.current.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUpOrLeave = () => {
    if (isPanning.current) {
      isPanning.current = false;
      if (imageContainerRef.current) {
        const img = imageContainerRef.current.querySelector('img');
        if (img) img.style.cursor = 'grab';
      }
    }
  };
  
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!generatedImage) return;
    e.preventDefault();
    const zoomFactor = 0.1;
    if (e.deltaY < 0) {
      setScale(s => Math.min(s + zoomFactor, 3));
    } else {
      setScale(s => Math.max(s - zoomFactor, 1));
    }
  };

  const hasEnoughCredits = currentUser ? (currentUser.role === 'admin' || currentUser.credits >= GENERATION_COST) : false;
  
  const isFavorited = currentUser?.favorites.some(fav => fav.imageUrl === generatedImage);

  const getAspectRatioClass = (ratio: AspectRatio) => {
    switch (ratio) {
        case AspectRatio.PORTRAIT:
            return 'aspect-[9/16]';
        case AspectRatio.LANDSCAPE:
            return 'aspect-[16/9]';
        case AspectRatio.SQUARE:
        default:
            return 'aspect-square';
    }
  }

  return (
    <div className="container mx-auto max-w-5xl py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
          Generate stunning AI images
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Describe your vision and watch DOT Ai bring it to life. Generate. Create. Imagine.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6 p-6 bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium mb-2">Prompt</label>
            <textarea
              id="prompt"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A robot holding a red skateboard"
              className="w-full p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-2">
              {aspectRatioOptions.map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAspectRatio(value)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 ${
                    aspectRatio === value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {React.cloneElement(icon, { className: 'w-10 h-10 mb-1' })}
                  <span className="text-xs font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <ControlSelect<ImageStyle> label="Style" value={style} onChange={setStyle} options={Object.values(ImageStyle)} />
          <ControlSelect<ImageQuality> label="Quality" value={quality} onChange={setQuality} options={Object.values(ImageQuality)} />

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !hasEnoughCredits}
            className="w-full"
          >
            {isLoading ? 'Generating...' : (
              <div className="flex items-center justify-center">
                <WandIcon className="w-5 h-5 mr-2" />
                {currentUser?.role === 'admin' ? 'Generate' : `Generate (${GENERATION_COST} Credits)`}
              </div>
            )}
          </Button>
        </div>

        <div className={`lg:col-span-2 p-6 bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center transition-all duration-300 ${getAspectRatioClass(aspectRatio)}`}>
          {isLoading ? (
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 font-medium text-gray-600 dark:text-gray-300">Generating your masterpiece...</p>
            </div>
          ) : generatedImage ? (
            <div
              ref={imageContainerRef}
              className="relative group w-full h-full rounded-lg overflow-hidden"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              onWheel={handleWheel}
            >
              <img
                src={generatedImage}
                alt={prompt}
                className="w-full h-full object-contain transition-transform duration-100"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                  cursor: scale > 1 ? 'grab' : 'default',
                  willChange: 'transform',
                }}
                onMouseDown={handleMouseDown}
                draggable="false"
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm p-2 rounded-full flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button onClick={handleZoomOut} variant="secondary" className="!p-2 !rounded-full" disabled={scale <= 1} title="Zoom Out">
                  <MinusIcon className="w-4 h-4" />
                </Button>
                <span className="text-white text-xs font-mono w-12 text-center select-none">{Math.round(scale * 100)}%</span>
                <Button onClick={handleZoomIn} variant="secondary" className="!p-2 !rounded-full" disabled={scale >= 3} title="Zoom In">
                  <PlusIcon className="w-4 h-4" />
                </Button>
                
                {imageMetadata && (
                    <>
                        <div className="w-px h-5 bg-white/30 mx-1"></div>
                        <div className="text-white text-xs font-mono select-none flex items-center space-x-2 px-1">
                            <span>{imageMetadata.width}x{imageMetadata.height}</span>
                            <span>{imageMetadata.size}</span>
                        </div>
                    </>
                )}

                <div className="w-px h-5 bg-white/30 mx-1"></div>
                <Button onClick={handleResetView} variant="secondary" className="!p-2 !rounded-full" disabled={scale === 1 && position.x === 0 && position.y === 0} title="Reset View">
                  <ResetIcon className="w-4 h-4" />
                </Button>
                <Button onClick={handleDownload} variant="secondary" className="!p-2 !rounded-full" title="Download Image">
                  <DownloadIcon className="w-4 h-4" />
                </Button>
                <Button 
                    onClick={() => generatedImage && toggleFavorite({ imageUrl: generatedImage, prompt })}
                    variant="secondary" 
                    className={`!p-2 !rounded-full ${isFavorited ? 'text-red-500' : ''}`} 
                    title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
                >
                    <HeartIcon className="w-4 h-4" filled={isFavorited} />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 dark:text-gray-500">
              <ImageIcon className="w-24 h-24 mx-auto" />
              <p className="mt-4 font-medium">Your generated image will appear here</p>
            </div>
          )}
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};


interface ControlSelectProps<T extends string> {
    label: string;
    value: T;
    onChange: (value: T) => void;
    options: T[];
    disabled?: boolean;
}

const ControlSelect = <T extends string,>({ label, value, onChange, options, disabled }: ControlSelectProps<T>) => (
    <div>
        <label className="block text-sm font-medium mb-2">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value as T)}
            className="w-full p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
        >
            {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
);


export default Generator;