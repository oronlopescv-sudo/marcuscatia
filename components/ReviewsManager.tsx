'use client';

import { useCallback, useEffect, useState } from 'react';
import { Star, Check, EyeOff, Trash2 } from 'lucide-react';

interface Comment {
  id: string;
  name: string;
  email: string;
  rating: number;
  comment: string;
  approved: number | boolean;
  createdAt: string;
}

export function ReviewsManager() {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/comments?all=1');
      const data = await res.json();
      setComments(Array.isArray(data.comments) ? data.comments : []);
    } catch {
      setComments([]);
      setError('Could not load reviews');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- state is only set after the fetch resolves
    load();
  }, [load]);

  const setApproved = async (id: string, approved: boolean) => {
    const res = await fetch('/api/comments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved }),
    });
    if (res.ok) setComments((list) => (list || []).map((c) => (c.id === id ? { ...c, approved } : c)));
    else setError('Could not update the review');
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    const res = await fetch('/api/comments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setComments((list) => (list || []).filter((c) => c.id !== id));
    else setError('Could not delete the review');
  };

  const pending = (comments || []).filter((c) => !c.approved).length;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold text-mindelo-dark">
          Guest Reviews {pending > 0 && <span className="ml-2 text-sm font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{pending} waiting</span>}
        </h3>
        <p className="text-sm text-gray-500">Reviews sent from the website. They only appear on the site after you approve them.</p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {comments === null ? (
        <p className="text-gray-500 text-sm">Loading…</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-6">No reviews yet.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className={`border rounded-xl p-4 ${c.approved ? 'border-gray-200 bg-white' : 'border-amber-200 bg-amber-50/50'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 break-words">{c.name}</p>
                  <p className="text-xs text-gray-500 break-all">{c.email} · {String(c.createdAt).slice(0, 10)}</p>
                </div>
                <div className="flex" aria-label={`${c.rating} stars`}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={16} className={i <= c.rating ? 'text-mindelo-gold fill-mindelo-gold' : 'text-gray-300'} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-2 whitespace-pre-line break-words">{c.comment}</p>
              <div className="grid grid-cols-2 gap-2 mt-3 sm:flex sm:justify-end">
                {c.approved ? (
                  <button onClick={() => setApproved(c.id, false)} className="h-10 px-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200">
                    <EyeOff size={16} /> Hide
                  </button>
                ) : (
                  <button onClick={() => setApproved(c.id, true)} className="h-10 px-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700">
                    <Check size={16} /> Approve
                  </button>
                )}
                <button onClick={() => remove(c.id)} className="h-10 px-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100">
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
