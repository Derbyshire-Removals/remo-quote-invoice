import { format, parseISO, isValid } from "date-fns";

/**
 * Groups items by month based on a date field
 * @param items Array of items to group
 * @param dateField The field containing the date to group by (default: 'createdAt')
 * @returns Object with month strings as keys and arrays of items as values
 */
export function groupByMonth<T extends { [key: string]: any }>(
  items: T[],
  dateField: string = 'createdAt'
): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};

  items.forEach(item => {
    try {
      const dateStr = item[dateField];
      if (!dateStr) {
        // Handle items without a date - group them under "No Date"
        grouped["No Date"] = grouped["No Date"] || [];
        grouped["No Date"].push(item);
        return;
      }

      const date = parseISO(dateStr);
      if (!isValid(date)) {
        // Handle invalid dates - group them under "Invalid Date"
        grouped["Invalid Date"] = grouped["Invalid Date"] || [];
        grouped["Invalid Date"].push(item);
        return;
      }

      // Format as "YYYY-MM" for sorting and "MMMM yyyy" for display
      const monthKey = format(date, "yyyy-MM");
      const monthDisplay = format(date, "MMMM yyyy");
      
      // Use the display format as the key for the grouped object
      grouped[monthDisplay] = grouped[monthDisplay] || [];
      grouped[monthDisplay].push(item);
    } catch (error) {
      // Handle any errors by putting the item in an "Error" group
      grouped["Error"] = grouped["Error"] || [];
      grouped["Error"].push(item);
    }
  });

  return grouped;
}

/**
 * Sorts month keys in descending order (newest first)
 * @param months Array of month strings in "MMMM yyyy" format
 * @returns Sorted array of month strings
 */
export function sortMonthKeys(months: string[]): string[] {
  // First, handle special cases that should appear at the end
  const specialCases = ["No Date", "Invalid Date", "Error"];
  const specialMonths = months.filter(month => specialCases.includes(month));
  const regularMonths = months.filter(month => !specialCases.includes(month));
  
  // Sort regular months in descending order (newest first)
  const sortedRegularMonths = regularMonths.sort((a, b) => {
    // Convert "MMMM yyyy" to "yyyy-MM" for proper sorting
    try {
      const dateA = parseISO(`${a.split(' ')[1]}-${format(new Date(`${a} 1`), 'MM')}-01`);
      const dateB = parseISO(`${b.split(' ')[1]}-${format(new Date(`${b} 1`), 'MM')}-01`);
      return dateB.getTime() - dateA.getTime(); // Descending order
    } catch (error) {
      return 0;
    }
  });
  
  // Combine sorted regular months with special cases
  return [...sortedRegularMonths, ...specialMonths];
}

/**
 * Format a date string to a readable format
 * @param dateString ISO date string
 * @returns Formatted date string (dd/MM/yyyy)
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return 'Not specified';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return 'Invalid date';
    }
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Gets the current month in "MMMM yyyy" format
 * @returns Current month string
 */
export function getCurrentMonth(): string {
  return format(new Date(), "MMMM yyyy");
}
