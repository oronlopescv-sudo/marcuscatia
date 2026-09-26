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
  // Set when a background save to the server fails (e.g. the admin session
  // expired, or a network/server error) after an optimistic UI update was
  // already reverted. Surfaced by the admin UI so a failed action is never
  // silently mistaken for a successful one.
  lastError: string | null;

  // Actions
  addReservation: (res: Omit<Reservation, 'id' | 'createdAt'>) => Promise<{ ok: true; reservation: Reservation } | { ok: false; error: string }>;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  updateReservationStatus: (id: string, status: Reservation['status']) => void;
  updateReservationPayment: (id: string, status: Reservation['paymentStatus']) => void;
  deleteReservation: (id: string) => void;

  addCourse: (course: Omit<Course, 'id'>) => Course;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  toggleCourseActive: (id: string) => void;
  deleteCourse: (id: string) => void;

  addMessage: (msg: Omit<Message, 'id' | 'createdAt' | 'read'>) => Promise<boolean>;
  markMessageRead: (id: string) => void;
  deleteMessage: (id: string) => void;

  toggleBlockedDate: (dateStr: string) => void;
  hydrate: (data: { reservations?: Reservation[]; messages?: Message[]; blockedDates?: string[]; courses?: Course[] }) => void;
  resetToDefaults: () => void;
  clearError: () => void;
}

// Persists a background change; if the server rejects it (HTTP error) or the
// request fails outright, reverts the optimistic update and records a
// visible error instead of leaving the UI silently out of sync with the
// server (e.g. showing "Confirmed" after a PATCH the server never applied).
function persist(
  set: (partial: Partial<AdminStoreState>) => void,
  url: string,
  options: RequestInit,
  revertTo: Partial<AdminStoreState>,
  errorMessage: string
) {
  fetch(url, options)
    .then((res) => {
      if (!res.ok) {
        console.error(`${errorMessage} (HTTP ${res.status})`);
        set({ ...revertTo, lastError: errorMessage });
      }
    })
    .catch((err) => {
      console.error(errorMessage, err);
      set({ ...revertTo, lastError: errorMessage });
    });
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

export const INITIAL_RESERVATIONS: Reservation[] = [];

export const INITIAL_MESSAGES: Message[] = [];

export const useAdminStore = create<AdminStoreState>((set, get) => ({
  reservations: INITIAL_RESERVATIONS,
  courses: [],
  messages: INITIAL_MESSAGES,
  blockedDates: [],
  lastError: null,

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

      const result = await response.json().catch(() => ({}));
      if (response.ok) {
        const newRes: Reservation = {
          ...trimmedRes,
          id: result.id,
          courseTitle: result.courseTitle ?? trimmedRes.courseTitle,
          time: result.time ?? trimmedRes.time,
          totalPrice: result.totalPrice ?? trimmedRes.totalPrice,
          status: result.status ?? trimmedRes.status,
          paymentStatus: result.paymentStatus ?? trimmedRes.paymentStatus,
          createdAt: new Date().toISOString(),
        };
        set({ reservations: [newRes, ...get().reservations] });
        return { ok: true, reservation: newRes };
      }
      return { ok: false, error: result.error || 'Could not save the booking' };
    } catch (error) {
      console.error('Error saving reservation:', error);
      return { ok: false, error: 'Network error. Please try again.' };
    }
  },

      updateReservation: (id, updates) => {
        const previous = get().reservations;
        set({
          reservations: previous.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        });
        persist(
          set,
          '/api/reservations',
          { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...updates }) },
          { reservations: previous },
          'Could not save the booking changes. Please try again.'
        );
      },

      updateReservationStatus: (id, status) => {
        const reservation = get().reservations.find((r) => r.id === id);
        if (!reservation) return;

        const previousReservations = get().reservations;
        const previousBlockedDates = get().blockedDates;

        set({
          reservations: previousReservations.map((r) =>
            r.id === id ? { ...r, status } : r
          ),
        });

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
        // (which also triggers the confirmation email to the customer). If
        // this fails (e.g. the admin session expired), undo the status AND
        // the auto block/unblock above, so the UI never claims success for
        // an action the server rejected.
        persist(
          set,
          '/api/reservations',
          { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: reservation.id, status }) },
          { reservations: previousReservations, blockedDates: previousBlockedDates },
          'Could not update the booking status. Please try again.'
        );
      },

      updateReservationPayment: (id, paymentStatus) => {
        const previous = get().reservations;
        set({
          reservations: previous.map((r) =>
            r.id === id ? { ...r, paymentStatus } : r
          ),
        });
        persist(
          set,
          '/api/reservations',
          { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, paymentStatus }) },
          { reservations: previous },
          'Could not update the payment status. Please try again.'
        );
      },

      deleteReservation: (id) => {
        const previous = get().reservations;
        set({
          reservations: previous.filter((r) => r.id !== id),
        });
        persist(
          set,
          '/api/reservations',
          { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) },
          { reservations: previous },
          'Could not delete the booking. Please try again.'
        );
      },

      addCourse: (courseData) => {
        const slug = courseData.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '') || 'course';
        // Two classes with the same title must not share an id (primary key).
        const taken = get().courses.some((c) => c.id === slug);
        const newCourse: Course = {
          ...courseData,
          id: taken ? `${slug}-${Date.now().toString(36)}` : slug,
        };
        const previous = get().courses;
        set({ courses: [...previous, newCourse] });

        persist(
          set,
          '/api/courses',
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newCourse) },
          { courses: previous },
          'Could not save the new class. Please try again.'
        );

        return newCourse;
      },

      updateCourse: (id, updates) => {
        const previous = get().courses;
        set({
          courses: previous.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        });
        persist(
          set,
          '/api/courses',
          { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...updates }) },
          { courses: previous },
          'Could not save the class changes. Please try again.'
        );
      },

      toggleCourseActive: (id) => {
        const previous = get().courses;
        const course = previous.find((c) => c.id === id);
        const active = course ? !course.active : false;
        set({
          courses: previous.map((c) =>
            c.id === id ? { ...c, active } : c
          ),
        });
        persist(
          set,
          '/api/courses',
          { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, active }) },
          { courses: previous },
          'Could not update the class visibility. Please try again.'
        );
      },

      deleteCourse: (id) => {
        const previous = get().courses;
        set({
          courses: previous.filter((c) => c.id !== id),
        });
        persist(
          set,
          '/api/courses',
          { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) },
          { courses: previous },
          'Could not delete the class. Please try again.'
        );
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
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error saving message:', error);
          return false;
        }
      },

      markMessageRead: (id) => {
        const previous = get().messages;
        set({
          messages: previous.map((m) =>
            m.id === id ? { ...m, read: true } : m
          ),
        });
        persist(
          set,
          '/api/messages',
          { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, read: true }) },
          { messages: previous },
          'Could not mark the message as read. Please try again.'
        );
      },

      deleteMessage: (id) => {
        const previous = get().messages;
        set({
          messages: previous.filter((m) => m.id !== id),
        });
        persist(
          set,
          `/api/messages?id=${encodeURIComponent(id)}`,
          { method: 'DELETE' },
          { messages: previous },
          'Could not delete the message. Please try again.'
        );
      },

      toggleBlockedDate: (dateStr) => {
        const current = get().blockedDates;
        const isBlocked = current.includes(dateStr);
        set({ blockedDates: isBlocked ? current.filter((d) => d !== dateStr) : [...current, dateStr] });

        // Persist to the database so the block survives a refresh and is
        // seen by visitors booking from other browsers.
        persist(
          set,
          '/api/blocked-dates',
          {
            method: isBlocked ? 'DELETE' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: dateStr, ...(isBlocked ? {} : { reason: 'Blocked via admin' }) }),
          },
          { blockedDates: current },
          'Could not save the date change. Please try again.'
        );
      },

      hydrate: (data) => {
        set({
          reservations: mergeById(get().reservations, data.reservations),
          messages: mergeById(get().messages, data.messages),
          blockedDates: Array.from(new Set([...get().blockedDates, ...(data.blockedDates || [])])),
          // Only replace the courses when the caller loaded them; hydrating
          // just the blocked dates must not wipe the course list.
          ...(Array.isArray(data.courses) ? { courses: data.courses } : {}),
        });
      },

      resetToDefaults: () => {
        set({
          reservations: INITIAL_RESERVATIONS,
          courses: [],
          messages: INITIAL_MESSAGES,
          blockedDates: [],
        });
      },

      clearError: () => set({ lastError: null }),
    })
);
