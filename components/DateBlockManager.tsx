'use client';

import { useState, useEffect } from 'react';
import { Lock, Unlock, X, Calendar } from 'lucide-react';

interface BlockedDate {
  id: string;
  date: string;
  reason: string;
  createdAt: string;
}

interface DateBlockManagerProps {
  courseId?: string;
  onDateBlocked?: (date: string) => void;
}

export function DateBlockManager({ courseId, onDateBlocked }: DateBlockManagerProps) {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [reason, setReason] = useState('Full capacity');
  const [isBlocking, setIsBlocking] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadBlockedDates();
  }, [courseId]);

  const loadBlockedDates = async () => {
    try {
      const url = courseId
        ? `/api/blocked-dates?courseId=${courseId}`
        : '/api/blocked-dates';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        // API may return either a raw array or { blockedDates: [...] };
        // guard against both shapes and any non-array payload so a
        // malformed/error response never crashes .map()/.length below.
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.blockedDates)
            ? data.blockedDates
            : [];
        setBlockedDates(list);
      } else {
        setBlockedDates([]);
      }
    } catch (err) {
      console.error('Failed to load blocked dates:', err);
      setBlockedDates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockDate = async () => {
    if (!selectedDate) {
      setMessage('Please select a date');
      return;
    }

    setIsBlocking(true);
    setMessage('');

    try {
      const response = await fetch('/api/blocked-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          reason,
          courseId,
        }),
      });

      if (response.ok) {
        setMessage('✅ Date blocked successfully');
        setSelectedDate('');
        setReason('Full capacity');
        await loadBlockedDates();
        if (onDateBlocked) {
          onDateBlocked(selectedDate);
        }
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Failed to block date');
      }
    } catch (err) {
      setMessage('Error blocking date');
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblockDate = async (id: string) => {
    if (!confirm('Unblock this date?')) return;

    try {
      const response = await fetch(`/api/blocked-dates/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('✅ Date unblocked');
        await loadBlockedDates();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Failed to unblock date');
      }
    } catch (err) {
      setMessage('Error unblocking date');
    }
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2">
        <Calendar size={20} className="text-mindelo-blue" />
        <h3 className="font-semibold text-gray-800">Date Availability Manager</h3>
      </div>

      {/* Block Date Form */}
      <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-200">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Block Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mindelo-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Reason
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mindelo-blue"
          >
            <option>Full capacity</option>
            <option>Personal time off</option>
            <option>Maintenance</option>
            <option>Holiday</option>
            <option>Other</option>
          </select>
        </div>

        <button
          onClick={handleBlockDate}
          disabled={isBlocking || !selectedDate}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Lock size={18} />
          {isBlocking ? 'Blocking...' : 'Block Date'}
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('✅')
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* Blocked Dates List */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-2">Blocked Dates ({blockedDates.length})</h4>
        {blockedDates.length === 0 ? (
          <p className="text-gray-500 text-sm">No blocked dates</p>
        ) : (
          <div className="space-y-2">
            {blockedDates.map((bd) => (
              <div
                key={bd.id}
                className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{bd.date}</p>
                  <p className="text-xs text-gray-600">{bd.reason}</p>
                </div>
                <button
                  onClick={() => handleUnblockDate(bd.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Unblock date"
                >
                  <Unlock size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
