import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';

interface ImagePlaceholderProps {
  src?: string;
  alt: string;
  className?: string;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  src,
  alt,
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate a deterministic gradient color scheme based on product name
  const getGradientColors = (text: string) => {
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const schemes = [
      'from-indigo-500 to-purple-600',
      'from-emerald-400 to-teal-600',
      'from-rose-400 to-red-600',
      'from-blue-500 to-cyan-500',
      'from-amber-400 to-orange-500',
      'from-violet-600 to-fuchsia-600',
    ];
    return schemes[hash % schemes.length];
  };

  const gradientClass = getGradientColors(alt);

  // Checks if image URL is a dummy/placeholder/unreachable domain
  const isDummyUrl = (url?: string) => {
    if (!url) return true;
    const lowerUrl = url.toLowerCase();
    return (
      lowerUrl.includes('example.com') ||
      lowerUrl.includes('placeholder') ||
      lowerUrl.startsWith('http://dummy') ||
      !lowerUrl.startsWith('http')
    );
  };

  const useFallback = hasError || isDummyUrl(src);

  return (
    <div className={`relative overflow-hidden bg-slate-100 flex items-center justify-center ${className}`}>
      {isLoading && !useFallback && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
          <ShoppingBag className="w-8 h-8 text-slate-400 animate-bounce" />
        </div>
      )}

      {useFallback ? (
        <div className={`w-full h-full flex flex-col items-center justify-center text-white bg-gradient-to-tr ${gradientClass} p-4`}>
          <ShoppingBag className="w-10 h-10 mb-2 opacity-85" />
          <span className="text-center font-bold tracking-tight text-sm line-clamp-2 px-2">
            {alt}
          </span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}
    </div>
  );
};
