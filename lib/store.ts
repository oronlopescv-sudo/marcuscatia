'use client';

import { create } from 'zustand';

export interface Reservation {
  id: string;
  studentName: string;
  email: string;
  phone: string;
  courseId: string;
  courseTitle: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:00 - 12:30"
  guests: number;
  totalPrice: number;
  currency: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'confirmada' | 'pendente' | 'concluida' | 'cancelada';
  notes?: string;
  dietaryRestrictions?: string;
  createdAt: string;
  paymentStatus: 'paid' | 'on_arrival' | 'pending' | 'pago' | 'no_local' | 'pendente';
}

export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  maxCapacity: number;
  level?: string;
  price: string;
  priceNumber: number;
  active: boolean;
  timeSlot?: string;
  includes: string[];
}

export interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface AdminStoreState {
  reservations: Reservation[];
  courses: Course[];
  messages: Message[];
  blockedDates: string[]; // ['2026-09-20', ...]

  // Actions
  addReservation: (res: Omit<Reservation, 'id' | 'createdAt'>) => Promise<Reservation | null>;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  updateReservationStatus: (id: string, status: Reservation['status']) => void;
  updateReservationPayment: (id: string, status: Reservation['paymentStatus']) => void;
  deleteReservation: (id: string) => void;

  addCourse: (course: Omit<Course, 'id'>) => Course;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  toggleCourseActive: (id: string) => void;
  deleteCourse: (id: string) => void;

  addMessage: (msg: Omit<Message, 'id' | 'createdAt' | 'read'>) => Promise<void>;
  markMessageRead: (id: string) => void;
  deleteMessage: (id: string) => void;

  toggleBlockedDate: (dateStr: string) => void;
  hydrate: (data: { reservations?: Reservation[]; messages?: Message[]; blockedDates?: string[]; courses?: Course[] }) => void;
  resetToDefaults: () => void;
}

// Junta arrays já existentes (session) com dados vindos do servidor, sem
// duplicar por id. Mantém a ordem: primeiro o que já estava na sessão.
function mergeById<T extends { id: string | number }>(local: T[], server: T[] | null | undefined): T[] {
  const seen = new Set<string | number>();
  const out: T[] = [];
  for (const item of [...local, ...(Array.isArray(server) ? server : [])]) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      out.push(item);
    }
  }
  return out;
}

export const INITIAL_COURSES: Course[] = [
  {
    id: 'cooking-course',
    title: 'Traditional Cooking Class',
    description: 'A guided visit to the Municipal Market and Fish Market of Mindelo, traditional local transport to our family home in Fonte Francês, and a hands-on Cape Verdean cooking class in a warm, welcoming environment.',
    image: 'https://static.wixstatic.com/media/f4fd80_4ae355554a644923a2290e145fe89000~mv2.jpg',
    duration: '2h 30min',
    maxCapacity: 8,
    price: '€45',
    priceNumber: 45,
    active: true,
    timeSlot: '10:00 - 12:30',
    includes: [
      'Guided tour of Mindelo Municipal Market & Fish Market',
      'Traditional collective transport to Fonte Francês',
      'Hands-on Cape Verdean cooking masterclass with Cátia',
      'Complete home-cooked lunch and group tasting',
      'Welcome drinks and printed souvenir recipe booklet'
    ]
  },
  {
    id: 'vegetarian-creole',
    title: 'Vegetarian / Vegan Cooking Class',
    description: 'As featured on German television cooking shows! A comprehensive plant-based masterclass celebrating São Vicente vegetables: slow-simmered bean & squash Cachupa, sweet potato, manioc, and rich aromatic Creole sofrito.',
    image: 'https://static.wixstatic.com/media/f4fd80_df372cb7dc234c4b876dbbfda91d0f56~mv2.jpg',
    duration: '2h 30min',
    maxCapacity: 8,
    price: '€40',
    priceNumber: 40,
    active: true,
    timeSlot: '15:00 - 17:30',
    includes: [
      '100% plant-based fresh market produce and island herbs',
      'Plant-based Cachupa and vegetable Creole recipes',
      'Flavor building and traditional seasoning techniques',
      'Full sit-down meal with tropical fruit juices & local punch',
      'Printed vegetarian & vegan recipe cards to take home'
    ]
  }
];

export const INITIAL_RESERVATIONS: Reservation[] = [];

export const INITIAL_MESSAGES: Message[] = [];

