'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      if (res.ok) {
        setEmail('');
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-mindelo-dark relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white mb-4">
          Stay in the Loop
        </h2>
        <p className="text-gray-300 mb-8 sm:mb-10 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
          Subscribe to our newsletter for traditional recipes, culinary stories, and early notification of upcoming class dates.
        </p>
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto relative">
          <div className="relative flex items-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address..."
              required
              disabled={status === 'loading' || status === 'success'}
              className="w-full pl-4 sm:pl-6 pr-20 sm:pr-32 py-3 sm:py-4 rounded-full bg-white border-2 border-transparent focus:border-mindelo-blue focus:outline-none text-sm sm:text-base text-gray-900 placeholder-gray-400 transition-all shadow-lg"
            />
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="absolute right-1 sm:right-1.5 top-1 sm:top-1.5 bottom-1 sm:bottom-1.5 bg-mindelo-blue hover:bg-blue-600 text-white px-3 sm:px-6 rounded-full font-bold transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-base disabled:opacity-70"
            >
              {status === 'loading' ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : status === 'success' ? (
                <span>Subscribed!</span>
              ) : (
                <>
                  <span className="hidden sm:inline">Subscribe</span>
                  <Send size={18} />
                </>
              )}
            </button>
          </div>
          {status === 'success' && (
            <p className="absolute -bottom-8 left-0 right-0 text-mindelo-gold text-sm font-medium">
              Thank you for subscribing! Please check your inbox.
            </p>
          )}
          {status === 'error' && (
            <p className="absolute -bottom-8 left-0 right-0 text-red-400 text-sm font-medium">
              Please enter a valid email address.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
