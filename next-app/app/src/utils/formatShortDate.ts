/**
 * Converts a JavaScript Date object into a short, readable format (e.g., "Wed Oct 2, 2025").
 *
 * It uses the Intl.DateTimeFormat API for reliable, performant formatting.
 *
 * @param {Date} dateObj The Date object to format.
 * @returns {string} The formatted date string, or "Invalid Date" if the input is not a valid Date object.
 */
export default function formatShortDate(dateObj: Date): string {
    // Check if the input is actually a Date object and is valid (not 'Invalid Date')
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        return "Invalid Date";
    }

    const options: Intl.DateTimeFormatOptions = {
        weekday: 'short', // e.g., 'Wed'
        month: 'short',   // e.g., 'Oct'
        day: 'numeric',   // e.g., '2'
        year: 'numeric'   // e.g., '2025'
    };

    // Use en-US locale to achieve the requested order and style
    const formattedString = new Intl.DateTimeFormat('en-US', options).format(dateObj);

    // The default format often includes a comma after the weekday (e.g., "Wed, Oct 2, 2025").
    // We remove it to match the requested format "Wed Oct 2, 2025".
    return formattedString //.replace(',', '');
}