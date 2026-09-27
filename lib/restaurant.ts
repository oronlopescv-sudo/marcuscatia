import type { Course } from '@/lib/store';

// The restaurant dinner is booked through the same reservations table as the
// classes, using this fixed "course" instead of a row in the courses table.
export const RESTAURANT_MIN_GUESTS = 4;
export const RESTAURANT_MAX_GUESTS = 20;

// Unlike classes (one fixed time per course), the dinner has multiple
// seatings the guest picks from — editable in Admin → Settings ("Site
// Information") as a comma-separated list; this is only the fallback before
// that setting loads / if it's never set.
export const DEFAULT_RESTAURANT_TIME_SLOTS = ['18:00', '21:00'];

export function parseTimeSlots(raw: string | undefined | null): string[] {
  const slots = (raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s));
  return slots.length > 0 ? slots : DEFAULT_RESTAURANT_TIME_SLOTS;
}

export const RESTAURANT_DINNER: Course = {
  id: 'restaurant-dinner',
  title: 'Restaurant Dinner',
  description:
    'A three-course Cape Verdean dinner at Cátia’s family table in Fonte Francês: starter, main course and dessert, cooked with fresh produce from the Mindelo market.',
  image: '/catia-cutting-fish.jpg',
  duration: 'Evening seatings',
  maxCapacity: RESTAURANT_MAX_GUESTS,
  // No price on the site: the dinner follows the menu of the day and is
  // settled with Cátia in person. An empty price makes the price tags and
  // totals disappear (see lib/pricing.ts) instead of showing €0.
  price: '',
  priceNumber: 0,
  active: true,
  timeSlot: DEFAULT_RESTAURANT_TIME_SLOTS[0],
  includes: ['Starter', 'Main course', 'Dessert'],
};

export const DEFAULT_MENU = [
  { title: 'Starter', description: 'Seasonal Cape Verdean starter', body: 'Made with fresh ingredients from the Mindelo market.' },
  { title: 'Main course', description: 'Traditional dish of the day', body: 'A classic Cape Verdean recipe cooked the way Cátia’s family makes it.' },
  { title: 'Dessert', description: 'Homemade dessert', body: 'A sweet island finish to the evening.' },
];

export function isRestaurantBooking(courseId: string | undefined | null): boolean {
  return courseId === RESTAURANT_DINNER.id;
}
