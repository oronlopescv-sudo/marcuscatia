'use client';

import { useEffect, useState } from 'react';
import { Mail, Trash2 } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export function NewsletterSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[] | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/newsletter')
      .then((res) => (res.ok ? res.json() : { subscribers: [] }))
      .then((data) => setSubscribers(Array.isArray(data.subscribers) ? data.subscribers : []))
      .catch(() => setSubscribers([]));
  }, []);

  const remove = async (id: string) => {
    if (!confirm('Remove this subscriber?')) return;
    const res = await fetch(`/api/newsletter?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.ok) setSubscribers((list) => (list || []).filter((s) => s.id !== id));
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText((subscribers || []).map((s) => s.email).join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-mindelo-dark flex items-center gap-2">
          <Mail size={22} /> Newsletter Subscribers
          {subscribers && <span className="text-sm font-semibold text-gray-500">({subscribers.length})</span>}
        </h2>
        {subscribers && subscribers.length > 0 && (
          <button
            type="button"
            onClick={copyAll}
            className="text-sm font-semibold bg-mindelo-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {copied ? 'Copied!' : 'Copy all emails'}
          </button>
        )}
      </div>

      {subscribers === null ? (
        <p className="text-gray-500 text-sm">Loading…</p>
      ) : subscribers.length === 0 ? (
        <p className="text-gray-500 text-sm">No subscribers yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg max-h-80 overflow-y-auto">
          {subscribers.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div className="min-w-0">
                <p className="font-medium text-gray-800 truncate">{s.email}</p>
                <p className="text-xs text-gray-500">{String(s.created_at).slice(0, 10)}</p>
              </div>
              <button
                type="button"
                onClick={() => remove(s.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                aria-label={`Remove ${s.email}`}
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
