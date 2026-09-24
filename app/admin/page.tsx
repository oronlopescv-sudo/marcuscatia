'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Eye, 
  Edit3, 
  Trash2, 
  LogOut, 
  ShieldCheck, 
  Printer, 
  Download,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  CalendarX,
  Lock,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useAdminStore, Reservation, Course, Message } from '@/lib/store';
import { AdminGalleryManager } from '@/components/AdminGalleryManager';
import { LogoUploadManager } from '@/components/LogoUploadManager';
import { ContentEditor } from '@/components/ContentEditor';
import { CoursePhotoUpload } from '@/components/CoursePhotoUpload';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

export default function AdminPage() {
  // IMPORTANT: always start as false so server and first client render match
  // exactly. Reading sessionStorage inside the useState initializer causes a
  // hydration mismatch (server has no window, client may already be
  // authenticated), which produced the "Application error: a client-side
  // exception has occurred" crash on /admin. The real value is read after
  // mount instead, via the effect below.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'reservations' | 'courses' | 'messages' | 'calendar' | 'gallery' | 'content' | 'settings'>('overview');

  // Read any existing session after mount (client-only), never during SSR.
  useEffect(() => {
    if (sessionStorage.getItem('catia_admin_authenticated') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load real data from the database into the client store. Without this,
  // the dashboard only showed data created inside the current browser
  // session and went blank after a refresh (reservations/messages/blocked
  // dates made by visitors were never fetched).
  useEffect(() => {
    let cancelled = false;

    const loadFromServer = async (path: string) => {
      try {
        const res = await fetch(path);
        if (!res.ok) return {};
        return res.json();
      } catch (err) {
        console.error(`Failed to load ${path}:`, err);
        return {};
      }
    };

    (async () => {
      // Shape the server responses into what the store expects.
      const reservations = await loadFromServer('/api/reservations');
      const messages = await loadFromServer('/api/messages');
      const blocked = await loadFromServer('/api/blocked-dates');
      const courses = await loadFromServer('/api/courses?all=1');
      if (cancelled) return;

      hydrate({
        reservations: Array.isArray(reservations) ? reservations : reservations?.reservations,
        messages: Array.isArray(messages) ? messages : messages?.messages,
        blockedDates: Array.isArray(blocked) ? blocked : blocked?.blockedDates,
        courses: Array.isArray(courses) ? courses : courses?.courses,
      });
    })();

    return () => {
      cancelled = true;
    };
    // hydrate is a referentially stable zustand action, safe to omit from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load saved Site Information settings (best-effort; shows defaults if none)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/settings');
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setSiteInfo((prev) => ({
          site_title: data.site_title || prev.site_title,
          site_email: data.site_email || prev.site_email,
          site_whatsapp: data.site_whatsapp || prev.site_whatsapp,
          site_location: data.site_location || prev.site_location,
        }));
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Store hooks
  const { 
    reservations, 
    courses, 
    messages, 
    blockedDates,
    updateReservation,
    updateReservationStatus, 
    updateReservationPayment,
    deleteReservation, 
    addReservation,
    addCourse,
    updateCourse,
    toggleCourseActive,
    deleteCourse,
    markMessageRead,
    deleteMessage,
    toggleBlockedDate,
    hydrate
  } = useAdminStore();

  // Search & Filters for Reservations
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Modal States
  const [showAddResModal, setShowAddResModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Change-PIN form state
  const [pinCurrent, setPinCurrent] = useState('');
  const [pinNew, setPinNew] = useState('');
  const [pinSaving, setPinSaving] = useState(false);
  const [pinMessage, setPinMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Site Information (Settings) state
  const [siteInfo, setSiteInfo] = useState({
    site_title: 'Cátia Cooking Mindelo',
    site_email: 'info@catiamindelo.com',
    site_whatsapp: '+238 595 3973',
    site_location: 'Mindelo, Cape Verde',
  });
  const [settingsMsg, setSettingsMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsMsg(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteInfo),
      });
      if (res.ok) {
        setSettingsMsg({ type: 'ok', text: 'Settings saved.' });
        setTimeout(() => setSettingsMsg(null), 3000);
      } else {
        setSettingsMsg({ type: 'err', text: 'Could not save settings.' });
      }
    } catch {
      setSettingsMsg({ type: 'err', text: 'Network error saving settings.' });
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinSaving(true);
    setPinMessage(null);
    try {
      const res = await fetch('/api/admin/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPin: pinCurrent, newPin: pinNew }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setPinMessage({ type: 'ok', text: 'PIN atualizado com sucesso.' });
        setPinCurrent('');
        setPinNew('');
      } else {
        setPinMessage({ type: 'err', text: data.error || 'Não foi possível alterar o PIN.' });
      }
    } catch (err) {
      console.error('Change PIN failed:', err);
      setPinMessage({ type: 'err', text: 'Erro de conexão ao trocar o PIN.' });
    } finally {
      setPinSaving(false);
    }
  };

  // CSV Export
  const exportReservationsCSV = () => {
    const headers = ['ID', 'Student Name', 'Email', 'Phone', 'Course', 'Date', 'Time', 'Guests', 'Total EUR', 'Status', 'Payment Status', 'Dietary Restrictions', 'Notes'];
    const rows = filteredReservations.map(r => [
      r.id,
      `"${r.studentName.replace(/"/g, '""')}"`,
      `"${r.email}"`,
      `"${r.phone}"`,
      `"${r.courseTitle.replace(/"/g, '""')}"`,
      r.date,
      `"${r.time}"`,
      r.guests,
      r.totalPrice,
      r.status,
      r.paymentStatus,
      `"${(r.dietaryRestrictions || '').replace(/"/g, '""')}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `catia-cooking-mindelo-bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // New Reservation Form State
  const [newRes, setNewRes] = useState({
    studentName: '',
    email: '',
    phone: '',
    courseId: courses[0]?.id || 'cooking-course',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: courses[0]?.timeSlot || '10:00 - 12:30',
    guests: 2,
    status: 'confirmed' as Reservation['status'],
    paymentStatus: 'on_arrival' as Reservation['paymentStatus'],
    notes: '',
    dietaryRestrictions: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem('catia_admin_authenticated', 'true');
        setPinInput('');
      } else {
        setAuthError('Incorrect PIN. Please try again.');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setAuthError('Could not verify PIN. Check your connection.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('catia_admin_authenticated');
  };

  // Status helper predicates
  const isConfirmed = (status: Reservation['status']) => status === 'confirmed' || status === 'confirmada';
  const isPending = (status: Reservation['status']) => status === 'pending' || status === 'pendente';
  const isCompleted = (status: Reservation['status']) => status === 'completed' || status === 'concluida';
  const isCancelled = (status: Reservation['status']) => status === 'cancelled' || status === 'cancelada';

  // Calculations
  const totalReservations = reservations.length;
  const confirmedReservations = reservations.filter(r => isConfirmed(r.status));
  const pendingReservations = reservations.filter(r => isPending(r.status));
  const totalGuests = confirmedReservations.reduce((acc, r) => acc + r.guests, 0);
  const totalRevenueEUR = confirmedReservations.reduce((acc, r) => acc + (r.totalPrice || 0), 0);
  const totalRevenueCVE = Math.round(totalRevenueEUR * 110.265);
  const unreadMessagesCount = messages.filter(m => !m.read).length;

  // Filtered reservations
  const filteredReservations = reservations.filter(r => {
    const matchesSearch = 
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'pending') matchesStatus = isPending(r.status);
    else if (statusFilter === 'confirmed') matchesStatus = isConfirmed(r.status);
    else if (statusFilter === 'completed') matchesStatus = isCompleted(r.status);
    else if (statusFilter === 'cancelled') matchesStatus = isCancelled(r.status);

    return matchesSearch && matchesStatus;
  });

  // Today and upcoming
  const upcomingReservations = [...reservations]
    .filter(r => !isCancelled(r.status))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: Check required fields
    if (!newRes.studentName.trim() || !newRes.email.trim() || !newRes.phone.trim()) {
      alert('Please fill in all required fields: Name, Email, and Phone');
      return;
    }

    // Validation: Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newRes.email.trim())) {
      alert('Please enter a valid email address');
      return;
    }

    // Validation: Check phone has at least 8 digits
    const phoneDigits = newRes.phone.replace(/[^0-9]/g, '');
    if (phoneDigits.length < 8) {
      alert('Phone number must contain at least 8 digits');
      return;
    }

    // Validation: Check guests is valid
    const guestNum = Number(newRes.guests);
    if (guestNum < 1 || guestNum > 12 || isNaN(guestNum)) {
      alert('Please select a valid number of guests (1-12)');
      return;
    }

    // Validation: Check date is not in the past
    const selectedDateObj = new Date(newRes.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDateObj < today) {
      alert('Please select a future date for the booking');
      return;
    }

    const selectedCourse = courses.find(c => c.id === newRes.courseId);

    // Validation: Check capacity not exceeded
    if (selectedCourse && guestNum > selectedCourse.maxCapacity) {
      alert(`Max capacity for this course is ${selectedCourse.maxCapacity} guests. You selected ${guestNum}.`);
      return;
    }
    
    // Safe price parsing
    let unitPrice = 45;
    if (selectedCourse?.priceNumber && !isNaN(selectedCourse.priceNumber) && selectedCourse.priceNumber > 0) {
      unitPrice = selectedCourse.priceNumber;
    } else if (selectedCourse?.price) {
      const parsed = parseInt(selectedCourse.price.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsed) && parsed > 0) {
        unitPrice = parsed;
      }
    }
    
    const totalPrice = unitPrice * guestNum;

    addReservation({
      studentName: newRes.studentName.trim(),
      email: newRes.email.trim(),
      phone: newRes.phone.trim(),
      courseId: newRes.courseId,
      courseTitle: selectedCourse?.title || 'Cooking Class',
      date: newRes.date,
      time: newRes.time,
      guests: guestNum,
      totalPrice,
      currency: 'EUR',
      status: newRes.status,
      paymentStatus: newRes.paymentStatus,
      notes: (newRes.notes || '').trim(),
      dietaryRestrictions: (newRes.dietaryRestrictions || '').trim()
    });

    setShowAddResModal(false);
    setNewRes({
      studentName: '',
      email: '',
      phone: '',
      courseId: courses[0]?.id || 'cooking-course',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: courses[0]?.timeSlot || '10:00 - 12:30',
      guests: 2,
      status: 'confirmed',
      paymentStatus: 'on_arrival',
      notes: '',
      dietaryRestrictions: ''
    });
  };

  const generateWhatsAppLink = (res: Reservation) => {
    const cleanPhone = res.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello ${res.studentName}! This is Cátia from Catia Cooking Mindelo 🇨🇻. Reaching out regarding your cooking class "${res.courseTitle}" booked for ${res.date} at ${res.time} (${res.guests} ${res.guests > 1 ? 'guests' : 'guest'}). We are so excited to welcome you to our kitchen in Fonte Francês!`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  // Status Badge Helper
  const getStatusBadge = (status: Reservation['status']) => {
    if (isConfirmed(status)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle size={12} />
          Confirmed
        </span>
      );
    }
    if (isPending(status)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <Clock size={12} />
          Pending
        </span>
      );
    }
    if (isCompleted(status)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
          <CheckCircle size={12} />
          Completed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
        <XCircle size={12} />
        Cancelled
      </span>
    );
  };

  // Payment Badge Helper
  const getPaymentLabel = (paymentStatus: Reservation['paymentStatus']) => {
    if (paymentStatus === 'paid' || paymentStatus === 'pago') return 'Paid';
    if (paymentStatus === 'pending' || paymentStatus === 'pendente') return 'Pending';
    return 'On Arrival';
  };

  // -------------------------------------------------------------
  // LOGIN SCREEN
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2240] via-[#0A3D78] to-[#0A2240] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-blue-100 text-center relative overflow-hidden">
          
          {/* Top Decorative Coastal Stroke */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-mindelo-blue via-mindelo-red to-mindelo-gold"></div>

          <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-mindelo-blue shadow-lg bg-white">
            <Image 
              src="/logo.png" 
              alt="Logo Catia Cooking Mindelo" 
              fill
              className="object-cover"
              priority
              referrerPolicy="no-referrer"
            />
          </div>

          <h1 className="text-2xl font-serif font-black text-[#0A2240] mb-1">
            Cátia&apos;s Dashboard
          </h1>
          <p className="text-xs text-gray-500 mb-6 uppercase tracking-wider font-semibold">
            Catia Cooking Mindelo · Management
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 text-left">
                Security PIN Code
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter PIN (e.g. 1234)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-mindelo-blue focus:border-transparent text-center text-lg font-mono tracking-widest"
                  autoFocus
                />
              </div>
            </div>

            {authError && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-[#0A3D78] hover:bg-mindelo-blue text-white py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <ShieldCheck size={18} />
              <span>Enter Dashboard</span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-3">
            <Link 
              href="/"
              className="text-xs text-gray-500 hover:text-gray-800 inline-flex items-center justify-center gap-1"
            >
              <ArrowLeft size={13} />
              <span>Back to Main Website</span>
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Admin Navigation Bar */}
      <header className="bg-[#0A2240] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand & Badge */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-xs bg-white">
              <Image 
                src="/logo.png" 
                alt="Catia Cooking Mindelo" 
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-lg text-white">
                  Cátia Cooking Mindelo
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-mindelo-gold text-[#0A2240] uppercase">
                  Admin
                </span>
              </div>
              <span className="text-[11px] text-blue-200 hidden sm:block">
                Fonte Francês · Mindelo, São Vicente 🇨🇻
              </span>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-white/10 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-white text-[#0A2240] shadow-xs' 
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors relative ${
                activeTab === 'reservations' 
                  ? 'bg-white text-[#0A2240] shadow-xs' 
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              Bookings
              {pendingReservations.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-[#0A2240]">
                  {pendingReservations.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'courses' 
                  ? 'bg-white text-[#0A2240] shadow-xs' 
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              Courses & Classes ({courses.length})
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors relative ${
                activeTab === 'messages' 
                  ? 'bg-white text-[#0A2240] shadow-xs' 
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              Messages
              {unreadMessagesCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white animate-pulse">
                  {unreadMessagesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'calendar' 
                  ? 'bg-white text-[#0A2240] shadow-xs' 
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              Calendar
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-blue-200 hover:text-white hidden sm:flex items-center gap-1 py-1.5 px-2.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span>View Site</span>
              <ExternalLink size={12} />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut size={18} />
            </button>
          </div>

        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden flex overflow-x-auto border-t border-blue-900/60 px-2 py-2 gap-1 bg-[#0A2240]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-white text-[#0A2240]' : 'text-blue-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'reservations' ? 'bg-white text-[#0A2240]' : 'text-blue-100'
            }`}
          >
            Bookings ({reservations.length})
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'courses' ? 'bg-white text-[#0A2240]' : 'text-blue-100'
            }`}
          >
            Courses ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'messages' ? 'bg-white text-[#0A2240]' : 'text-blue-100'
            }`}
          >
            Messages ({unreadMessagesCount})
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'calendar' ? 'bg-white text-[#0A2240]' : 'text-blue-100'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'gallery' ? 'bg-white text-[#0A2240]' : 'text-blue-100'
            }`}
          >
            Gallery
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'content' ? 'bg-white text-[#0A2240]' : 'text-blue-100'
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'settings' ? 'bg-white text-[#0A2240]' : 'text-blue-100'
            }`}
          >
            Settings
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ============================================================ */}
        {/* TAB 1: OVERVIEW (DASHBOARD OVERVIEW)                         */}
        {/* ============================================================ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-[#0A3D78] via-[#0A2240] to-[#0A3D78] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 z-10 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold">
                  <span>Hello Cátia, morabeza! 👋</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-black">
                  Kitchen Management Dashboard
                </h2>
                <p className="text-blue-100/90 text-sm leading-relaxed">
                  Manage student bookings, class schedules, course catalog offerings, and incoming messages from visitors in Mindelo.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 z-10">
                <button
                  onClick={() => setShowAddResModal(true)}
                  className="bg-mindelo-red hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>New Manual Booking</span>
                </button>
                <button
                  onClick={() => setActiveTab('reservations')}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border border-white/20 flex items-center gap-2"
                >
                  <span>View All Bookings</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Background watermark */}
              <div className="absolute -right-8 -bottom-8 w-60 h-60 opacity-10 pointer-events-none">
                <Image src="/logo.png" alt="Logo Watermark" fill className="object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Total Bookings
                  </span>
                  <div className="text-3xl font-serif font-black text-slate-900">
                    {totalReservations}
                  </div>
                  <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">
                    {confirmedReservations.length} confirmed
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-mindelo-blue flex items-center justify-center">
                  <Calendar size={24} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Confirmed Students
                  </span>
                  <div className="text-3xl font-serif font-black text-slate-900">
                    {totalGuests}
                  </div>
                  <span className="text-xs text-slate-500 font-medium mt-1 inline-block">
                    Expected this month
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users size={24} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Estimated Revenue
                  </span>
                  <div className="text-3xl font-serif font-black text-slate-900">
                    €{totalRevenueEUR}
                  </div>
                  <span className="text-xs text-slate-500 font-medium mt-1 inline-block">
                    ≈ {totalRevenueCVE.toLocaleString()} CVE
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <DollarSign size={24} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Messages & Inquiries
                  </span>
                  <div className="text-3xl font-serif font-black text-slate-900">
                    {messages.length}
                  </div>
                  <span className={`text-xs font-medium mt-1 inline-block ${unreadMessagesCount > 0 ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                    {unreadMessagesCount} unread
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <MessageSquare size={24} />
                </div>
              </div>

            </div>

            {/* Two Column Layout: Upcoming Classes + Quick Course Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Upcoming Classes List (2 cols) */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-slate-900">
                      Upcoming Scheduled Classes
                    </h3>
                    <p className="text-xs text-slate-500">
                      Chronological list of enrolled students and scheduled workshops
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('reservations')}
                    className="text-xs font-bold text-mindelo-blue hover:underline"
                  >
                    View All →
                  </button>
                </div>

                {upcomingReservations.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm">
                    No bookings scheduled at this moment.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {upcomingReservations.map((res) => (
                      <div key={res.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 p-2 rounded-xl transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {res.studentName}
                            </span>
                            {getStatusBadge(res.status)}
                          </div>
                          <p className="text-xs font-medium text-mindelo-blue">
                            {res.courseTitle} · {res.guests} {res.guests > 1 ? 'guests' : 'guest'}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {res.date} ({res.time})
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign size={12} />
                              €{res.totalPrice} ({getPaymentLabel(res.paymentStatus)})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <a
                            href={generateWhatsAppLink(res)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors"
                            title="Chat with student on WhatsApp"
                          >
                            <Phone size={13} />
                            <span>WhatsApp</span>
                          </a>
                          <button
                            onClick={() => setSelectedReservation(res)}
                            className="p-1.5 text-slate-400 hover:text-mindelo-blue hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Courses & School Quick Info (1 col) */}
              <div className="space-y-6">
                
                {/* Popular Courses in School */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif font-bold text-base text-slate-900">
                      Catalog Courses
                    </h3>
                    <button
                      onClick={() => setActiveTab('courses')}
                      className="text-xs text-mindelo-blue font-bold hover:underline"
                    >
                      Manage
                    </button>
                  </div>

                  <div className="space-y-3">
                    {courses.slice(0, 4).map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="truncate pr-2">
                          <h4 className="font-bold text-xs text-slate-800 truncate">
                            {c.title}
                          </h4>
                          <span className="text-[11px] text-slate-500">
                            {c.duration} · Max {c.maxCapacity} guests
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-mindelo-dark block">
                            {c.price}
                          </span>
                          <span className={`text-[10px] font-bold ${c.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {c.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: BOOKINGS MANAGEMENT                                   */}
        {/* ============================================================ */}
        {activeTab === 'reservations' && (
          <div className="space-y-6">
            
            {/* Header with Search and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div>
                <h2 className="font-serif font-black text-xl text-slate-900">
                  Bookings Management ({filteredReservations.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Track student enrollments, status confirmations, and direct communication via WhatsApp
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={exportReservationsCSV}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Export to CSV Spreadsheet"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Print student roster"
                >
                  <Printer size={14} />
                  <span className="hidden sm:inline">Print Roster</span>
                </button>

                <button
                  onClick={() => setShowAddResModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#0A3D78] hover:bg-mindelo-blue text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus size={15} />
                  <span>New Manual Booking</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              
              {/* Search input */}
              <div className="sm:col-span-8 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by student name, email, phone, or course..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-mindelo-blue text-sm"
                />
              </div>

              {/* Status filter dropdown */}
              <div className="sm:col-span-4 relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-mindelo-blue text-sm font-medium text-slate-700 appearance-none pr-8 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending ({reservations.filter(r => isPending(r.status)).length})</option>
                  <option value="confirmed">Confirmed ({reservations.filter(r => isConfirmed(r.status)).length})</option>
                  <option value="completed">Completed ({reservations.filter(r => isCompleted(r.status)).length})</option>
                  <option value="cancelled">Cancelled ({reservations.filter(r => isCancelled(r.status)).length})</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>

            </div>

            {/* Reservations Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-4">Class / Course</th>
                      <th className="py-3.5 px-4">Date & Schedule</th>
                      <th className="py-3.5 px-4">Guests</th>
                      <th className="py-3.5 px-4">Total</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReservations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400">
                          No bookings found matching the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredReservations.map((res) => (
                        <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{res.studentName}</div>
                            <div className="text-xs text-slate-400">{res.email}</div>
                            <div className="text-xs text-slate-500 font-mono">{res.phone}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800 block">{res.courseTitle}</span>
                            {res.dietaryRestrictions && (
                              <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                                {res.dietaryRestrictions}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-800">{res.date}</div>
                            <div className="text-xs text-slate-500">{res.time}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800">
                                {res.guests} {res.guests > 1 ? 'guests' : 'guest'}
                              </span>
                              {(() => {
                                const course = courses.find(c => c.id === res.courseId);
                                if (course && res.guests > course.maxCapacity) {
                                  return (
                                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 whitespace-nowrap">
                                      <XCircle size={12} />
                                      {res.guests}/{course.maxCapacity} OVER
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">€{res.totalPrice}</div>
                            <button
                              onClick={() => {
                                const nextStatus = (res.paymentStatus === 'paid' || res.paymentStatus === 'pago') ? 'on_arrival' : 'paid';
                                updateReservationPayment(res.id, nextStatus);
                              }}
                              className={`text-[10px] font-bold uppercase rounded px-1.5 py-0.5 border transition-colors ${
                                (res.paymentStatus === 'paid' || res.paymentStatus === 'pago')
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                              title="Click to toggle payment status"
                            >
                              {getPaymentLabel(res.paymentStatus)}
                            </button>
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={isConfirmed(res.status) ? 'confirmed' : isPending(res.status) ? 'pending' : isCompleted(res.status) ? 'completed' : 'cancelled'}
                              onChange={(e) => updateReservationStatus(res.id, e.target.value as Reservation['status'])}
                              className="text-xs font-bold rounded-lg border border-slate-200 px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-mindelo-blue"
                            >
                              <option value="pending">⏳ Pending</option>
                              <option value="confirmed">✅ Confirmed</option>
                              <option value="completed">🎉 Completed</option>
                              <option value="cancelled">❌ Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={generateWhatsAppLink(res)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                                title="Send WhatsApp message to student"
                              >
                                <Phone size={15} />
                              </a>
                              <button
                                onClick={() => setSelectedReservation(res)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-mindelo-blue hover:bg-slate-100 transition-colors"
                                title="View Full Details"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => setEditingReservation(res)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                title="Edit Booking"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to remove the booking for ${res.studentName}?`)) {
                                    deleteReservation(res.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete Booking"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: COURSE CATALOG MANAGEMENT                             */}
        {/* ============================================================ */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div>
                <h2 className="font-serif font-black text-xl text-slate-900">
                  Cooking Classes & Workshops ({courses.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Add new dishes, update pricing, student capacity, and class schedules
                </p>
              </div>

              <button
                onClick={() => setShowAddCourseModal(true)}
                className="px-4 py-2 rounded-xl bg-[#0A3D78] hover:bg-mindelo-blue text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs self-start sm:self-auto"
              >
                <Plus size={15} />
                <span>Add New Course</span>
              </button>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col">
                  
                  {/* Image & Badges */}
                  <div className="relative h-44 w-full bg-slate-100">
                    <Image 
                      src={course.image} 
                      alt={course.title}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#0A2240] text-white shadow-xs">
                        {course.price}
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-serif font-bold text-base text-slate-900 leading-tight">
                          {course.title}
                        </h3>
                        <button
                          onClick={() => toggleCourseActive(course.id)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                            course.active 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {course.active ? 'Active' : 'Paused'}
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                        {course.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4 bg-slate-50 p-2.5 rounded-xl">
                        <div>
                          <span className="block text-[10px] uppercase text-slate-400 font-bold">Duration</span>
                          <span className="font-semibold text-slate-700">{course.duration}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase text-slate-400 font-bold">Capacity</span>
                          <span className="font-semibold text-slate-700">Max {course.maxCapacity} guests</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <button
                        onClick={() => setEditingCourse(course)}
                        className="text-xs font-bold text-mindelo-blue hover:underline inline-flex items-center gap-1"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete the course "${course.title}"?`)) {
                            deleteCourse(course.id);
                          }
                        }}
                        className="text-xs text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Delete Course"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: MESSAGES INBOX                                        */}
        {/* ============================================================ */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div>
                <h2 className="font-serif font-black text-xl text-slate-900">
                  Messages & Inquiries ({messages.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Questions submitted via the contact form on your website
                </p>
              </div>

              {unreadMessagesCount > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                  {unreadMessagesCount} unread message(s)
                </span>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {messages.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  No messages received so far.
                </div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`p-5 transition-colors ${!msg.read ? 'bg-blue-50/40' : 'hover:bg-slate-50/50'}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {!msg.read && (
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
                        )}
                        <h4 className="font-bold text-slate-900 text-sm">
                          {msg.name}
                        </h4>
                        <span className="text-xs text-slate-400">· {msg.email}</span>
                      </div>

                      <span className="text-xs text-slate-400">
                        {new Date(msg.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {msg.subject && (
                      <h5 className="font-semibold text-xs text-mindelo-dark mb-1">
                        Subject: {msg.subject}
                      </h5>
                    )}

                    <p className="text-xs text-slate-600 leading-relaxed mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {msg.message}
                    </p>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${msg.email}?subject=Reply: Catia Cooking Mindelo`}
                          onClick={() => markMessageRead(msg.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#0A3D78] hover:bg-mindelo-blue text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Mail size={13} />
                          <span>Reply via Email</span>
                        </a>

                        {msg.phone && (
                          <a
                            href={`https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${msg.name}! This is Cátia from Catia Cooking Mindelo replying to your message...`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => markMessageRead(msg.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                          >
                            <Phone size={13} />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!msg.read && (
                          <button
                            onClick={() => markMessageRead(msg.id)}
                            className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                          >
                            Mark as Read
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('Delete this message?')) deleteMessage(msg.id);
                          }}
                          className="text-slate-400 hover:text-red-600 p-1"
                          title="Delete Message"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: CALENDAR & DATE BLOCKING                              */}
        {/* ============================================================ */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <h2 className="font-serif font-black text-xl text-slate-900 mb-1">
                Availability & Date Blocking
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Click on any date to block or unblock new enrollments (e.g. municipal holidays, cultural events, or family rest days)
              </p>

              {/* Sample date blocking grid for upcoming dates */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-xs">
                {Array.from({ length: 14 }).map((_, i) => {
                  const day = new Date();
                  day.setDate(day.getDate() + i);
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const isBlocked = blockedDates.includes(dateStr);
                  const dayReservations = reservations.filter(r => r.date === dateStr && !isCancelled(r.status));
                  const studentCount = dayReservations.reduce((acc, r) => acc + r.guests, 0);

                  return (
                    <div
                      key={dateStr}
                      onClick={() => toggleBlockedDate(dateStr)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                        isBlocked 
                          ? 'bg-rose-50 border-rose-200 text-rose-800' 
                          : dayReservations.length > 0
                            ? 'bg-blue-50/70 border-blue-200 text-slate-800'
                            : 'bg-white border-slate-200 hover:border-mindelo-blue'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs">
                          {format(day, 'MMM d', { locale: enUS })}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {format(day, 'EEE', { locale: enUS })}
                        </span>
                      </div>

                      {isBlocked ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600">
                          <CalendarX size={10} />
                          Blocked
                        </span>
                      ) : studentCount > 0 ? (
                        <div className="text-[11px] font-bold text-mindelo-blue">
                          {studentCount} student(s)
                        </div>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-medium">
                          Available
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span>Available for bookings</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-mindelo-blue"></span>
                  <span>With enrolled students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                  <span>Date blocked by Cátia</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: GALLERY MANAGEMENT                                   */}
        {/* ============================================================ */}
        {activeTab === 'gallery' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <AdminGalleryManager />
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 7: CONTENT EDITOR (FAQ, TESTIMONIALS, ETC)               */}
        {/* ============================================================ */}
        {activeTab === 'content' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <ContentEditor category="faq" title="FAQ Management" />
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <ContentEditor category="testimonial" title="Testimonials" />
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <ContentEditor category="hero" title="Hero Section" />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 8: SETTINGS (LOGO, BRANDING, ETC)                        */}
        {/* ============================================================ */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <LogoUploadManager currentLogoUrl="/logo.png" />
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-mindelo-dark">Site Information</h2>
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Site Title</label>
                      <input type="text" value={siteInfo.site_title} onChange={(e) => setSiteInfo({ ...siteInfo, site_title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Site Email</label>
                      <input type="email" value={siteInfo.site_email} onChange={(e) => setSiteInfo({ ...siteInfo, site_email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Number</label>
                      <input type="tel" value={siteInfo.site_whatsapp} onChange={(e) => setSiteInfo({ ...siteInfo, site_whatsapp: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                      <input type="text" value={siteInfo.site_location} onChange={(e) => setSiteInfo({ ...siteInfo, site_location: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  </div>
                  {settingsMsg && (
                    <p className={`text-sm font-semibold ${settingsMsg.type === 'ok' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {settingsMsg.text}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={settingsSaving}
                    className="px-6 py-2 bg-mindelo-blue hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {settingsSaving ? 'Saving...' : 'Save Settings'}
                  </button>
                </form>
              </div>
            </div>

            {/* Change Admin PIN */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-mindelo-dark">Change Admin PIN</h2>
                <p className="text-sm text-gray-500">
                  Update the code used to enter this admin panel. Minimum 4 characters.
                </p>
                <form onSubmit={handleChangePin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current PIN</label>
                    <input
                      type="password"
                      value={pinCurrent}
                      onChange={(e) => setPinCurrent(e.target.value)}
                      placeholder="Current PIN"
                      autoComplete="off"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mindelo-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">New PIN</label>
                    <input
                      type="password"
                      value={pinNew}
                      onChange={(e) => setPinNew(e.target.value)}
                      placeholder="New PIN (min. 4 characters)"
                      autoComplete="new-password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mindelo-blue"
                    />
                  </div>
                  {pinMessage && (
                    <p className={`text-sm font-semibold ${pinMessage.type === 'ok' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {pinMessage.text}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={pinSaving || !pinCurrent || pinNew.length < 4}
                    className="px-6 py-2 bg-mindelo-blue hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {pinSaving ? 'Saving...' : 'Update PIN'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ============================================================ */}
      {/* MODAL: NEW MANUAL BOOKING                                    */}
      {/* ============================================================ */}
      {showAddResModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif font-black text-xl text-slate-900 mb-1">
              Add Manual Booking
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Record students who phoned in, contacted via WhatsApp, or registered in person
            </p>

            <form onSubmit={handleCreateReservation} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Student Name *</label>
                <input
                  type="text"
                  required
                  value={newRes.studentName}
                  onChange={(e) => setNewRes({ ...newRes, studentName: e.target.value })}
                  placeholder="e.g. Maria Johnson"
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-mindelo-blue text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newRes.email}
                    onChange={(e) => setNewRes({ ...newRes, email: e.target.value })}
                    placeholder="student@email.com"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-mindelo-blue text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={newRes.phone}
                    onChange={(e) => setNewRes({ ...newRes, phone: e.target.value })}
                    placeholder="+238 9912345"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-mindelo-blue text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Course *</label>
                <select
                  value={newRes.courseId}
                  onChange={(e) => setNewRes({ ...newRes, courseId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-mindelo-blue text-sm"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newRes.date}
                    onChange={(e) => setNewRes({ ...newRes, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Schedule *</label>
                  <input
                    type="text"
                    required
                    value={newRes.time}
                    onChange={(e) => setNewRes({ ...newRes, time: e.target.value })}
                    placeholder="10:00 - 12:30"
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Guests *</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={newRes.guests}
                    onChange={(e) => setNewRes({ ...newRes, guests: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={newRes.status}
                    onChange={(e) => setNewRes({ ...newRes, status: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment</label>
                  <select
                    value={newRes.paymentStatus}
                    onChange={(e) => setNewRes({ ...newRes, paymentStatus: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  >
                    <option value="on_arrival">On Arrival (Cash/Card)</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dietary Restrictions / Allergies</label>
                <input
                  type="text"
                  value={newRes.dietaryRestrictions}
                  onChange={(e) => setNewRes({ ...newRes, dietaryRestrictions: e.target.value })}
                  placeholder="e.g. Vegetarian, shellfish allergy..."
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Notes</label>
                <textarea
                  value={newRes.notes}
                  onChange={(e) => setNewRes({ ...newRes, notes: e.target.value })}
                  placeholder="Notes for Cátia..."
                  rows={2}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddResModal(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0A3D78] hover:bg-mindelo-blue text-white font-bold"
                >
                  Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: VIEW BOOKING DETAILS                                  */}
      {/* ============================================================ */}
      {selectedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Booking #{selectedReservation.id}</span>
                <h3 className="font-serif font-black text-xl text-slate-900">
                  {selectedReservation.studentName}
                </h3>
              </div>
              {getStatusBadge(selectedReservation.status)}
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Course</span>
                <span className="font-bold text-sm text-mindelo-dark">{selectedReservation.courseTitle}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Date & Schedule</span>
                  <span className="font-semibold">{selectedReservation.date}</span>
                  <div className="text-slate-500">{selectedReservation.time}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Guests & Price</span>
                  <span className="font-semibold">{selectedReservation.guests} guest(s)</span>
                  <div className="font-bold text-emerald-700">€{selectedReservation.totalPrice} ({getPaymentLabel(selectedReservation.paymentStatus)})</div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Contact</span>
                <div>Email: <a href={`mailto:${selectedReservation.email}`} className="text-mindelo-blue underline">{selectedReservation.email}</a></div>
                <div>Phone: <a href={`tel:${selectedReservation.phone}`} className="text-mindelo-blue font-mono">{selectedReservation.phone}</a></div>
              </div>

              {selectedReservation.dietaryRestrictions && (
                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  <span className="text-amber-800 font-bold block text-[10px] uppercase">Dietary Restrictions</span>
                  <span className="text-amber-950">{selectedReservation.dietaryRestrictions}</span>
                </div>
              )}

              {selectedReservation.notes && (
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Notes</span>
                  <span>{selectedReservation.notes}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-6 border-t border-slate-100 mt-6">
              <div className="flex items-center gap-2">
                <a
                  href={generateWhatsAppLink(selectedReservation)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Phone size={14} />
                  <span>WhatsApp</span>
                </a>

                <button
                  onClick={() => {
                    const target = selectedReservation;
                    setSelectedReservation(null);
                    setEditingReservation(target);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#0A3D78] hover:bg-mindelo-blue text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Edit3 size={14} />
                  <span>Edit Booking</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedReservation(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: EDIT EXISTING BOOKING                                 */}
      {/* ============================================================ */}
      {editingReservation && (
        <EditReservationModal
          reservation={editingReservation}
          courses={courses}
          onClose={() => setEditingReservation(null)}
          onSave={(updates) => {
            updateReservation(editingReservation.id, updates);
            setEditingReservation(null);
          }}
        />
      )}

      {/* ============================================================ */}
      {/* MODAL: EDIT OR CREATE COURSE                                 */}
      {/* ============================================================ */}
      {(showAddCourseModal || editingCourse) && (
        <CourseFormModal 
          course={editingCourse}
          onClose={() => {
            setShowAddCourseModal(false);
            setEditingCourse(null);
          }}
          onSave={(courseData) => {
            if (editingCourse) {
              updateCourse(editingCourse.id, courseData);
            } else {
              addCourse(courseData as any);
            }
            setShowAddCourseModal(false);
            setEditingCourse(null);
          }}
        />
      )}

    </div>
  );
}

// Modal Component to Edit Reservation
function EditReservationModal({
  reservation,
  courses,
  onClose,
  onSave
}: {
  reservation: Reservation;
  courses: Course[];
  onClose: () => void;
  onSave: (updates: Partial<Reservation>) => void;
}) {
  const [studentName, setStudentName] = useState(reservation.studentName);
  const [email, setEmail] = useState(reservation.email);
  const [phone, setPhone] = useState(reservation.phone);
  const [courseId, setCourseId] = useState(reservation.courseId);
  const [date, setDate] = useState(reservation.date);
  const [time, setTime] = useState(reservation.time);
  const [guests, setGuests] = useState(reservation.guests);
  const [totalPrice, setTotalPrice] = useState(reservation.totalPrice);
  const [status, setStatus] = useState<Reservation['status']>(reservation.status);
  const [paymentStatus, setPaymentStatus] = useState<Reservation['paymentStatus']>(reservation.paymentStatus);
  const [dietaryRestrictions, setDietaryRestrictions] = useState(reservation.dietaryRestrictions || '');
  const [notes, setNotes] = useState(reservation.notes || '');

  const handleCourseChange = (newCourseId: string) => {
    setCourseId(newCourseId);
    const found = courses.find(c => c.id === newCourseId);
    if (found) {
      if (found.timeSlot) setTime(found.timeSlot);
      
      // Safe price parsing
      let unit = 45;
      if (found.priceNumber && !isNaN(found.priceNumber) && found.priceNumber > 0) {
        unit = found.priceNumber;
      } else if (found.price) {
        const parsed = parseInt(found.price.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(parsed) && parsed > 0) {
          unit = parsed;
        }
      }
      
      setTotalPrice(unit * guests);
    }
  };

  const handleGuestsChange = (newGuests: number) => {
    setGuests(newGuests);
    const found = courses.find(c => c.id === courseId);
    
    // Safe price parsing
    let unit = 45;
    if (found?.priceNumber && !isNaN(found.priceNumber) && found.priceNumber > 0) {
      unit = found.priceNumber;
    } else if (found?.price) {
      const parsed = parseInt(found.price.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsed) && parsed > 0) {
        unit = parsed;
      }
    }
    
    setTotalPrice(unit * newGuests);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: Check required fields
    if (!studentName.trim() || !email.trim() || !phone.trim()) {
      alert('Please fill in all required fields: Name, Email, and Phone');
      return;
    }

    // Validation: Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      alert('Please enter a valid email address');
      return;
    }

    // Validation: Check phone has at least 8 digits
    const phoneDigits = phone.replace(/[^0-9]/g, '');
    if (phoneDigits.length < 8) {
      alert('Phone number must contain at least 8 digits');
      return;
    }

    // Validation: Check date is not in the past
    const selectedDateObj = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDateObj < today) {
      alert('Please select a future date for the booking');
      return;
    }

    // Validation: Check guests is valid
    const guestNum = Number(guests);
    if (guestNum < 1 || guestNum > 12 || isNaN(guestNum)) {
      alert('Please select a valid number of guests (1-12)');
      return;
    }

    // Validation: Check capacity not exceeded
    const selectedCourseObj = courses.find(c => c.id === courseId);
    if (selectedCourseObj && guestNum > selectedCourseObj.maxCapacity) {
      alert(`Max capacity for this course is ${selectedCourseObj.maxCapacity} guests. You selected ${guestNum}.`);
      return;
    }

    // Validation: Check totalPrice is positive
    const priceNum = Number(totalPrice);
    if (priceNum <= 0 || isNaN(priceNum)) {
      alert('Total price must be greater than 0');
      return;
    }

    const selectedCourse = courses.find(c => c.id === courseId);
    onSave({
      studentName: studentName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      courseId,
      courseTitle: selectedCourse ? selectedCourse.title : reservation.courseTitle,
      date,
      time,
      guests: guestNum,
      totalPrice: priceNum,
      status,
      paymentStatus,
      dietaryRestrictions: (dietaryRestrictions || '').trim(),
      notes: (notes || '').trim(),
    });
  };

  const dietaryPresets = ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'No Seafood', 'Nut Allergy'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl my-8 border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-mindelo-blue bg-blue-50 px-2.5 py-0.5 rounded-full inline-block mb-1">
              Editing Booking #{reservation.id}
            </span>
            <h3 className="font-serif font-black text-xl text-slate-900">
              Edit Booking Details
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Student Name *</label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-mindelo-blue text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-mindelo-blue text-sm"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone / WhatsApp *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-mindelo-blue text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Cooking Class *</label>
            <select
              value={courseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-mindelo-blue text-sm font-medium"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.price} / guest)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Class Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Schedule *</label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="10:00 - 12:30"
                className="w-full px-3 py-2 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Guests *</label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={guests}
                onChange={(e) => handleGuestsChange(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl text-sm font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Price (€)</label>
              <input
                type="number"
                min="0"
                required
                value={totalPrice}
                onChange={(e) => setTotalPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl text-sm font-bold text-emerald-700"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-xl text-sm font-semibold"
              >
                <option value="pending">⏳ Pending</option>
                <option value="confirmed">✅ Confirmed</option>
                <option value="completed">🎉 Completed</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-xl text-sm font-semibold"
              >
                <option value="on_arrival">On Arrival</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Dietary Restrictions / Allergies</label>
            <input
              type="text"
              value={dietaryRestrictions}
              onChange={(e) => setDietaryRestrictions(e.target.value)}
              placeholder="e.g. Vegetarian, Gluten-Free..."
              className="w-full px-3 py-2 border rounded-xl text-sm mb-1.5"
            />
            <div className="flex flex-wrap gap-1.5">
              {dietaryPresets.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setDietaryRestrictions(opt === 'None' ? '' : opt)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-colors ${
                    dietaryRestrictions === opt 
                      ? 'bg-amber-100 border-amber-300 text-amber-900' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Internal Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Special instructions or prep notes..."
              className="w-full px-3 py-2 border rounded-xl text-sm resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0A3D78] hover:bg-mindelo-blue text-white font-bold shadow-xs transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Upgraded Modal Component for Adding and Editing Courses
function CourseFormModal({ 
  course, 
  onClose, 
  onSave 
}: { 
  course: Course | null; 
  onClose: () => void; 
  onSave: (data: Partial<Course>) => void; 
}) {
  const [title, setTitle] = useState(course?.title || '');
  const [description, setDescription] = useState(course?.description || '');
  const [image, setImage] = useState(course?.image || 'https://static.wixstatic.com/media/f4fd80_ec9272a13451476a845b928470b355eb~mv2.jpg');
  const [duration, setDuration] = useState(course?.duration || '2h 30min');
  const [maxCapacity, setMaxCapacity] = useState(course?.maxCapacity || 8);
  const [priceNumber, setPriceNumber] = useState(course?.priceNumber || 45);
  const [active, setActive] = useState(course ? course.active : true);
  const [timeSlot, setTimeSlot] = useState(course?.timeSlot || '10:00 - 12:30');
  
  // Dynamic list of includes
  const [includes, setIncludes] = useState<string[]>(
    course?.includes && course.includes.length > 0 
      ? course.includes 
      : [
          'Mindelo Municipal Market & Fish Market guided tour',
          'Traditional collective transport to Fonte Francês',
          'Hands-on cooking class with Chef Cátia',
          'Convivial sit-down lunch with drinks & grogue tasting',
          'Printed souvenir recipe booklet'
        ]
  );
  const [newIncludeText, setNewIncludeText] = useState('');


  const handleAddInclude = () => {
    if (newIncludeText.trim()) {
      setIncludes([...includes, newIncludeText.trim()]);
      setNewIncludeText('');
    }
  };

  const handleRemoveInclude = (idx: number) => {
    setIncludes(includes.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: Check required fields
    if (!title.trim() || !description.trim()) {
      alert('Please fill in all required fields: Title and Description');
      return;
    }

    // Validation: Check price is positive
    const priceNum = Number(priceNumber);
    if (priceNum <= 0 || isNaN(priceNum)) {
      alert('Price must be greater than 0');
      return;
    }

    // Validation: Check capacity is valid
    const capacityNum = Number(maxCapacity);
    if (capacityNum < 1 || capacityNum > 20 || isNaN(capacityNum)) {
      alert('Maximum capacity must be between 1 and 20');
      return;
    }

    // Validation: Check includes are not empty
    if (includes.length === 0) {
      alert('Please add at least one item to the "Includes" list');
      return;
    }

    // Validation: Check image URL format
    if (!image.trim().startsWith('http')) {
      alert('Image must be a valid HTTP URL');
      return;
    }

    // Validation: Check duration format
    if (!duration.trim()) {
      alert('Please enter a duration (e.g. "2h 30min")');
      return;
    }

    // Validation: Check timeSlot format
    if (!timeSlot.trim() || !timeSlot.includes('-')) {
      alert('Please enter a valid time slot (e.g. "10:00 - 12:30")');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      image: image.trim(),
      duration: duration.trim(),
      timeSlot: timeSlot.trim(),
      maxCapacity: capacityNum,
      priceNumber: priceNum,
      price: `€${priceNum}`,
      active,
      includes: includes.map(inc => inc.trim()).filter(inc => inc.length > 0)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl my-8 border border-slate-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#0A3D78] bg-blue-50 px-2.5 py-0.5 rounded-full inline-block mb-1">
              {course ? 'Course Editor' : 'New Cooking Class'}
            </span>
            <h3 className="font-serif font-black text-xl text-slate-900">
              {course ? 'Edit Cooking Class' : 'Create New Cooking Class'}
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Class Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Traditional Creole Cooking & Markets Tour"
              className="w-full px-3 py-2 border rounded-xl text-sm font-semibold focus:ring-2 focus:ring-mindelo-blue"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Description *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the market visit, recipes, Cape Verdean ingredients, and the home kitchen experience..."
              className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-mindelo-blue resize-none"
            />
          </div>

          {/* Photo Upload for Own Photos */}
          <div>
            <label className="block font-bold text-slate-700 mb-2">📸 Upload Course Photo</label>
            <p className="text-xs text-slate-600 mb-2">Upload your own photos. You can replace or delete anytime.</p>
            <CoursePhotoUpload
              courseId={course?.id || 'new-course'}
              courseName={title || 'Untitled Course'}
              currentImageUrl={image}
              onImageUpdate={(url) => setImage(url)}
            />
            {/* Hidden input - auto updated by CoursePhotoUpload */}
            <input
              type="hidden"
              required
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Price per Guest (€) *</label>
              <input
                type="number"
                min="10"
                required
                value={priceNumber}
                onChange={(e) => setPriceNumber(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl text-sm font-bold text-mindelo-dark"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Max Guests *</label>
              <input
                type="number"
                min="1"
                max="25"
                required
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Duration *</label>
              <input
                type="text"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="2h 30min"
                className="w-full px-3 py-2 border rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Schedule Slot</label>
              <input
                type="text"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                placeholder="10:00 - 12:30"
                className="w-full px-3 py-2 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status on Site</label>
              <select
                value={active ? 'true' : 'false'}
                onChange={(e) => setActive(e.target.value === 'true')}
                className="w-full px-3 py-2 border rounded-xl text-sm font-semibold"
              >
                <option value="true">Active (Visible)</option>
                <option value="false">Paused (Hidden)</option>
              </select>
            </div>
          </div>

          {/* Included Items Management */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <label className="block font-bold text-slate-700 mb-1">
              What&apos;s Included ({includes.length} items)
            </label>
            <div className="space-y-1.5 mb-2.5 max-h-36 overflow-y-auto pr-1">
              {includes.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs">
                  <span className="text-slate-800 flex-1 truncate">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInclude(idx)}
                    className="text-slate-400 hover:text-red-600 p-0.5 rounded transition-colors"
                    title="Remove item"
                  >
                    <XCircle size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newIncludeText}
                onChange={(e) => setNewIncludeText(e.target.value)}
                placeholder="Add included feature (e.g. Grogue & punch tasting)..."
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInclude();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddInclude}
                className="px-3 py-1.5 bg-[#0A3D78] hover:bg-mindelo-blue text-white font-bold rounded-lg text-xs transition-colors shrink-0 flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Add</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0A3D78] hover:bg-mindelo-blue text-white font-bold shadow-xs transition-colors"
            >
              Save Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
