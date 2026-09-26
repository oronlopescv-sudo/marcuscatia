'use client';

import { useEffect, useState } from 'react';
import { Star, PenLine, CheckCircle2 } from 'lucide-react';
import { useSiteContent } from '@/lib/useSiteContent';

interface Review {
  name: string;
  role?: string;
  content: string;
  rating: number;
}

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <div className="flex justify-center gap-1" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= value ? 'text-mindelo-gold fill-mindelo-gold' : 'text-gray-300'} />
      ))}
    </div>
  );
}

function ReviewForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, rating, comment }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Could not send your review. Please try again.');
        setStatus('error');
        return;
      }
      setStatus('sent');
    } catch {
      setError('Network error. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="text-center py-6">
        <CheckCircle2 size={40} className="text-green-600 mx-auto mb-3" />
        <p className="font-bold text-mindelo-dark text-lg">Thank you for your review!</p>
        <p className="text-gray-600 text-sm mt-1">It will appear here once Cátia has approved it.</p>
        <button type="button" onClick={onDone} className="mt-4 px-5 py-2.5 text-sm font-semibold text-mindelo-blue hover:underline">
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 text-left">
      <div>
        <p className="block text-sm font-bold text-mindelo-dark mb-2">Your rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              className="p-1.5"
              aria-label={`${i} star${i > 1 ? 's' : ''}`}
              aria-pressed={i === rating}
            >
              <Star size={30} className={i <= rating ? 'text-mindelo-gold fill-mindelo-gold' : 'text-gray-300'} />
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          required
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoComplete="name"
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-mindelo-blue focus:ring-1 focus:ring-mindelo-blue outline-none"
        />
        <input
          required
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (not published)"
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-mindelo-blue focus:ring-1 focus:ring-mindelo-blue outline-none"
        />
      </div>
      <textarea
        required
        maxLength={2000}
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="How was your experience with Cátia?"
        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-mindelo-blue focus:ring-1 focus:ring-mindelo-blue outline-none resize-none"
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
        <button type="button" onClick={onDone} className="px-5 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100">
          Cancel
        </button>
        <button
          type="submit"
          disabled={status === 'sending'}
          className="px-6 py-3 rounded-xl font-bold bg-mindelo-red hover:bg-red-700 text-white disabled:opacity-50"
        >
          {status === 'sending' ? 'Sending…' : 'Send review'}
        </button>
      </div>
    </form>
  );
}

export function Testimonials() {
  const [approved, setApproved] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Testimonials added in the admin Content Editor: Title = name,
  // Description = where they are from, Content = the text.
  const fromEditor = (useSiteContent('testimonial') || [])
    .filter((t) => t.title && t.body)
    .map((t) => ({ name: t.title, role: t.description, content: t.body, rating: 5 }));

  useEffect(() => {
    let cancelled = false;
    fetch('/api/comments')
      .then((res) => (res.ok ? res.json() : { comments: [] }))
      .then((data) => {
        if (cancelled || !Array.isArray(data.comments)) return;
        setApproved(
          data.comments.map((c: { name: string; comment: string; rating: number }) => ({
            name: c.name,
            content: c.comment,
            rating: Number(c.rating) || 5,
          }))
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const reviews = [...fromEditor, ...approved];
  const average = approved.length ? approved.reduce((a, r) => a + r.rating, 0) / approved.length : 0;

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-mindelo-dark mb-6 sm:mb-8">
            What Our Students Say
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            The joy and fond memories of those who cook with us are our greatest pride.
          </p>
          {approved.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-gray-600">
              <Stars value={Math.round(average)} />
              <span>
                {average.toFixed(1)} from {approved.length} review{approved.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {reviews.map((review, idx) => (
              <div key={idx} className="bg-mindelo-cream/30 p-6 sm:p-8 rounded-2xl border border-blue-50 relative mt-8">
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                  <div className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-mindelo-blue text-white flex items-center justify-center text-2xl font-serif font-bold">
                    {review.name.trim().charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="pt-10 text-center">
                  <div className="mb-4">
                    <Stars value={review.rating} />
                  </div>
                  <p className="text-gray-700 italic mb-6 text-sm leading-relaxed break-words">&ldquo;{review.content}&rdquo;</p>
                  <div>
                    <h4 className="font-bold text-mindelo-dark">{review.name}</h4>
                    {review.role && <span className="text-xs text-gray-500 uppercase tracking-wider">{review.role}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="max-w-2xl mx-auto mt-10 sm:mt-12">
          {showForm ? (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 sm:p-8">
              <h3 className="text-xl font-serif font-bold text-mindelo-dark mb-4">Leave a review</h3>
              <ReviewForm onDone={() => setShowForm(false)} />
            </div>
          ) : (
            <div className="text-center">
              {reviews.length === 0 && <p className="text-gray-600 mb-4">Cooked with Cátia? Be the first to share your experience.</p>}
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold border-2 border-mindelo-blue text-mindelo-blue hover:bg-mindelo-blue hover:text-white transition-colors"
              >
                <PenLine size={18} /> Write a review
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
