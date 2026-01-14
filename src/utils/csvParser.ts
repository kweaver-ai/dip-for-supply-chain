/**
 * CSV Parser Utility
 * Parses CSV files into JavaScript objects using Papa Parse
 */

import Papa from 'papaparse';

export interface ParseCSVOptions {
  delimiter?: string;
  skipEmptyLines?: boolean;
  trimValues?: boolean;
}

/**
 * Parse CSV string into array of objects
 * @param csvText CSV text content
 * @param options Parsing options
 * @returns Array of objects with headers as keys
 */
export function parseCSV<T = Record<string, string>>(
  csvText: string,
  options: ParseCSVOptions = {}
): T[] {
  const {
    delimiter = ',',
    skipEmptyLines = true,
  } = options;

  // Use Papa Parse for proper CSV handling (quotes, escaping, etc.)
  const result = Papa.parse(csvText, {
    header: true,
    delimiter,
    skipEmptyLines: skipEmptyLines ? 'greedy' : false,
    transformHeader: (header: string) => {
      // Remove quotes and trim
      return header.replace(/^["']|["']$/g, '').trim();
    },
    transform: (value: string) => {
      // Remove quotes and trim
      return value.replace(/^["']|["']$/g, '').trim();
    },
  });

  if (result.errors.length > 0) {
    console.warn('CSV parsing warnings:', result.errors);
  }

  return result.data as T[];
}

/**
 * Load CSV file from a path
 * @param filePath Path to CSV file
 * @returns Promise with parsed CSV data
 */
export async function loadCSV<T = Record<string, string>>(
  filePath: string,
  options: ParseCSVOptions = {}
): Promise<T[]> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.statusText}`);
    }
    const csvText = await response.text();
    return parseCSV<T>(csvText, options);
  } catch (error) {
    console.error(`Error loading CSV from ${filePath}:`, error);
    throw error;
  }
}
