"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface ExpandableImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
}

export function ExpandableImage({ src, alt, width, height, className }: ExpandableImageProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`cursor-pointer hover:opacity-90 transition-opacity ${className || ""}`}
        onClick={() => setIsExpanded(true)}
      />
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
          <DialogTitle className="sr-only">
            Expanded view of {alt}
          </DialogTitle>
          <div className="relative w-full h-full min-h-[80vh]">
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain"
              quality={100}
              priority
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
