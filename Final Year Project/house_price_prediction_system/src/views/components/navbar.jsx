import { Home, User, TrendingUp, History, Building2, Menu, X, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';

export const ROUTES = {
  HOME:            '/',
  LISTINGS:        '/listings',
  PREDICT:         '/predict',
  HISTORICAL_RATES:'/historical-rates',
  PROFILE:         '/profile',
  SIGN_IN:         '/sign_in',
};

export function Navbar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const username = localStorage.getItem('username');
  const isLoggedIn = !!localStorage.getItem('access_token');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    navigate('/sign_in');
    setIsMenuOpen(false);
  };

  const navItems = useMemo(() => [
    { path: ROUTES.HOME,             label: 'Home',            icon: Home       },
    { path: ROUTES.LISTINGS,         label: 'Browse Listings', icon: Building2  },
    { path: ROUTES.PREDICT,          label: 'Price Predictor', icon: TrendingUp },
    { path: ROUTES.HISTORICAL_RATES, label: 'Historical Rates',icon: History    },
  ], []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg sticky top-0 z-50">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 w-full">
        {/* Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2 group" onClick={() => setIsMenuOpen(false)}>
          <Home className="w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:scale-105" />
          <div>
            <div className="font-bold text-lg sm:text-xl">Lahore Property</div>
            <div className="text-xs text-emerald-100 hidden sm:block">Find Your Dream Home</div>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link key={path} to={path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                isActive(path) ? 'bg-white text-emerald-700 font-medium shadow-md' : 'hover:bg-emerald-700 hover:shadow-md'
              }`}>
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </Link>
          ))}

          {isLoggedIn ? (
            <div className="flex items-center gap-2 ml-2">
              <Link to={ROUTES.PROFILE}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  isActive(ROUTES.PROFILE) ? 'bg-white text-emerald-700 font-medium shadow-md' : 'hover:bg-emerald-700'
                }`}>
                <User className="w-4 h-4" />
                <span>{username}</span>
              </Link>
              <button onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm bg-red-500 hover:bg-red-600 transition-all">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link to={ROUTES.SIGN_IN}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ml-2 ${
                isActive(ROUTES.SIGN_IN) ? 'bg-white text-emerald-700 font-medium shadow-md' : 'bg-white/20 hover:bg-white/30'
              }`}>
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-emerald-700 transition-colors">
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden w-full px-4 pb-4 pt-2 border-t border-emerald-500 bg-gradient-to-r from-emerald-600 to-teal-700">
          <div className="flex flex-col gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path} onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(path) ? 'bg-white text-emerald-700 font-medium' : 'hover:bg-emerald-700'
                }`}>
                <Icon className="w-5 h-5" />
                <span className="text-base">{label}</span>
              </Link>
            ))}
            {isLoggedIn ? (
              <>
                <Link to={ROUTES.PROFILE} onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-700 transition">
                  <User className="w-5 h-5" />
                  <span className="text-base">{username}</span>
                </Link>
                <button onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 transition text-left">
                  <LogOut className="w-5 h-5" />
                  <span className="text-base">Logout</span>
                </button>
              </>
            ) : (
              <Link to={ROUTES.SIGN_IN} onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/20 hover:bg-white/30 transition">
                <User className="w-5 h-5" />
                <span className="text-base">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
