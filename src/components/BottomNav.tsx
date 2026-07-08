import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, MessageSquare, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface dark:bg-[#1E293B] border-t border-outline-variant/10 pb-safe pt-2 px-2 shadow-[0_-4px_20px_-2px_rgba(28,43,34,0.08)] transition-colors">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center px-4 py-1 rounded-full transition-all ${
            isActive
              ? 'bg-primary-container/20 text-primary dark:text-primary-fixed font-semibold scale-105'
              : 'text-on-surface-variant dark:text-inverse-on-surface/70 hover:text-primary'
          }`
        }
      >
        <Home className="w-6 h-6" />
        <span className="text-[10px] mt-0.5">Home</span>
      </NavLink>

      <NavLink
        to="/bookings"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center px-4 py-1 rounded-full transition-all ${
            isActive
              ? 'bg-primary-container/20 text-primary dark:text-primary-fixed font-semibold scale-105'
              : 'text-on-surface-variant dark:text-inverse-on-surface/70 hover:text-primary'
          }`
        }
      >
        <Calendar className="w-6 h-6" />
        <span className="text-[10px] mt-0.5">Bookings</span>
      </NavLink>

      <NavLink
        to="/inbox"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center px-4 py-1 rounded-full transition-all ${
            isActive
              ? 'bg-primary-container/20 text-primary dark:text-primary-fixed font-semibold scale-105'
              : 'text-on-surface-variant dark:text-inverse-on-surface/70 hover:text-primary'
          }`
        }
      >
        <MessageSquare className="w-6 h-6" />
        <span className="text-[10px] mt-0.5">Messages</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center px-4 py-1 rounded-full transition-all ${
            isActive
              ? 'bg-primary-container/20 text-primary dark:text-primary-fixed font-semibold scale-105'
              : 'text-on-surface-variant dark:text-inverse-on-surface/70 hover:text-primary'
          }`
        }
      >
        <User className="w-6 h-6" />
        <span className="text-[10px] mt-0.5">Profile</span>
      </NavLink>
    </nav>
  );
};
