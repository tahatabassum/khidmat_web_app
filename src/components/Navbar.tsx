import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Search, Mic, User as UserIcon, LogOut, ChevronDown, Calendar, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { writeDocument } from '../firebase';
import { Avatar } from './SharedUI';

interface NavbarProps {
  onSearch?: (query: string) => void;
  onVoiceTrigger?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch, onVoiceTrigger }) => {
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  // Sync state with userProfile availability
  useEffect(() => {
    if (userProfile && userProfile.role === 'provider') {
      setIsAvailable(userProfile.available !== false);
    }
  }, [userProfile]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleToggleAvailability = async () => {
    if (!user || !userProfile) return;
    const newStatus = !isAvailable;
    setIsAvailable(newStatus);
    
    try {
      // Update users collection document
      await writeDocument('users', user.uid, {
        ...userProfile,
        available: newStatus
      });
      
      // Update providers collection document
      await writeDocument('providers', user.uid, {
        userId: user.uid,
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
        city: userProfile.city,
        location: userProfile.location,
        category: userProfile.category || '',
        bio: userProfile.bio || '',
        basePrice: userProfile.basePrice || 0,
        rating: userProfile.rating || 5.0,
        totalJobs: userProfile.totalJobs || 0,
        tier: userProfile.tier || 'Bronze',
        available: newStatus
      });
      
      console.log(`[Status] Availability toggled successfully to: ${newStatus ? 'ONLINE' : 'OFFLINE'}`);
    } catch (err) {
      console.error("Failed to toggle provider availability status:", err);
      // Rollback UI state on failure
      setIsAvailable(!newStatus);
    }
  };

  const handleLogoutClick = async () => {
    setShowDropdown(false);
    try {
      await logout();
      navigate('/auth');
    } catch (err) {
      console.error("Failed to log out:", err);
    }
  };

  const handleViewProfileClick = () => {
    setShowDropdown(false);
    navigate('/profile');
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop py-3 bg-[#FAFAF5] dark:bg-[#1E293B] shadow-soft border-b border-outline-variant/10 transition-colors">
      <div className="flex items-center gap-lg w-full max-w-container-max mx-auto">
        {/* Brand Logo */}
        <a href="/" className="flex items-center shrink-0">
          <span className="font-headline-lg text-headline-lg font-bold text-[#006e2f] dark:text-[#6bff8f] tracking-tight">
            Khidmat
            <span className="text-[0.6em] align-super text-secondary dark:text-secondary-container ml-0.5 font-semibold">
              خدمت
            </span>
          </span>
        </a>

        {/* Search Bar (Desktop only, hides on mobile screen) */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-2xl relative items-center ml-auto">
          <div className="relative w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline dark:text-outline-variant/60 flex items-center">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-slate-100 dark:bg-[#334155] border-none rounded-full py-3 pl-12 pr-12 focus:ring-2 focus:ring-primary dark:focus:ring-primary-fixed transition-all text-on-surface dark:text-[#F8FAFC] outline-none"
              placeholder="Search for home services..."
            />
            <button
              type="button"
              onClick={onVoiceTrigger}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary-container/20 text-primary dark:text-primary-fixed transition-colors active:scale-95"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Trailing Actions */}
        <div className="flex items-center gap-md ml-auto md:ml-0">
          
          {/* Provider Online/Offline Status Switch (InDrive style) */}
          {userProfile?.role === 'provider' && (
            <div className="flex items-center gap-2 mr-2">
              <span className={`w-2.5 h-2.5 rounded-full transition-all ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <button
                type="button"
                onClick={handleToggleAvailability}
                className={`text-[10px] font-bold py-1.5 px-3 rounded-full border transition-all active:scale-95 ${
                  isAvailable 
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400' 
                    : 'bg-slate-100 dark:bg-slate-800 text-on-surface-variant dark:text-slate-400 border-outline-variant/30 dark:border-slate-700'
                }`}
              >
                {isAvailable ? 'ONLINE' : 'OFFLINE'}
              </button>
            </div>
          )}

          {/* Desktop Navigation Links */}
          {userProfile && (
            <div className="hidden md:flex items-center gap-sm mr-2 border-r border-[#E2E8F0] dark:border-[#334155] pr-4">
              <button
                onClick={() => navigate('/bookings')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-705 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-primary" />
                <span>Bookings</span>
              </button>
              <button
                onClick={() => navigate('/inbox')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-705 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-primary" />
                <span>Messages</span>
              </button>
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant dark:text-inverse-on-surface hover:bg-surface-container-low dark:hover:bg-[#334155] transition-colors active:scale-95"
            aria-label="Toggle Theme"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-tertiary-fixed-dim" />
            ) : (
              <Moon className="w-5 h-5 text-on-surface-variant" />
            )}
          </button>

          {/* User Profile Avatar with dropdown */}
          {userProfile && (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1 focus:outline-none"
              >
                <Avatar
                  src={userProfile.photoURL}
                  name={userProfile.name}
                  className="w-10 h-10 shadow-soft cursor-pointer active:scale-95 transition-transform"
                />
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
              </button>

              {showDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800">
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Account</p>
                      <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{userProfile.name}</p>
                    </div>
                    <button
                      onClick={handleViewProfileClick}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800/50 flex items-center gap-2 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      View Profile
                    </button>
                    <button
                      onClick={handleLogoutClick}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 transition-colors border-t border-gray-100 dark:border-slate-800"
                    >
                      <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
