import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Library, LogOut } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="bg-mahogany text-parchment py-4 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="text-2xl font-serif font-bold flex items-center gap-2">
          <BookOpen size={28} className="text-sage" />
          Annotated Minds
        </Link>
        <div className="flex gap-6 items-center">
          <Link to="/" className="hover:text-sage transition-colors font-serif">Dashboard</Link>
          <Link to="/bookshelf" className="hover:text-sage transition-colors font-serif flex items-center gap-1">
            <Library size={18} /> Bookshelf
          </Link>
          <Link to="/reviews" className="hover:text-sage transition-colors font-serif">Write Review</Link>
          <Link to="/library" className="hover:text-sage transition-colors font-serif">Library Archive</Link>
          <Link to="/wishlist" className="hover:text-sage transition-colors font-serif">Wishlist</Link>
          <Link to="/series" className="hover:text-sage transition-colors font-serif">Series</Link>
        </div>
      </div>
    </nav>
  );
}
