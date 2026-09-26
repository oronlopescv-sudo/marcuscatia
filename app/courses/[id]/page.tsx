'use client';

import { useState, use, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Image from 'next/image';
import { Clock, Users, MapPin, CheckCircle2, AlertCircle, Minus, Plus, ArrowDown } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format, isPast, isToday, addDays } from 'date-fns';
import 'react-day-picker/dist/style.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useAdminStore } from '@/lib/store';
import { useSiteContent } from '@/lib/useSiteContent';
import { useSiteInfo } from '@/lib/useSiteInfo';
import { whatsappLink } from '@/lib/siteInfo';
import { DEFAULT_MENU, RESTAURANT_DINNER, RESTAURANT_MIN_GUESTS, isRestaurantBooking } from '@/lib/restaurant';

const reservationSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters').trim(),
  email: z.string().email('Invalid email address').trim(),
  phone: z.string()
    .min(8, 'Phone number must have at least 8 digits')
    .regex(/^[\d\s+().-]+$/, 'Phone number contains invalid characters')
    .trim(),
  guests: z.number({ message: 'Enter the number of guests' }).int().min(1, 'Minimum 1 person').max(20, 'Maximum 20 people'),
  notes: z.string().optional(),
});

type ReservationFormValues = z.infer<typeof reservationSchema>;

