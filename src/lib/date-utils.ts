import { addHours, addMinutes, format, isBefore, roundToNearestMinutes } from 'date-fns';

/**
 * Format a date for display (e.g., "Mon, Jan 27")
 */
export function formatDisplayDate(date: Date): string {
  return format(date, 'EEE, MMM d');
}

/**
 * Format a time for display (e.g., "2:00 PM")
 */
export function formatDisplayTime(date: Date): string {
  return format(date, 'h:mm a');
}

/**
 * Format date and time together (e.g., "Mon, Jan 27 at 2:00 PM")
 */
export function formatDisplayDateTime(date: Date): string {
  return format(date, 'EEE, MMM d \'at\' h:mm a');
}

/**
 * Add hours to a date
 */
export function addDuration(date: Date, hours: number): Date {
  return addHours(date, hours);
}

/**
 * Round a date to the nearest 15 minutes
 */
export function roundToNearest15Min(date: Date): Date {
  return roundToNearestMinutes(date, { nearestTo: 15 });
}

/**
 * Get a default start time that is at least 30 minutes from now,
 * rounded to the nearest 15-minute slot
 */
export function getDefaultStartTime(): Date {
  const now = new Date();
  // Add 30 minutes minimum buffer
  const minTime = addMinutes(now, 30);
  // Round up to nearest 15 minutes
  return roundToNearest15Min(minTime);
}

/**
 * Check if a date is in the past
 */
export function isInPast(date: Date): boolean {
  return isBefore(date, new Date());
}

/**
 * Get today's date at midnight for minimum date picker value
 */
export function getTodayStart(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Format a date for storage/API (ISO string)
 */
export function formatForApi(date: Date): string {
  return date.toISOString();
}

/**
 * Combine a date and time into a single Date object
 */
export function combineDateAndTime(date: Date, time: Date): Date {
  const combined = new Date(date);
  combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return combined;
}

/**
 * Duration presets for quick selection
 */
export const DURATION_PRESETS = [
  { label: '1hr', hours: 1 },
  { label: '2hr', hours: 2 },
  { label: '3hr', hours: 3 },
  { label: 'Half day', hours: 5 },
] as const;

export type DurationPreset = (typeof DURATION_PRESETS)[number];
