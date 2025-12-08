/**
 * Converts a 24-hour time string ("HH:MM:SS") to a 12-hour time string ("H:MMam/pm").
 * * @param time24hr - The time string in 24-hour format (e.g., "09:45:00", "22:15:30").
 * @returns The formatted time string in 12-hour format (e.g., "9:45am", "10:15pm").
 */
export const convertTo12HourTime = (time24hr: string): string => {
  // Check for a valid input format (simple regex HH:MM:SS check)
  if (!/^\d{2}:\d{2}:\d{2}$/.test(time24hr)) {
    console.error(`Invalid time format provided: ${time24hr}. Expected "HH:MM:SS".`);
    return '';
  }
  // 1. Extract hours and minutes
  const parts: string[] = time24hr.split(':');
  // Ensure we can parse the hour component safely
  let hour: number = parseInt(parts[0], 10);
  const minute: string = parts[1];
  // 2. Determine the period (AM or PM)
  const period: 'am' | 'pm' = hour >= 12 ? 'pm' : 'am';
  // 3. Convert 24-hour format hour to 12-hour format hour
  let h12: number = hour % 12;
  // Special case: 0 (midnight) should be 12am
  if (h12 === 0) {
    h12 = 12;
  }
  // 4. Construct the final string
  return `${h12}:${minute}${period}`;
};