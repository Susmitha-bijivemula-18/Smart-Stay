import React, { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, Search, LayoutDashboard, ReceiptText, User } from 'lucide-react';

const BottomNav = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Hide on desktop
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[1000] bg-white border-t border-slate-200">
      <div className="relative bg-white pt-3 pb-[calc(1rem+env(safe-area-inset-bottom,12px))] px-4">
        <div className="flex items-center justify-around">
          {/* Home */}
          <NavLink 
            to="/" 
            className={({ isActive }) => `flex flex-col items-center gap-1 flex-1 transition-all ${isActive ? 'text-brand-600' : 'text-slate-400'}`}
          >
            <Home className={`w-5 h-5 ${location.pathname === '/' ? 'fill-brand-600/10' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-tight">Home</span>
          </NavLink>

          {/* Listings */}
          <NavLink 
            to="/listings" 
            className={({ isActive }) => `flex flex-col items-center gap-1 flex-1 transition-all ${isActive ? 'text-brand-600' : 'text-slate-400'}`}
          >
            <Search className={`w-5 h-5 ${location.pathname === '/listings' ? 'fill-brand-600/10' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-tight">Listings</span>
          </NavLink>

          {/* Dashboard / Admin */}
          <NavLink 
            to={user ? (user.role === 'ROLE_ADMIN' ? '/admin' : '/dashboard') : '/login'} 
            className={({ isActive }) => `flex flex-col items-center gap-1 flex-1 transition-all ${isActive ? 'text-brand-600' : 'text-slate-400'}`}
          >
            <LayoutDashboard className={`w-5 h-5 ${location.pathname === '/dashboard' || location.pathname === '/admin' ? 'fill-brand-600/10' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-tight">{user ? 'Dashboard' : 'Login'}</span>
          </NavLink>

          {/* Bookings */}
          {user && (
            <NavLink 
              to="/bookings" 
              className={({ isActive }) => `flex flex-col items-center gap-1 flex-1 transition-all ${isActive ? 'text-brand-600' : 'text-slate-400'}`}
            >
              <ReceiptText className={`w-5 h-5 ${location.pathname === '/bookings' ? 'fill-brand-600/10' : ''}`} />
              <span className="text-[10px] font-black uppercase tracking-tight">Bookings</span>
            </NavLink>
          )}
        </div>
      </div>
      
      {/* THE IRON CURTAIN: Extends 100px below the screen to kill any scrolling gaps */}
      <div className="absolute top-[98%] left-0 right-0 h-[100px] bg-white border-none outline-none" style={{ background: '#ffffff' }} />
    </div>
  );
};

export default BottomNav;
