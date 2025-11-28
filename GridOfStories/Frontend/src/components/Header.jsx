import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Edit, User, LogOut, Library } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowMenu(false);
    navigate('/');
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-serif font-bold">
            Medium
          </Link>
          <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-full px-4 py-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none text-sm w-64"
            />
          </div>
        </div>

        <nav className="flex items-center gap-6">
          {user ? (
            <>
              <Link 
                to="/new"
                className="hidden md:flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <Edit className="w-5 h-5" />
                <span>Write</span>
              </Link>
              <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-900" />
              <div className="relative">
                <div 
                  className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full cursor-pointer flex items-center justify-center text-white font-semibold"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  {user.name[0].toUpperCase()}
                </div>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border">
                    <Link 
                      to={`/profile/${user.id}`}
                      onClick={() => setShowMenu(false)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link 
                      to="/library"
                      onClick={() => setShowMenu(false)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Library className="w-4 h-4" />
                      Library
                    </Link>
                    <hr className="my-2" />
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-gray-900">
                Sign in
              </Link>
              <Link 
                to="/register"
                className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;