/**
 * Format large numbers with K, M, B, T suffixes.
 * Matches the original v.recipes formatting logic.
 *
 * formatNumber(598300000) → "598.3M"
 * formatNumber(46887)     → "46.9K"
 * formatNumber(42)        → "42"
 */
export function formatNumber(num: number): string {
  if (num === 0) return "0";
  const k = 1000;
  const suffixes = ["", "K", "M", "B", "T"];
  const i = Math.floor(Math.log(Math.abs(num)) / Math.log(k));
  if (i === 0) return num.toString();
  return parseFloat((num / Math.pow(k, i)).toFixed(1)) + suffixes[i];
}

/**
 * Format byte counts with B, KB, MB, GB, TB, PB suffixes.
 * Uses 1024-based units.
 *
 * formatBytes(726300000000) → "676.57 GB"
 * formatBytes(0)            → "0 B"
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
