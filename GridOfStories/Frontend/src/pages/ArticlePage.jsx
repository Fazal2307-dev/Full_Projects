import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark, Trash2 } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const response = await api.get(`/articles/${id}`);
      setArticle(response.data);
      if (user) {
        setLiked(response.data.likes.includes(user.id));
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await api.post(`/articles/${id}/like`);
      setLiked(!liked);
      setArticle({
        ...article,
        likes: liked 
          ? article.likes.filter(l => l !== user.id)
          : [...article.likes, user.id]
      });
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const response = await api.post(`/articles/${id}/comment`, { text: commentText });
      setArticle({
        ...article,
        comments: [...article.comments, response.data]
      });
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await api.delete(`/articles/${id}`);
        navigate('/');
      } catch (error) {
        console.error('Error deleting article:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Article not found</h2>
        <button 
          onClick={() => navigate('/')}
          className="text-green-600 hover:underline"
        >
          Go back home
        </button>
      </div>
    );
  }

  const isAuthor = user && article.author._id === user.id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <article>
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        {article.subtitle && (
          <h2 className="text-xl text-gray-600 mb-6">{article.subtitle}</h2>
        )}
        
        <div className="flex items-center justify-between mb-8 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {article.author.name[0].toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{article.author.name}</div>
              <div className="text-sm text-gray-500">
                {new Date(article.createdAt).toLocaleDateString()} · {article.readTime} min read
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 ${liked ? 'text-red-500' : 'text-gray-600'} hover:text-red-500`}
            >
              <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
              <span>{article.likes.length}</span>
            </button>
            <MessageCircle className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-900" />
            <Bookmark className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-900" />
            {isAuthor && (
              <button onClick={handleDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        <div className="prose max-w-none mb-8">
          <p className="text-lg leading-relaxed whitespace-pre-wrap">{article.content}</p>
        </div>

        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map(tag => (
              <span key={tag} className="bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-700">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="border-t pt-8">
          <h3 className="text-xl font-bold mb-4">Comments ({article.comments.length})</h3>
          
          {user && (
            <form onSubmit={handleComment} className="mb-6">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
                rows="3"
              />
              <button
                type="submit"
                className="mt-2 bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700"
              >
                Post Comment
              </button>
            </form>
          )}

          <div className="space-y-4">
            {article.comments.map((comment, index) => (
              <div key={index} className="border-b pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {comment.user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{comment.user.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 ml-10">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
};

export default ArticlePage;