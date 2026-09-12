import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { GraduationCap, Menu, X, LogOut, Layers, Video } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = user
    ? [
        { to: '/', label: 'Home' },
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/courses', label: 'Courses' },
        { to: '/recommended', label: 'Recommended' },
        { to: '/flashcards', label: 'Flashcards' },
        { to: '/quiz-generator', label: 'Quiz Generator' },
        { to: '/video-assessment', label: 'Video Assessment' },
        { to: '/chatbot', label: 'AI Assistant' },
        { to: '/profile', label: 'Profile' },
      ]
    : [
        { to: '/', label: 'Home' },
        { to: '/courses', label: 'Courses' },
        { to: '/about', label: 'About Us' },
        { to: '/contact', label: 'Contact' },
      ];

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex flex-shrink-0 items-center gap-2 text-xl font-bold text-blue-600">
            <GraduationCap className="h-8 w-8" />
            <span>Saamrthya AI</span>
          </Link>

          {/* Desktop nav — scrollable if too many links */}
          <div className="hidden md:flex items-center gap-1 overflow-x-auto">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex-shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive(link.to)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={handleSignOut}
                className="ml-2 flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            ) : (
              <div className="ml-2 flex gap-2">
                <Link
                  to="/login"
                  className="rounded-lg border-2 border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="flex flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive(link.to)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={handleSignOut}
                className="mt-2 flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2.5 text-white"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            ) : (
              <div className="mt-2 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border-2 border-blue-600 px-3 py-2 text-center font-semibold text-blue-600"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center font-semibold text-white"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
