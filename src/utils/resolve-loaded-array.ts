/**
 * Resolves a value that may still be "loading" from Redux/server state,
 * correctly distinguishing three states:
 *
 *   - not yet loaded                    → returns `null`
 *   - loaded, genuinely empty           → returns the empty array as-is
 *   - loaded, field missing / malformed → returns `fallback`
 *
 * Usage:
 *   const docTypes = resolveLoadedArray(
 *     isLoading,
 *     organization?.mandatoryDocumentTypes,
 *     ["PAN", "AADHAAR"]
 *   );
 */
export function resolveLoadedArray<T>(
  isLoading: boolean,
  value: T[] | null | undefined,
  fallback: T[]
): T[] | null {
  if (isLoading) {
    return null;
  }
  return Array.isArray(value) ? value : fallback;
}

export default resolveLoadedArray;
