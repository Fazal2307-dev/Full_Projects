import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark } from 'lucide-react';

const ArticleCard = ({ article }) => {
  const navigate = useNavigate();

  return (
    <article 
      className="border-b py-6 cursor-pointer hover:opacity-80"
      onClick={() => navigate(`/article/${article._id}`)}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
          {article.author.name[0].toUpperCase()}
        </div>
        <span className="text-sm font-medium">{article.author.name}</span>
        <span className="text-gray-400">·</span>
        <span className="text-sm text-gray-500">
          {new Date(article.createdAt).toLocaleDateString()}
        </span>
      </div>
      <h3 className="text-xl font-bold mb-2">{article.title}</h3>
      <p className="text-gray-600 mb-4">{article.subtitle}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{article.readTime} min read</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {article.likes?.length || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {article.comments?.length || 0}
            </span>
          </div>
        </div>
        <Bookmark className="w-5 h-5 text-gray-400 hover:text-gray-700" />
      </div>
    </article>
  );
};

export default ArticleCard;