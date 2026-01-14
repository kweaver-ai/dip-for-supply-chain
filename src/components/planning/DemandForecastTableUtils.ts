/**
 * Demand Forecast Table Utility Functions
 * 
 * Helper functions for formatting data in the demand forecast table.
 */

/**
 * Format month for display (e.g., "2024-01" -> "2024年1月")
 */
export const formatMonth = (month: string): string => {
  const [year, monthNum] = month.split('-');
  return `${year}年${parseInt(monthNum)}月`;
};

/**
 * Format number for display
 */
export const formatNumber = (value: number | null): string => {
  if (value === null || value === undefined) {
    return '--';
  }
  return value.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
};

/**
 * Generate month range (18 months: past 2 years same period 12 months + future 6 months)
 * @returns Array of 18 month strings in YYYY-MM format
 * Example: If current month is 2026-01, returns:
 *   [2024-01, 2024-02, ..., 2024-06, 2025-01, 2025-02, ..., 2025-06, 2026-01, 2026-02, ..., 2026-06]
 */
export const generateMonthRange = (): string[] => {
  const months: string[] = [];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-based (0 = January)

  // Generate 18 months: past 2 years same period (12 months) + future 6 months
  // Past 2 years: (currentYear - 2) same period + (currentYear - 1) same period
  // Future: currentYear same period (currentMonth to currentMonth + 5)
  
  // Past 2 years same period (12 months)
  for (let yearOffset = -2; yearOffset <= -1; yearOffset++) {
    const year = currentYear + yearOffset;
    for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
      const month = currentMonth + monthOffset;
      const date = new Date(year, month, 1);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      months.push(`${y}-${m}`);
    }
  }
  
  // Future 6 months (current year same period)
  for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
    const date = new Date(currentYear, currentMonth + monthOffset, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    months.push(`${year}-${month}`);
  }

  return months;
};

/**
 * Check if a month column is the current month
 * @param month Month string in YYYY-MM format
 * @returns true if the month is the current month, false otherwise
 * @example
 * If current month is 2026-01:
 * - isCurrentMonthColumn('2026-01') returns true (current month)
 * - isCurrentMonthColumn('2025-01') returns false (previous year)
 * - isCurrentMonthColumn('2026-02') returns false (future month)
 */
export const isCurrentMonthColumn = (month: string): boolean => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-based (0 = January)
  const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  
  return month === currentMonthStr;
};

/**
 * Check if a month column is the same month as current month in past 2 years
 * (previous year and 2 years ago same month, excluding current month)
 * @param month Month string in YYYY-MM format
 * @returns true if the month is same month in past 2 years (previous year or 2 years ago), false for current month or other months
 * @example
 * If current month is 2026-01:
 * - isSameMonthColumn('2026-01') returns false (current month - excluded)
 * - isSameMonthColumn('2025-01') returns true (previous year same month)
 * - isSameMonthColumn('2024-01') returns true (2 years ago same month)
 * - isSameMonthColumn('2026-02') returns false
 */
export const isSameMonthColumn = (month: string): boolean => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-based (0 = January)
  const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  
  // Exclude current month - return false if it's the current month
  if (month === currentMonthStr) {
    return false;
  }
  
  // Check if it's the same month in previous year
  const previousYearMonth = `${currentYear - 1}-${String(currentMonth + 1).padStart(2, '0')}`;
  if (month === previousYearMonth) {
    return true;
  }
  
  // Check if it's the same month 2 years ago
  const twoYearsAgoMonth = `${currentYear - 2}-${String(currentMonth + 1).padStart(2, '0')}`;
  if (month === twoYearsAgoMonth) {
    return true;
  }
  
  return false;
};

