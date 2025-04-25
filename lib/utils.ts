import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a unique tenant code
export function generateTenantCode(name: string, roomNumber: string): string {
  const namePrefix = name.substring(0, 3).toUpperCase()
  const randomDigits = Math.floor(1000 + Math.random() * 9000)
  const roomSuffix = roomNumber.replace(/[^a-zA-Z0-9]/g, "")

  return `${namePrefix}${randomDigits}${roomSuffix}`
}

// Generate a unique waiting number for maintenance requests
export function generateWaitingNumber(): string {
  const prefix = "REQ"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(100 + Math.random() * 900)

  return `${prefix}-${timestamp}-${random}`
}

// Format date to readable string
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number format (South African)
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/
  return phoneRegex.test(phone)
}

// Validate password strength
export function isStrongPassword(password: string): boolean {
  return password.length >= 8
}
