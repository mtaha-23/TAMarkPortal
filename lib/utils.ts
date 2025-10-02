import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes a roll number to standard format: 22F-3277
 * - Converts to uppercase
 * - Ensures dash is at the correct position
 * - Handles various input formats (22f3277, 22F3277, 22f-3277, etc.)
 */
export function normalizeRollNumber(rollNo: string): string {
  if (!rollNo) return ""
  
  // Remove all dashes and spaces, then uppercase
  const cleaned = rollNo.replace(/[-\s]/g, "").toUpperCase()
  
  // If length is less than 4, return as is (still typing)
  if (cleaned.length < 4) return cleaned
  
  // Format: XX[Letter]-[Numbers]
  // e.g., 22F-3277
  return cleaned.slice(0, 3) + "-" + cleaned.slice(3)
}

/**
 * Formats roll number input as the user types
 * Automatically capitalizes the 3rd character and inserts dash
 */
export function formatRollNumberInput(value: string): string {
  // Remove all dashes and spaces
  let cleaned = value.replace(/[-\s]/g, "").toUpperCase()
  
  // Limit to 7 characters: 22F3277 (2 digits + 1 letter + 4 digits)
  cleaned = cleaned.slice(0, 7)
  
  // Auto-insert dash after 3rd character
  if (cleaned.length > 3) {
    return cleaned.slice(0, 3) + "-" + cleaned.slice(3)
  }
  
  return cleaned
}
