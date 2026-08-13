import { parseISO } from 'date-fns';
import { today as getToday, prevDay } from './date';

/**
 * Calculates the consecutive day streak given an array of unique date strings (YYYY-MM-DD)
 * where at least one task was completed.
 * The dates should ideally be sorted descending, but we will sort them to be safe.
 * 
 * Streak definition:
 * Consecutive calendar days (up to and including today, or up to yesterday if today isn't finished yet).
 */
export function calculateStreak(completedDates: string[], referenceDateStr: string = getToday()): number {
  if (!completedDates || completedDates.length === 0) return 0;

  // Deduplicate and Sort descending
  const sortedDates = [...new Set(completedDates)].sort((a, b) => b.localeCompare(a));
  
  let streak = 0;
  
  // Compute yesterday's string correctly without timezone issues
  const yesterdayStr = prevDay(referenceDateStr);

  // If the most recent completed task is older than yesterday, the streak is broken (0).
  if (sortedDates[0] < yesterdayStr) {
    return 0;
  }

  // Current date we're checking backwards from
  let expectedNextDateStr: string | null = null;

  for (let i = 0; i < sortedDates.length; i++) {
    const currentStr = sortedDates[i];
    
    // For the first element in our sorted list
    if (streak === 0) {
      if (currentStr === referenceDateStr || currentStr === yesterdayStr) {
        streak++;
        expectedNextDateStr = prevDay(currentStr);
      } else {
        // First date is older than yesterday, so 0 streak
        break;
      }
    } else {
      if (currentStr === expectedNextDateStr) {
        streak++;
        expectedNextDateStr = prevDay(currentStr);
      } else {
        // Gap found
        break;
      }
    }
  }

  return streak;
}
