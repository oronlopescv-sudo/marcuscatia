import { useEffect, useState } from 'react';

interface ContentItem {
  id: string;
  section: string;
  key_name: string;
  content: string;
  type: 'text' | 'rich_text' | 'title' | 'subtitle';
  created_at?: string;
  updated_at?: string;
}

export function useSiteContent(section?: string) {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const url = section 
          ? `/api/content?section=${section}`
          : '/api/content';
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch content');
        
        const data = await response.json();
        setContent(data);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [section]);

  const getText = (keyName: string, defaultText?: string): string => {
    const item = content.find(c => c.key_name === keyName);
    return item?.content || defaultText || keyName;
  };

  const updateContent = async (id: string, newContent: string, type?: string) => {
    try {
      const response = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, content: newContent, type })
      });
      
      if (!response.ok) throw new Error('Failed to update content');
      
      setContent(content.map(c => 
        c.id === id ? { ...c, content: newContent } : c
      ));
      
      return true;
    } catch (err) {
      console.error('Error updating content:', err);
      return false;
    }
  };

  return { content, loading, error, getText, updateContent };
}
