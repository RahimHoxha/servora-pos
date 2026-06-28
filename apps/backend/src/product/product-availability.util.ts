export interface ProductAvailability {
  availableFromTime?: string | null;
  availableUntilTime?: string | null;
}

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function isProductAvailableNow(
  product: ProductAvailability,
  now: Date = new Date()
): boolean {
  const { availableFromTime, availableUntilTime } = product;

  if (!availableFromTime && !availableUntilTime) {
    return true;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (availableFromTime && availableUntilTime) {
    const fromMinutes = parseTimeToMinutes(availableFromTime);
    const untilMinutes = parseTimeToMinutes(availableUntilTime);

    if (fromMinutes <= untilMinutes) {
      return currentMinutes >= fromMinutes && currentMinutes < untilMinutes;
    }

    return currentMinutes >= fromMinutes || currentMinutes < untilMinutes;
  }

  if (availableUntilTime) {
    return currentMinutes < parseTimeToMinutes(availableUntilTime);
  }

  return currentMinutes >= parseTimeToMinutes(availableFromTime!);
}

export function getProductAvailabilityMessage(
  product: ProductAvailability
): string {
  if (!product.availableFromTime && !product.availableUntilTime) {
    return "";
  }

  if (product.availableFromTime && product.availableUntilTime) {
    return `${product.availableFromTime} - ${product.availableUntilTime}`;
  }

  if (product.availableUntilTime) {
    return `until ${product.availableUntilTime}`;
  }

  return `from ${product.availableFromTime}`;
}
