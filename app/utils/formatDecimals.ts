/**
 * Utility to format numeric values to at most two decimal places in frontend tables and drawers.
 * - Handles pure numbers, numeric strings, and strings with units (e.g. '94.18604651162791 lm/W', '63.765W', '0.39593862kg').
 * - Preserves chromaticity coordinates (CIE 1931 x, y requires 3-4 decimal places, e.g. 0.403, 0.313).
 * - Avoids superfluous trailing zeros on clean numbers while rounding arbitrary floats to 2 decimal places.
 */

export function isChromaticitySpec(specNames: string | string[]): boolean {
  const names = Array.isArray(specNames) ? specNames : [specNames];
  return names.some(name => {
    const lower = name.toLowerCase();
    return lower.includes('chromaticity') || lower.includes('coordinates');
  });
}

export function roundToTwoDecimals(val: unknown, isChromaticity = false): string {
  if (val === null || val === undefined) return '';
  const s = String(val).trim();
  if (!s || s === '—' || s === 'N/A' || s === '-' || s === 'undefined' || s === 'null') {
    return s;
  }
  if (isChromaticity) {
    return s;
  }

  // Matches any decimal number with 3 or more decimal places:
  // e.g. 94.18604651162791, 63.765, 0.39593862
  // Accommodates preceding symbols/spaces/start and trailing units/spaces/end
  return s.replace(/(^|[^a-zA-Z0-9.])(\d+\.\d{3,})(?![0-9.])/g, (match, prefix, numStr) => {
    const num = parseFloat(numStr);
    if (isNaN(num)) return match;
    // Standard accurate exponential round to 2 decimal places
    const rounded = Number(Math.round(Number(num + 'e2')) + 'e-2');
    return prefix + rounded.toString();
  });
}

export function formatSpecValue(val: unknown, specNames: string | string[] = []): string {
  if (val === null || val === undefined) return '';
  const isChrom = isChromaticitySpec(specNames);
  return roundToTwoDecimals(val, isChrom);
}
