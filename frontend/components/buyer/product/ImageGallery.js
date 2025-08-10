'use client';

import { useState } from 'react';
import Image from 'next/image';

const ImageGallery = ({ images = [], video = null }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const allMedia = [
    ...(video ? [{ type: 'video', url: video }] : []),
    ...images.map(img => ({ type: 'image', url: img }))
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Display */}
      <div className="relative aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
        {showVideo && video ? (
          <video
            controls
            className="w-full h-full object-contain"
            src={video}
          />
        ) : (
          <Image
            src={allMedia[selectedIndex].url}
            alt="Product view"
            fill
            className="object-contain"
          />
        )}
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-6 gap-2">
        {allMedia.map((media, index) => (
          <div
            key={index}
            className={`relative aspect-square cursor-pointer border-2 rounded-md overflow-hidden
              ${selectedIndex === index ? 'border-blue-500' : 'border-gray-200'}`}
            onClick={() => {
              setSelectedIndex(index);
              setShowVideo(media.type === 'video');
            }}
          >
            {media.type === 'video' ? (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-3xl">▶️</span>
              </div>
            ) : (
              <Image
                src={media.url}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
