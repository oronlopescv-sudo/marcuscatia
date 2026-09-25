'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAdminStore } from '@/lib/store';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters').trim(),
  email: z.string().email('Invalid email address').trim(),
  message: z.string().min(10, 'Message must have at least 10 characters').trim(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const addMessage = useAdminStore((state) => state.addMessage);
  
  // Rate limit: max 1 submission per 30 seconds
  const RATE_LIMIT_MS = 30000;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    // Rate limiting check
    const now = Date.now();
    if (now - lastSubmitTime < RATE_LIMIT_MS) {
      setSubmitErrorMessage('Please wait 30 seconds before trying again.');
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
      return;
    }

    setIsSubmitting(true);
    setLastSubmitTime(now);

    // Trim and validate data
    const trimmedData = {
      name: data.name.trim(),
      email: data.email.trim(),
      message: data.message.trim(),
    };

    // Validate trimmed data is not empty
    if (!trimmedData.name || !trimmedData.email || !trimmedData.message) {
      setIsSubmitting(false);
      setSubmitErrorMessage('Please fill in all fields.');
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
      return;
    }

    // Save to admin inbox — aguarda o resultado e só mostra sucesso se a
    // gravação no servidor tiver mesmo acontecido.
    const ok = await addMessage({
      name: trimmedData.name,
      email: trimmedData.email,
      message: trimmedData.message,
      subject: 'Message from Contact Form'
    });

    setIsSubmitting(false);

    if (!ok) {
      setSubmitErrorMessage('Sorry, we could not send your message. Please try again or use WhatsApp for faster contact.');
      setSubmitStatus('error');
      return;
    }

    setSubmitStatus('success');
    reset();
    setTimeout(() => setSubmitStatus('idle'), 5000);
  };

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

        {/* Header Section */}
        <div className="bg-mindelo-dark py-16 text-white text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-gray-300">
              Have questions, private group inquiries, or special dietary requirements? We are here to help.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
            
            {/* Contact Info */}
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-serif font-bold text-mindelo-dark mb-6">Contact Information</h2>
                <p className="text-gray-600 text-lg mb-8">
                  We always love a great conversation! Feel free to call us directly or drop a message via WhatsApp for the quickest response.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Phone className="text-mindelo-blue" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-mindelo-dark text-lg">Phone / WhatsApp</h3>
                      <p className="text-gray-600 mt-1">
                        <a href="tel:+2385953973" className="hover:text-mindelo-blue transition-colors font-semibold">+238 5953973</a>
                      </p>
                      <a 
                        href="https://wa.me/2385953973?text=Hello%20C%C3%A1tia!%20I%20would%20like%20information%20about%20cooking%20classes%20in%20Mindelo." 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
                      >
                        <span>Chat on WhatsApp →</span>
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Mail className="text-mindelo-blue" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-mindelo-dark text-lg">Email</h3>
                      <p className="text-gray-600 mt-1">
                        <a href="mailto:deandradeleukelcatiasofia@gmail.com" className="hover:text-mindelo-blue transition-colors text-sm break-all">deandradeleukelcatiasofia@gmail.com</a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <MapPin className="text-mindelo-blue" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-mindelo-dark text-lg">Location</h3>
                      <p className="text-gray-600 mt-1">
                        Fonte Francês<br />
                        Mindelo, São Vicente<br />
                        Cape Verde
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Clock className="text-mindelo-blue" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-mindelo-dark text-lg">Operating Hours</h3>
                      <p className="text-gray-600 mt-1">
                        Monday to Saturday: 09:00 - 18:00
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Interactive Link */}
              <a
                href="https://www.google.com/maps/search/?api=1&query=Fonte+Franc%C3%AAs+Mindelo+S%C3%A3o+Vicente+Cabo+Verde" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-64 bg-gray-200 rounded-2xl overflow-hidden relative border border-gray-300 flex items-center justify-center group cursor-pointer shadow-sm hover:shadow-md transition-shadow block"
                title="Open in Google Maps"
              >
                 <div className="absolute inset-0 bg-[url('/catia-cooking.jpg')] bg-cover bg-center opacity-60 grayscale group-hover:scale-105 transition-transform duration-500"></div>
                 <div className="relative z-10 bg-white/95 group-hover:bg-[#0A3D78] group-hover:text-white transition-colors duration-200 backdrop-blur-sm px-6 py-3 rounded-full shadow-md text-sm font-bold text-mindelo-dark flex items-center gap-2">
                   <MapPin size={16} className="text-mindelo-blue group-hover:text-white transition-colors" />
                   <span>View on Google Maps (Fonte Francês)</span>
                 </div>
              </a>
            </div>

            {/* Contact Form */}
            <div>
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
                <h2 className="text-2xl font-serif font-bold text-mindelo-dark mb-6">Send a Message</h2>
                
                {submitStatus === 'success' ? (
                  <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-6 text-center">
                    <p className="font-bold text-lg mb-2">Message sent successfully!</p>
                    <p>Cátia will reply as soon as possible.</p>
                  </div>
                ) : submitStatus === 'error' ? (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 text-center">
                    <p className="font-bold text-lg mb-2">Error sending message</p>
                    <p>{submitErrorMessage || 'Please wait 30 seconds before trying again, or use WhatsApp for faster contact.'}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                      <input
                        id="name"
                        {...register('name')}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-mindelo-blue focus:ring-1 focus:ring-mindelo-blue outline-none transition-all"
                        placeholder="Your full name"
                      />
                      {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                      <input
                        id="email"
                        type="email"
                        {...register('email')}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-mindelo-blue focus:ring-1 focus:ring-mindelo-blue outline-none transition-all"
                        placeholder="your.email@example.com"
                      />
                      {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>}
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                      <textarea
                        id="message"
                        rows={5}
                        {...register('message')}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-mindelo-blue focus:ring-1 focus:ring-mindelo-blue outline-none transition-all resize-none"
                        placeholder="How can we help you?"
                      ></textarea>
                      {errors.message && <span className="text-red-500 text-xs mt-1">{errors.message.message}</span>}
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-mindelo-blue hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      ) : (
                        <>
                          Send Message
                          <Send size={18} />
                        </>
                      )}
                    </button>
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
