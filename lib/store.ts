'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Reservation {
  id: string;
  studentName: string;
  email: string;
  phone: string;
  courseId: string;
  courseTitle: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "09:30 - 13:30"
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
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Iniciante' | 'Intermédio' | 'Avançado';
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
  addReservation: (res: Omit<Reservation, 'id' | 'createdAt'>) => Reservation;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  updateReservationStatus: (id: string, status: Reservation['status']) => void;
  updateReservationPayment: (id: string, status: Reservation['paymentStatus']) => void;
  deleteReservation: (id: string) => void;
  
  addCourse: (course: Omit<Course, 'id'>) => Course;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  toggleCourseActive: (id: string) => void;
  deleteCourse: (id: string) => void;

  addMessage: (msg: Omit<Message, 'id' | 'createdAt' | 'read'>) => void;
  markMessageRead: (id: string) => void;
  deleteMessage: (id: string) => void;

  toggleBlockedDate: (dateStr: string) => void;
  resetToDefaults: () => void;
}

export const INITIAL_COURSES: Course[] = [
  {
    id: 'cooking-course',
    title: 'Traditional Cooking Class & Mindelo Markets Tour',
    description: 'A guided visit to the Municipal Market and Fish Market of Mindelo, traditional local transport to our family home in Fonte Francês, and a hands-on Cape Verdean cooking class in a warm, welcoming environment.',
    image: 'https://static.wixstatic.com/media/f4fd80_4ae355554a644923a2290e145fe89000~mv2.jpg',
    duration: '2h 30min',
    maxCapacity: 8,
    level: 'Beginner',
    price: '€45',
    priceNumber: 45,
    active: true,
    timeSlot: '09:30 - 12:00',
    includes: [
      'Guided tour of Mindelo Municipal Market & Fish Market',
      'Traditional collective transport to Fonte Francês',
      'Hands-on Cape Verdean cooking masterclass with Cátia',
      'Complete home-cooked lunch and group tasting',
      'Welcome drinks and printed souvenir recipe booklet'
    ]
  },
  {
    id: 'cachupa-rica',
    title: 'The Art of Cachupa Rica from São Vicente',
    description: 'Learn how to cook Cape Verde\'s national dish from scratch. From preparing hominy corn and savory meats to the secret sauté that imparts its signature rich golden flavor.',
    image: 'https://static.wixstatic.com/media/f4fd80_eff5a4e083fe40478fb642ec935dfd8c~mv2.jpg',
    duration: '3h 30min',
    maxCapacity: 6,
    level: 'Beginner',
    price: '€45',
    priceNumber: 45,
    active: true,
    timeSlot: '09:30 - 13:00',
    includes: [
      'Fresh ingredients straight from Mindelo market',
      'Souvenir cotton cooking apron',
      'Full sit-down lunch with panoramic mountain views',
      'Step-by-step printed recipe card',
      'Traditional Cape Verdean welcome beverage'
    ]
  },
  {
    id: 'vegetarian-creole',
    title: 'Vegetarian & Vegan Cape Verdean Creole Masterclass',
    description: 'As featured on German television cooking shows! A comprehensive plant-based masterclass celebrating São Vicente vegetables: slow-simmered bean & squash Cachupa, sweet potato, manioc, and rich aromatic Creole sofrito.',
    image: 'https://static.wixstatic.com/media/f4fd80_df372cb7dc234c4b876dbbfda91d0f56~mv2.jpg',
    duration: '2h 30min',
    maxCapacity: 8,
    level: 'Beginner',
    price: '€40',
    priceNumber: 40,
    active: true,
    timeSlot: '10:00 - 12:30',
    includes: [
      '100% plant-based fresh market produce and island herbs',
      'Plant-based Cachupa and vegetable Creole recipes',
      'Flavor building and traditional seasoning techniques',
      'Full sit-down lunch with tropical fruit juices & local punch',
      'Printed vegetarian & vegan recipe cards to take home'
    ]
  },
  {
    id: 'caldo-de-peixe',
    title: 'Mindelo Fresh Catch & Island Caldo de Peixe',
    description: 'Experience Mindelo\'s rich seafaring heritage. Visit the bustling fish market to pick the day\'s fresh Atlantic catch, then cook an authentic Creole fish stew with manioc, green plantains, sweet potato, and aromatic herbs.',
    image: 'https://static.wixstatic.com/media/f4fd80_ec9272a13451476a845b928470b355eb~mv2.jpg',
    duration: '3h 00min',
    maxCapacity: 6,
    level: 'Intermediate',
    price: '€45',
    priceNumber: 45,
    active: true,
    timeSlot: '09:00 - 12:00',
    includes: [
      'Mindelo Fish Market guided tour to meet local fishermen',
      'Selecting the freshest Atlantic catch of the day',
      'Traditional seafood broth simmering and seasoning techniques',
      'Convivial lunch with local grogue and island lime drinks',
      'Souvenir printed recipe booklet'
    ]
  },
  {
    id: 'pastel-tuna',
    title: 'Cape Verdean Tuna Pastels & Street Savories',
    description: 'Master the flaky, golden crust and spicy, succulent filling of São Vicente\'s famous tuna pastéis, complemented by savory rissóis and homemade malagueta chili dip.',
    image: 'https://static.wixstatic.com/media/f4fd80_df722da0f9d64552824877d9974b8511~mv2.jpg',
    duration: '2h 30min',
    maxCapacity: 8,
    level: 'Intermediate',
    price: '€35',
    priceNumber: 35,
    active: true,
    timeSlot: '15:00 - 17:30',
    includes: [
      'Fresh wild tuna from Mindelo fishing harbor',
      'Dough rolling, filling folding, and crispy frying techniques',
      'Tasting paired with fresh fruit juice or local grogue',
      'Printed savory pastry recipe cheat sheet'
    ]
  },
  {
    id: 'arroz-atum',
    title: 'Mindelo Traditional Tuna Rice (Arroz de Atum)',
    description: 'Cape Verde\'s ultimate comfort dish. A masterclass focused on Creole herbs, aromatic broth reduction, and flawless rice texture with fresh Atlantic tuna.',
    image: 'https://static.wixstatic.com/media/f4fd80_d539e27b44eb44299b751dfa7af7219d~mv2.jpg',
    duration: '2h 30min',
    maxCapacity: 8,
    level: 'Beginner',
    price: '€40',
    priceNumber: 40,
    active: true,
    timeSlot: '10:00 - 12:30',
    includes: [
      'Fresh local line-caught Atlantic tuna steaks',
      'Traditional spiced seafood broth preparation',
      'Convivial lunch in Cátia\'s private kitchen'
    ]
  },
  {
    id: 'doces-tradicionais',
    title: 'Island Desserts: Goat Cheese Pudding & Sweet Papaya',
    description: 'Round off your meals in true island style. Learn to make creamy baked goat cheese flan (Pudim de Queijo) and crystallized sweet papaya preserves.',
    image: 'https://static.wixstatic.com/media/f4fd80_5b31e58350534d69bcc87999a830c300~mv2.jpg',
    duration: '2h 30min',
    maxCapacity: 8,
    level: 'Beginner',
    price: '€30',
    priceNumber: 30,
    active: true,
    timeSlot: '15:30 - 18:00',
    includes: [
      'Artisanal goat cheese from São Vicente and Santo Antão',
      'Take-home glass jars of homemade preserves',
      'Fresh lemongrass tea and organic volcanic Fogo coffee'
    ]
  }
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res-101',
    studentName: 'Ana Clara Fernandes',
    email: 'anaclara.f@gmail.com',
    phone: '+351912345678',
    courseId: 'cachupa-rica',
    courseTitle: 'The Art of Cachupa Rica',
    date: '2026-09-18',
    time: '09:30 - 13:30',
    guests: 2,
    totalPrice: 90,
    currency: 'EUR',
    status: 'confirmed',
    paymentStatus: 'paid',
    dietaryRestrictions: 'No dietary restrictions',
    notes: 'We are on our honeymoon in Mindelo, very eager to cook!',
    createdAt: '2026-09-14T10:20:00Z'
  },
  {
    id: 'res-102',
    studentName: 'Jean-Luc Moreau',
    email: 'jl.moreau@orange.fr',
    phone: '+33612345678',
    courseId: 'pastel-tuna',
    courseTitle: 'Cape Verdean Tuna Pastels & Street Savories',
    date: '2026-09-19',
    time: '15:00 - 18:00',
    guests: 3,
    totalPrice: 105,
    currency: 'EUR',
    status: 'confirmed',
    paymentStatus: 'on_arrival',
    notes: 'Do you speak a bit of French or English? Looking forward to it!',
    createdAt: '2026-09-15T14:40:00Z'
  },
  {
    id: 'res-103',
    studentName: 'Marco Delgado',
    email: 'marco.delgado@cvtelecom.cv',
    phone: '+2389912345',
    courseId: 'cooking-course',
    courseTitle: 'Traditional Cooking Class & Markets Tour',
    date: '2026-09-22',
    time: '09:30 - 12:00',
    guests: 4,
    totalPrice: 180,
    currency: 'EUR',
    status: 'pending',
    paymentStatus: 'pending',
    notes: 'Group of friends from São Vicente celebrating a birthday.',
    createdAt: '2026-09-16T08:10:00Z'
  },
  {
    id: 'res-104',
    studentName: 'Sarah Jenkins',
    email: 'sarah.j@outlook.com',
    phone: '+14155552671',
    courseId: 'cachupa-rica',
    courseTitle: 'The Art of Cachupa Rica',
    date: '2026-09-25',
    time: '09:30 - 13:30',
    guests: 1,
    totalPrice: 45,
    currency: 'EUR',
    status: 'confirmed',
    paymentStatus: 'paid',
    dietaryRestrictions: 'Vegetarian (Bean & Vegetable Cachupa)',
    notes: 'Can Cátia prepare a vegetarian version with local island vegetables?',
    createdAt: '2026-09-16T07:30:00Z'
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    name: 'Carlos and Mariana',
    email: 'carlos.mariana@sapo.pt',
    phone: '+351934567890',
    subject: 'Private family class with children',
    message: 'Hello Cátia! We will be in Mindelo next week with our 2 children (aged 8 and 11). Is it possible to arrange a tailored class where kids can learn how to fold tuna pastels?',
    read: false,
    createdAt: '2026-09-16T06:15:00Z'
  },
  {
    id: 'msg-2',
    name: 'Elena Rostova',
    email: 'elena.rostova@gmail.com',
    phone: '+491701234567',
    subject: 'Fish market tour prior to class',
    message: 'Good morning! Could you please let me know if the Cachupa morning session includes the market visit to purchase fresh ingredients together with Cátia?',
    read: true,
    createdAt: '2026-09-15T16:00:00Z'
  }
];

