import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const NewArticle = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Please fill in title and content');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const articleData = {
        title,
        subtitle,
        content,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        published
      };

      const response = await api.post('/articles', articleData);
      navigate(`/article/${response.data._id}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create article');
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Sign in to write</h2>
        <button 
          onClick={() => navigate('/login')}
          className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-4xl font-bold mb-4 outline-none border-none"
          disabled={loading}
        />
        <input
          type="text"
          placeholder="Subtitle (optional)"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-full text-xl text-gray-600 mb-6 outline-none border-none"
          disabled={loading}
        />
        <textarea
          placeholder="Tell your story..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-96 text-lg outline-none border-none resize-none"
          disabled={loading}
        />
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full text-sm text-gray-600 mb-6 outline-none border-t pt-4"
          disabled={loading}
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4"
              disabled={loading}
            />
            <span className="text-sm">Publish now</span>
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 border rounded-full hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : published ? 'Publish' : 'Save Draft'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewArticle;