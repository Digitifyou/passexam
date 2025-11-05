// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- ADD THIS FUNCTION TO THE BOTTOM OF THE FILE ---
/**
 * Shuffles an array in place and returns it.
 * (Fisher-Yates shuffle algorithm)
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  let tempArray = [...array]; // Create a copy to avoid mutating the original
  let currentIndex = tempArray.length, randomIndex;
  
  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    
    // And swap it with the current element.
    [tempArray[currentIndex], tempArray[randomIndex]] = [
      tempArray[randomIndex], tempArray[currentIndex]];
  }
  
  return tempArray; // Return the shuffled copy
};
// --- END OF FUNCTION TO ADD ---