export const useAdminStore = create<AdminStoreState>()(
  persist(
    (set, get) => ({
      reservations: INITIAL_RESERVATIONS,
      courses: INITIAL_COURSES,
      messages: INITIAL_MESSAGES,
      blockedDates: ['2026-09-21'], // e.g. Segunda-feira de descanso

      addReservation: (res) => {
        // Trim all string fields
        const trimmedRes = {
          ...res,
          studentName: res.studentName.trim(),
          email: res.email.trim(),
          phone: res.phone.trim(),
          courseTitle: res.courseTitle.trim(),
          notes: (res.notes || '').trim(),
        };

        const newRes: Reservation = {
          ...trimmedRes,
          id: `res-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set({ reservations: [newRes, ...get().reservations] });
        return newRes;
      },

      updateReservation: (id, updates) => {
        set({
          reservations: get().reservations.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        });
      },

      updateReservationStatus: (id, status) => {
        set({
          reservations: get().reservations.map((r) =>
            r.id === id ? { ...r, status } : r
          ),
        });
      },

      updateReservationPayment: (id, paymentStatus) => {
        set({
          reservations: get().reservations.map((r) =>
            r.id === id ? { ...r, paymentStatus } : r
          ),
        });
      },

      deleteReservation: (id) => {
        set({
          reservations: get().reservations.filter((r) => r.id !== id),
        });
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
        return newCourse;
      },

      updateCourse: (id, updates) => {
        set({
          courses: get().courses.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        });
      },

      toggleCourseActive: (id) => {
        set({
          courses: get().courses.map((c) =>
            c.id === id ? { ...c, active: !c.active } : c
          ),
        });
      },

      deleteCourse: (id) => {
        set({
          courses: get().courses.filter((c) => c.id !== id),
        });
      },

      addMessage: (msg) => {
        const trimmedMsg = {
          ...msg,
          name: msg.name.trim(),
          email: msg.email.trim(),
          phone: (msg.phone || '').trim(),
          subject: (msg.subject || '').trim(),
          message: msg.message.trim(),
        };

        const newMsg: Message = {
          ...trimmedMsg,
          id: `msg-${Date.now()}`,
          read: false,
          createdAt: new Date().toISOString(),
        };
        set({ messages: [newMsg, ...get().messages] });
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
        if (current.includes(dateStr)) {
          set({ blockedDates: current.filter((d) => d !== dateStr) });
        } else {
          set({ blockedDates: [...current, dateStr] });
        }
      },

      resetToDefaults: () => {
        set({
          reservations: INITIAL_RESERVATIONS,
          courses: INITIAL_COURSES,
          messages: INITIAL_MESSAGES,
          blockedDates: ['2026-09-21'],
        });
      },
    }),
    {
      name: 'catia-cooking-mindelo-admin-storage-v4',
    }
  )
);
