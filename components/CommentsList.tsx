'use client';

import { useEffect, useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface CommentsListProps {
  courseId?: string;
  isAdmin?: boolean;
}

export function CommentsList({ courseId, isAdmin = false }: CommentsListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [courseId]);

  const fetchComments = async () => {
    try {
      const url = courseId ? `/api/comments?courseId=${courseId}` : '/api/comments';
      const response = await fetch(url);
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin || !confirm('Delete this comment?')) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setComments(comments.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  if (isLoading) return <div className="text-center py-8 text-gray-500">Loading comments...</div>;

  if (comments.length === 0) {
    return <div className="text-center py-8 text-gray-500">No comments yet. Be the first to comment!</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-mindelo-dark">
        Comments ({comments.length})
      </h3>
      {comments.map((comment) => (
        <div key={comment.id} className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-semibold text-gray-800">{comment.name}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => handleDelete(comment.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>

          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                className={star <= comment.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
              />
            ))}
          </div>

          <p className="text-gray-700">{comment.comment}</p>
        </div>
      ))}
    </div>
  );
}
