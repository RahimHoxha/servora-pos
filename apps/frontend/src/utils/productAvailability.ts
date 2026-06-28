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

export function getProductServingLabel(
  product: ProductAvailability,
  t: (key: string, options?: Record<string, string>) => string
): string | null {
  if (!product.availableFromTime && !product.availableUntilTime) {
    return null;
  }

  if (product.availableFromTime && product.availableUntilTime) {
    return t("Products.servingHoursRange", {
      from: product.availableFromTime,
      until: product.availableUntilTime,
    });
  }

  if (product.availableUntilTime) {
    return t("Products.servingHoursUntil", {
      until: product.availableUntilTime,
    });
  }

  return t("Products.servingHoursFrom", {
    from: product.availableFromTime!,
  });
}
