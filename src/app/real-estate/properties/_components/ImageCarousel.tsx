'use client'
import { ChevronRightIcon } from 'lucide-react'

import { ChevronLeftIcon } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

export default function ImageCarousel({ photos }: { photos: string[] }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const nextPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photos.length)
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length)
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-96">
        <Image
          src={photos[currentPhotoIndex] || '/placeholder.svg'}
          alt={`Photo ${currentPhotoIndex + 1} of ${photos.length - 1}`}
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
        />
        <button
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
          onClick={prevPhoto}
        >
          <ChevronLeftIcon />
        </button>
        <button
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
          onClick={nextPhoto}
        >
          <ChevronRightIcon />
        </button>
      </div>
      <div className="flex justify-center space-x-2 mb-8">
        {photos.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${index === currentPhotoIndex ? 'bg-blue-500' : 'bg-gray-300'}`}
            onClick={() => setCurrentPhotoIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}
