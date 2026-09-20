'use client';

import { useState, useEffect } from 'react';

interface ContentItem {
  id: string;
  section: string;
  key_name: string;
  content: string;
  type: 'text' | 'rich_text' | 'title' | 'subtitle';
}

export function AdminContentManager() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('home');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const sections = ['home', 'about', 'courses', 'gallery', 'contact'];

  useEffect(() => {
    fetchContent();
  }, [selectedSection]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/content?section=${selectedSection}`);
      const data = await response.json();
      setContent(data);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: ContentItem) => {
    setEditingId(item.id);
    setEditText(item.content);
  };

  const handleSave = async (id: string) => {
    try {
      const response = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, content: editText })
      });

      if (response.ok) {
        setContent(content.map(c => 
          c.id === id ? { ...c, content: editText } : c
        ));
        setEditingId(null);
        alert('✅ Content updated!');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      alert('❌ Erro ao salvar');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-mindelo-dark">Manage Site Content</h2>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {sections.map(section => (
          <button
            key={section}
            onClick={() => setSelectedSection(section)}
            className={`px-4 py-2 rounded font-medium capitalize transition ${
              selectedSection === section
                ? 'bg-mindelo-blue text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Content List */}
      {loading ? (
        <p className="text-gray-600">Carregando...</p>
      ) : content.length === 0 ? (
        <p className="text-gray-600">No content found</p>
      ) : (
        <div className="space-y-6">
          {content.map(item => (
            <div
              key={item.id}
              className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-mindelo-dark">{item.key_name}</h3>
                  <p className="text-sm text-gray-500">{item.type}</p>
                </div>
                {editingId !== item.id && (
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-mindelo-blue hover:text-mindelo-dark font-medium"
                  >
                    ✏️ Edit
                  </button>
                )}
              </div>

              {editingId === item.id ? (
                <div className="space-y-3">
                  {item.type === 'rich_text' ? (
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full h-48 p-3 border border-gray-300 rounded font-mono text-sm"
                    />
                  ) : (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded"
                    />
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(item.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-medium"
                    >
                      💾 Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 font-medium"
                    >
                      ✕ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 mt-2">{item.content}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
