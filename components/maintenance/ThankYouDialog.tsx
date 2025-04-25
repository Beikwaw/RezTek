"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface ThankYouDialogProps {
  open: boolean
  onClose: () => void
}

export function ThankYouDialog({ open, onClose }: ThankYouDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Thank You!</DialogTitle>
          <DialogDescription className="text-center">
            Thank you for submitting your feedback to RezTek. Your input helps us improve our service.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative w-24 h-24">
            <Image
              src="/logo.png"
              alt="RezTek Logo"
              fill
              className="object-contain"
            />
          </div>
          <Button onClick={onClose} className="w-full">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