export default function CourseDetail({ params }: { params: Promise<{ id: string }> }) {
  // Need to unwrap params since Next.js 15
  const unwrappedParams = use(params);
  
  const { courses, addReservation, blockedDates, hydrate } = useAdminStore();
  const site = useSiteInfo();
  const isDinner = isRestaurantBooking(unwrappedParams.id);
  const storedMenu = useSiteContent('restaurant_menu');
  const menuFromAdmin = (storedMenu || []).filter((m) => m.title || m.description);
  const dinnerMenu = menuFromAdmin.length > 0 ? menuFromAdmin : DEFAULT_MENU;
  // Só mostra "a carregar" se o store ainda não tiver cursos (navegação direta).
  // Ao vir da listagem, o store já está hidratado e mostramos o curso de imediato.
  const [loadingCourse, setLoadingCourse] = useState(courses.length === 0 && !isDinner);

  // Carrega os cursos do banco para que links diretos (ex.: partilhados) a um
  // curso funcionem mesmo sem passar pela página de listagem. Sem fallback
  // para cursos "fantasma" hardcoded.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/courses')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : data?.courses;
        if (Array.isArray(list)) {
          hydrate({ courses: list });
        }
      })
      .catch((err) => console.error('Failed to load courses:', err))
      .finally(() => {
        if (!cancelled) setLoadingCourse(false);
      });
    return () => {
      cancelled = true;
    };
  }, [hydrate]);

  // Load blocked dates from the database so admin-blocked days are actually
  // disabled in the booking calendar for visitors.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/blocked-dates')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : data?.blockedDates;
        if (Array.isArray(list)) {
          hydrate({ blockedDates: list });
        }
      })
      .catch((err) => console.error('Failed to load blocked dates:', err));
    return () => {
      cancelled = true;
    };
  }, [hydrate]);
  
  // Encontra o curso apenas no banco (sem fallback hardcoded).
  const course = isDinner ? RESTAURANT_DINNER : courses.find((c) => c.id === unwrappedParams.id);
  const minGuests = isDinner ? RESTAURANT_MIN_GUESTS : 1;
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [dateError, setDateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');
  const [submittedData, setSubmittedData] = useState<{ name: string; date: string; guests: number } | null>(null);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  
  // Rate limit: max 1 submission per 30 seconds
  const RATE_LIMIT_MS = 30000;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      guests: isRestaurantBooking(unwrappedParams.id) ? RESTAURANT_MIN_GUESTS : 1
    }
  });

  const onSubmit = async (data: ReservationFormValues) => {
    if (!course) return;
    // Rate limiting check
    // eslint-disable-next-line react-hooks/purity -- runs in the submit handler, not during render
    const now = Date.now();
    if (now - lastSubmitTime < RATE_LIMIT_MS) {
      setSubmitErrorMessage('Please wait 30 seconds before submitting another booking request.');
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
      return;
    }

    if (!selectedDate) {
      setDateError('Please select a date on the calendar for your class.');
      return;
    }

    if (data.guests < minGuests) {
      setDateError(`Dinner bookings are for groups of at least ${minGuests} guests.`);
      return;
    }

    // FIX #2: Validate capacity
    if (data.guests > course.maxCapacity) {
      setDateError(`Max capacity for this course is ${course.maxCapacity} guests. You selected ${data.guests}.`);
      return;
    }

    // FIX #3: Validate blocked dates
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    if (blockedDates.includes(formattedDate)) {
      setDateError('This date is not available for bookings. Please select another date.');
      return;
    }

    setDateError(null);
    setIsSubmitting(true);
    setLastSubmitTime(now);
    
    // Safe price parsing: course.priceNumber → parse price string → fallback to 45
    let unitPrice = 45;
    if (course.priceNumber && !isNaN(course.priceNumber) && course.priceNumber > 0) {
      unitPrice = course.priceNumber;
    } else if (course.price) {
      const parsed = parseInt(course.price.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsed) && parsed > 0) {
        unitPrice = parsed;
      }
    }
    
    const totalPrice = unitPrice * Number(data.guests);

    // Trim data and validate
    const trimmedData = {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      notes: (data.notes || '').trim(),
      guests: Number(data.guests),
    };

    // Save real reservation to Admin store — aguarda o resultado e só mostra
    // sucesso se a gravação no servidor tiver mesmo acontecido.
    const saved = await addReservation({
      studentName: trimmedData.name,
      email: trimmedData.email,
      phone: trimmedData.phone,
      courseId: course.id,
      courseTitle: course.title,
      date: formattedDate,
      time: course.timeSlot || '10:00 - 12:30',
      guests: trimmedData.guests,
      totalPrice,
      currency: 'EUR',
      status: 'pending',
      paymentStatus: 'on_arrival',
      notes: trimmedData.notes,
    });

    setIsSubmitting(false);

    if (!saved.ok) {
      setLastSubmitTime(0);
      setSubmitErrorMessage(`${saved.error.replace(/\.$/, '')}. If the problem continues, contact Cátia directly via WhatsApp.`);
      setSubmitStatus('error');
      return;
    }

    setSubmittedData({
      name: trimmedData.name,
      date: formattedDate,
      guests: trimmedData.guests,
    });
    setSubmitStatus('success');
  };

  // Disabled dates: past dates + dates blocked by Cátia in admin panel
  const isDateDisabled = (date: Date) => {
    if (isPast(date) && !isToday(date)) return true;
    const dateStr = format(date, 'yyyy-MM-dd');
    return blockedDates.includes(dateStr);
  };

  if (loadingCourse) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center py-24">
          <p className="text-gray-500">Loading course…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-gray-50">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center py-24 text-center px-4">
          <h1 className="text-2xl font-serif font-bold text-mindelo-dark mb-3">Course not found</h1>
          <p className="text-gray-600 mb-6">This class may have been removed or the link is incorrect.</p>
          <Link
            href="/courses"
            className="bg-mindelo-blue hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition"
          >
            Browse all classes
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        {/* Logo Section */}
        <div className="bg-gradient-to-b from-[#F3F8FC] via-white to-[#F8FAFC] py-8 sm:py-12">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <Image
              src="/logo.png"
              alt="Catia Cooking Mindelo - Flavors of Cape Verde"
              width={180}
              height={180}
              className="w-44 h-44 sm:w-52 sm:h-52 mx-auto drop-shadow-lg"
            />
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative min-h-[40vh] md:min-h-[50vh] w-full bg-mindelo-dark flex items-end">
          <Image
            src={course.image || '/catia-cooking.jpg'}
            alt={course.title}
            fill
            className="object-cover opacity-60 mix-blend-overlay"
            priority
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <div className="relative w-full px-5 pt-24 pb-8 sm:p-8 md:p-16 text-white max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4">{course.title}</h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm md:text-base font-medium">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-mindelo-gold" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={20} className="text-mindelo-gold" />
                <span>{isDinner ? `Groups from ${minGuests} guests` : `Max ${course.maxCapacity} guests`}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={20} className="text-mindelo-gold" />
                <span>Fonte Francês, Mindelo</span>
              </div>
            </div>
            <a
              href="#booking"
              className="lg:hidden mt-6 inline-flex items-center gap-2 bg-mindelo-red hover:bg-red-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg transition-colors"
            >
              {isDinner ? 'Book a dinner' : 'Book this class'} <ArrowDown size={18} />
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Course Information */}
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-2xl font-serif font-bold text-mindelo-dark mb-4 border-b border-gray-200 pb-2">{isDinner ? 'About the Dinner' : 'About the Class'}</h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {course.description}
                </p>
              </section>

              {isDinner ? (
                <section>
                  <h2 className="text-2xl font-serif font-bold text-mindelo-dark mb-4 border-b border-gray-200 pb-2">The Menu</h2>
                  <ol className="space-y-4">
                    {dinnerMenu.map((item, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="w-8 h-8 shrink-0 rounded-full bg-mindelo-blue text-white font-bold flex items-center justify-center">{idx + 1}</span>
                        <div>
                          <p className="font-bold text-mindelo-dark text-lg">
                            {item.title}
                            {item.description && <span className="font-normal text-gray-600"> — {item.description}</span>}
                          </p>
                          {item.body && <p className="text-gray-600">{item.body}</p>}
                        </div>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-6 text-gray-600">
                    €{course.priceNumber} per person · groups from {minGuests} guests · served {course.duration.toLowerCase()}.
                  </p>
                </section>
              ) : (
                <section>
                  <h2 className="text-2xl font-serif font-bold text-mindelo-dark mb-4 border-b border-gray-200 pb-2">What&apos;s Included</h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {course.includes.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1 scroll-mt-24" id="booking">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 sm:p-6 md:p-8 lg:sticky lg:top-28">
                <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-6">
                  <div>
                    <span className="block text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Price per guest</span>
                    <span className="text-4xl font-bold text-mindelo-dark">{course.price}</span>
                  </div>
                </div>

                {submitStatus === 'error' ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle size={32} className="text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-mindelo-dark mb-2">Booking Error</h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                      {submitErrorMessage || 'Please wait 30 seconds before submitting another booking request. You can also contact Cátia directly via WhatsApp for faster confirmation.'}
                    </p>
                    <Link
                      href={whatsappLink(site.site_whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 px-4 rounded-xl font-bold text-sm transition-all shadow-md"
                    >
                      Contact via WhatsApp
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSubmitStatus('idle')}
                      className="mt-3 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-colors"
                    >
                      Try again
                    </button>
                  </div>
                ) : submitStatus === 'success' ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={32} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-mindelo-dark mb-2">Booking Request Sent!</h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                      Your booking request has been forwarded to Cátia for <strong className="text-mindelo-dark">{submittedData?.date}</strong> ({submittedData?.guests} guest{submittedData?.guests && submittedData.guests > 1 ? 's' : ''}).
                    </p>

                    <div className="space-y-3">
                      <a
                        href={whatsappLink(site.site_whatsapp, (`Hello Cátia! I have just submitted a booking request on your site for ${isDinner ? 'a dinner' : `the cooking class "${course.title}"`} on ${submittedData?.date} (${submittedData?.guests} guests) under the name of ${submittedData?.name}.`))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 px-4 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <span>Confirm via WhatsApp Direct</span>
                      </a>

                      <button 
                        onClick={() => {
                          setSubmitStatus('idle');
                          setSelectedDate(undefined);
                          reset();
                        }}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-colors block text-center"
                      >
                        Make another booking
                      </button>

                      <Link
                        href="/courses"
                        className="block text-center text-mindelo-blue text-sm font-semibold hover:underline pt-2"
                      >
                        ← View all cooking classes
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-mindelo-dark mb-2">1. Choose Your Date</label>
                      <div className="border border-gray-200 rounded-xl p-2 bg-gray-50 flex justify-center custom-calendar">
                        <style dangerouslySetInnerHTML={{__html: `
                          .rdp { --rdp-cell-size: 38px; --rdp-accent-color: #0066FF; --rdp-background-color: #E5EEFF; margin: 0; }
                        `}} />
                        <DayPicker
                          mode="single"
                          selected={selectedDate}
                          onSelect={(d) => {
                            setSelectedDate(d);
                            if (d) setDateError(null);
                          }}
                          disabled={isDateDisabled}
                          showOutsideDays
                        />
                      </div>
                      {dateError ? (
                        <p className="text-red-500 font-medium text-xs mt-2 flex items-center gap-1">
                          <AlertCircle size={14} /> {dateError}
                        </p>
                      ) : !selectedDate && submitStatus === 'idle' ? (
                        <p className="text-amber-600 text-xs mt-2 flex items-center gap-1">
                          <AlertCircle size={14} /> Please click an available date on the calendar above
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-mindelo-dark mb-2">2. Your Details</label>
                      
                      <div>
                        <input
                          {...register('name')}
                          autoComplete="name"
                          placeholder="Full Name"
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-mindelo-blue focus:ring-1 focus:ring-mindelo-blue outline-none transition-all"
                        />
                        {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                        <div>
                          <input
                            {...register('email')}
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            placeholder="Email Address"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-mindelo-blue focus:ring-1 focus:ring-mindelo-blue outline-none transition-all"
                          />
                          {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>}
                        </div>
                        <div>
                          <input
                            {...register('phone')}
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder="WhatsApp Number"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-mindelo-blue focus:ring-1 focus:ring-mindelo-blue outline-none transition-all"
                          />
                          {errors.phone && <span className="text-red-500 text-xs mt-1">{errors.phone.message}</span>}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between gap-3 pl-4 pr-1.5 py-1.5 rounded-lg border border-gray-200 bg-white">
                          <label htmlFor="guests" className="text-gray-600">Number of Guests</label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setValue('guests', Math.max(minGuests, (Number(watch('guests')) || minGuests) - 1), { shouldValidate: true })}
                              className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-mindelo-dark flex items-center justify-center transition-colors"
                              aria-label="Fewer guests"
                            >
                              <Minus size={18} />
                            </button>
                            <input
                              id="guests"
                              type="number"
                              inputMode="numeric"
                              {...register('guests', { valueAsNumber: true })}
                              className="w-12 h-10 text-center text-lg font-bold outline-none text-mindelo-dark"
                              min={minGuests}
                              max={course.maxCapacity}
                            />
                            <button
                              type="button"
                              onClick={() => setValue('guests', Math.min(course.maxCapacity, (Number(watch('guests')) || minGuests) + 1), { shouldValidate: true })}
                              className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-mindelo-dark flex items-center justify-center transition-colors"
                              aria-label="More guests"
                            >
                              <Plus size={18} />
                            </button>
                          </div>
                        </div>
                        {errors.guests && <span className="text-red-500 text-xs mt-1">{errors.guests.message}</span>}
                      </div>
                      
                      <div>
                        <textarea
                          {...register('notes')}
                          placeholder="Dietary restrictions or special questions?"
                          rows={2}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-mindelo-blue focus:ring-1 focus:ring-mindelo-blue outline-none transition-all resize-none"
                        ></textarea>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-mindelo-red hover:bg-red-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                      >
                        {isSubmitting ? (
                          <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                          isDinner ? 'Request Dinner Booking' : 'Request Booking'
                        )}
                      </button>
                      <p className="text-center text-xs text-gray-500 mt-4">
                        No online payment required now. Payment is settled in cash on the day of your {isDinner ? 'dinner' : 'class'}.
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
