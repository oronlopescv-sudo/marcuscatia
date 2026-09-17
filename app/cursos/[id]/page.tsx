'use client';

import { useState, use } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Image from 'next/image';
import { Clock, Users, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format, isPast, isToday, addDays } from 'date-fns';
import 'react-day-picker/dist/style.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useAdminStore, INITIAL_COURSES } from '@/lib/store';

const reservationSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters').trim(),
  email: z.string().email('Invalid email address').trim(),
  phone: z.string()
    .min(8, 'Phone number must have at least 8 digits')
    .regex(/^[\d\s+().-]+$/, 'Phone number contains invalid characters')
    .trim(),
  guests: z.number().min(1, 'Minimum 1 person').max(8, 'Maximum 8 people'),
  notes: z.string().optional(),
});

type ReservationFormValues = z.infer<typeof reservationSchema>;

export default function CourseDetail({ params }: { params: Promise<{ id: string }> }) {
  // Need to unwrap params since Next.js 15
  const unwrappedParams = use(params);
  
  const { courses, addReservation, blockedDates } = useAdminStore();
  
  // Find from store or fallback to initial
  const course = courses.find((c) => c.id === unwrappedParams.id) || 
    INITIAL_COURSES.find((c) => c.id === unwrappedParams.id) || 
    INITIAL_COURSES[0];
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [dateError, setDateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submittedData, setSubmittedData] = useState<{ name: string; date: string; guests: number } | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      guests: 1
    }
  });

  const onSubmit = (data: ReservationFormValues) => {
    if (!selectedDate) {
      setDateError('Please select a date on the calendar for your class.');
      return;
    }
    setDateError(null);
    setIsSubmitting(true);

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const unitPrice = course.priceNumber || parseInt(course.price.replace(/[^0-9]/g, '')) || 45;
    const totalPrice = unitPrice * Number(data.guests);

    // Trim data and validate
    const trimmedData = {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      notes: (data.notes || '').trim(),
      guests: Number(data.guests),
    };

    // Save real reservation to Admin store
    addReservation({
      studentName: trimmedData.name,
      email: trimmedData.email,
      phone: trimmedData.phone,
      courseId: course.id,
      courseTitle: course.title,
      date: formattedDate,
      time: course.timeSlot || '09:30 - 13:30',
      guests: trimmedData.guests,
      totalPrice,
      currency: 'EUR',
      status: 'pending',
      paymentStatus: 'on_arrival',
      notes: trimmedData.notes,
    });

    setSubmittedData({
      name: trimmedData.name,
      date: formattedDate,
      guests: trimmedData.guests,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
    }, 600);
  };

  // Disabled dates: past dates + dates blocked by Cátia in admin panel
  const isDateDisabled = (date: Date) => {
    if (isPast(date) && !isToday(date)) return true;
    const dateStr = format(date, 'yyyy-MM-dd');
    return blockedDates.includes(dateStr);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Image */}
        <div className="relative h-[40vh] md:h-[50vh] w-full bg-mindelo-dark">
          <Image
            src={course.image}
            alt={course.title}
            fill
            className="object-cover opacity-60 mix-blend-overlay"
            priority
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 text-white max-w-7xl mx-auto">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-mindelo-blue mb-4">
              {course.level}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4">{course.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-sm md:text-base font-medium">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-mindelo-gold" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={20} className="text-mindelo-gold" />
                <span>Max {course.maxCapacity} guests</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={20} className="text-mindelo-gold" />
                <span>Fonte Francês, Mindelo</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Course Information */}
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-2xl font-serif font-bold text-mindelo-dark mb-4 border-b border-gray-200 pb-2">About the Class</h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {course.description}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-serif font-bold text-mindelo-dark mb-4 border-b border-gray-200 pb-2">What&apos;s Included</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.includes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 sticky top-28">
                <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-6">
                  <div>
                    <span className="block text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Price per guest</span>
                    <span className="text-4xl font-bold text-mindelo-dark">{course.price}</span>
                  </div>
                </div>

                {submitStatus === 'success' ? (
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
                        href={`https://wa.me/2385953973?text=${encodeURIComponent(`Hello Cátia! I have just submitted a booking request on your site for the cooking class "${course.title}" on ${submittedData?.date} (${submittedData?.guests} guests) under the name of ${submittedData?.name}.`)}`}
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
                        href="/cursos"
                        className="block text-center text-mindelo-blue text-sm font-semibold hover:underline pt-2"
                      >
                        ← View all cooking classes
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                          placeholder="Full Name"
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-mindelo-blue focus:ring-1 focus:ring-mindelo-blue outline-none transition-all"
                        />
                        {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <input
                            {...register('email')}
                            placeholder="Email Address"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-mindelo-blue focus:ring-1 focus:ring-mindelo-blue outline-none transition-all"
                          />
                          {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>}
                        </div>
                        <div>
                          <input
                            {...register('phone')}
                            placeholder="WhatsApp Number"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-mindelo-blue focus:ring-1 focus:ring-mindelo-blue outline-none transition-all"
                          />
                          {errors.phone && <span className="text-red-500 text-xs mt-1">{errors.phone.message}</span>}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 bg-white">
                          <span className="text-gray-600">Number of Guests</span>
                          <input
                            type="number"
                            {...register('guests', { valueAsNumber: true })}
                            className="w-16 text-center font-bold outline-none text-mindelo-dark"
                            min="1"
                            max={course.maxCapacity}
                          />
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
                          'Request Booking'
                        )}
                      </button>
                      <p className="text-center text-xs text-gray-500 mt-4">
                        No online payment required now. Payment is settled in cash on the day of the class.
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