export const useAdminStore = create<AdminStoreState>((set, get) => ({
  reservations: INITIAL_RESERVATIONS,
  courses: INITIAL_COURSES,
  messages: INITIAL_MESSAGES,
  blockedDates: [],

  addReservation: async (res) => {
    const trimmedRes = {
      ...res,
      studentName: res.studentName.trim(),
      email: res.email.trim(),
      phone: res.phone.trim(),
      courseTitle: res.courseTitle.trim(),
      notes: (res.notes || '').trim(),
    };

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trimmedRes),
      });

      const result = await response.json();
      if (response.ok) {
        const newRes: Reservation = {
          ...trimmedRes,
          id: result.id,
          createdAt: new Date().toISOString(),
        };
        set({ reservations: [newRes, ...get().reservations] });
        return newRes;
      }
    } catch (error) {
      console.error('Error saving reservation:', error);
    }

    return null as any;
  },

      updateReservation: (id, updates) => {
        set({
          reservations: get().reservations.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        });
      },

      updateReservationStatus: (id, status) => {
        const reservation = get().reservations.find((r) => r.id === id);
        set({
          reservations: get().reservations.map((r) =>
            r.id === id ? { ...r, status } : r
          ),
        });

        if (!reservation) return;

        const nowConfirmed = status === 'confirmed' || status === 'confirmada';
        const nowCancelled = status === 'cancelled' || status === 'cancelada';
        const { blockedDates, toggleBlockedDate, reservations } = get();

        if (nowConfirmed && !blockedDates.includes(reservation.date)) {
          // Auto-block the date so no one else can book the same slot.
          toggleBlockedDate(reservation.date);
        } else if (nowCancelled && blockedDates.includes(reservation.date)) {
          // Only auto-unblock if no OTHER confirmed reservation still
          // needs that date blocked.
          const stillNeeded = reservations.some(
            (r) => r.id !== id && r.date === reservation.date &&
              (r.status === 'confirmed' || r.status === 'confirmada')
          );
          if (!stillNeeded) {
            toggleBlockedDate(reservation.date);
          }
        }

        // Persist the change so the admin approval reaches the server
        // (which also triggers the confirmation email to the customer).
        fetch('/api/reservations', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: reservation.id, status }),
        }).catch((err) => console.error('Error persisting reservation status:', err));
      },

      updateReservationPayment: (id, paymentStatus) => {
        set({
          reservations: get().reservations.map((r) =>
            r.id === id ? { ...r, paymentStatus } : r
          ),
        });
        fetch('/api/reservations', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, paymentStatus }),
        }).catch((err) => console.error('Error persisting payment status:', err));
      },

      deleteReservation: (id) => {
        set({
          reservations: get().reservations.filter((r) => r.id !== id),
        });
        fetch('/api/reservations', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        }).catch((err) => console.error('Error deleting reservation:', err));
      },

      addCourse: (courseData) => {
        const newCourse: Course = {
          ...courseData,
          id: courseData.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') || `curso-${Date.now()}`,
        };
        set({ courses: [...get().courses, newCourse] });

        fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCourse),
        }).catch((err) => console.error('Error persisting course:', err));

        return newCourse;
      },

      updateCourse: (id, updates) => {
        set({
          courses: get().courses.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        });
        fetch('/api/courses', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...updates }),
        }).catch((err) => console.error('Error persisting course update:', err));
      },

      toggleCourseActive: (id) => {
        const course = get().courses.find((c) => c.id === id);
        const active = course ? !course.active : false;
        set({
          courses: get().courses.map((c) =>
            c.id === id ? { ...c, active } : c
          ),
        });
        fetch('/api/courses', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, active }),
        }).catch((err) => console.error('Error persisting course active state:', err));
      },

      deleteCourse: (id) => {
        set({
          courses: get().courses.filter((c) => c.id !== id),
        });
        fetch('/api/courses', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        }).catch((err) => console.error('Error deleting course:', err));
      },

      addMessage: async (msg) => {
        const trimmedMsg = {
          ...msg,
          name: msg.name.trim(),
          email: msg.email.trim(),
          phone: (msg.phone || '').trim(),
          subject: (msg.subject || '').trim(),
          message: msg.message.trim(),
        };

        try {
          const response = await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trimmedMsg),
          });

          const result = await response.json();
          if (response.ok) {
            const newMsg: Message = {
              ...trimmedMsg,
              id: result.id,
              read: false,
              createdAt: new Date().toISOString(),
            };
            set({ messages: [newMsg, ...get().messages] });
          }
        } catch (error) {
          console.error('Error saving message:', error);
        }
      },

      markMessageRead: (id) => {
        set({
          messages: get().messages.map((m) =>
            m.id === id ? { ...m, read: true } : m
          ),
        });
      },

      deleteMessage: (id) => {
        set({
          messages: get().messages.filter((m) => m.id !== id),
        });
      },

      toggleBlockedDate: (dateStr) => {
        const current = get().blockedDates;
        const isBlocked = current.includes(dateStr);
        if (isBlocked) {
          set({ blockedDates: current.filter((d) => d !== dateStr) });
        } else {
          set({ blockedDates: [...current, dateStr] });
        }

        // Persist to the database so the block survives a refresh and is
        // seen by visitors booking from other browsers (best-effort).
        try {
          fetch('/api/blocked-dates', {
            method: isBlocked ? 'DELETE' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              date: dateStr,
              ...(isBlocked ? {} : { reason: 'Blocked via admin' }),
            }),
          }).catch((err) => console.error('Failed to persist blocked date:', err));
        } catch (err) {
          console.error('Failed to persist blocked date:', err);
        }
      },

      hydrate: (data) => {
        set({
          reservations: mergeById(get().reservations, data.reservations),
          messages: mergeById(get().messages, data.messages),
          blockedDates: Array.from(new Set([...get().blockedDates, ...(data.blockedDates || [])])),
          courses: mergeById(get().courses, data.courses),
        });
      },

      resetToDefaults: () => {
        set({
          reservations: INITIAL_RESERVATIONS,
          courses: INITIAL_COURSES,
          messages: INITIAL_MESSAGES,
          blockedDates: [],
        });
      },
    })
);
