// Generate array of dates between start and end
export function generateDateRange(start: Date, end: Date) {
  const dates = [];
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};