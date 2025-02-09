'use client'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

export default function CardImageCarousel({ photos }: { photos: string[] }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  const nextPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photos.length)
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length)
  }

  return (
    <div className="relative h-64">
      <Image
        src={photos[currentPhotoIndex] || '/placeholder.svg'}
        alt={`Photo ${currentPhotoIndex + 1} of ${photos.length - 1}`}
        layout="fill"
        objectFit="cover"
      />
      <Button className="absolute top-2 left-2 z-10 bg-[rgba(0,0,0,0.4)]" onClick={prevPhoto} variant="ghost">
        <ChevronLeftIcon className="text-white" />
      </Button>
      <Button className="absolute top-2 right-2 z-10 bg-[rgba(0,0,0,0.4)]" onClick={nextPhoto} variant="ghost">
        <ChevronRightIcon className="text-white" />
      </Button>
    </div>
  )
}
