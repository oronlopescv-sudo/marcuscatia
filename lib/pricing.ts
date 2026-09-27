// What one guest pays. The restaurant dinner deliberately carries no price on
// the site — what the table pays depends on the menu of the day and is settled
// with Cátia in person — so "no price" has to come out as 0 rather than as the
// guessed €45 that the duplicated fallbacks used to invent.
export function unitPriceOf(
  course: { price?: string; priceNumber?: number } | undefined | null
): number {
  if (!course) return 0;
  const fromNumber = Number(course.priceNumber);
  if (Number.isFinite(fromNumber) && fromNumber > 0) return fromNumber;
  const fromText = parseInt(String(course.price || '').replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(fromText) && fromText > 0 ? fromText : 0;
}

// A total of 0 means "no fixed price yet", never "free", so it must not be
// rendered as €0 next to a real booking.
export function priceLabel(total: number | undefined | null, empty = '—'): string {
  const value = Number(total);
  return Number.isFinite(value) && value > 0 ? `€${value}` : empty;
}
