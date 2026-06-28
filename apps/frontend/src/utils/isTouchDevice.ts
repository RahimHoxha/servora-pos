/**
 * Detects if the current device is a touch device
 * This is important for selecting the right DnD backend
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-expect-error - msMaxTouchPoints is not in the standard TypeScript navigator type
    navigator.msMaxTouchPoints > 0
  );
};
