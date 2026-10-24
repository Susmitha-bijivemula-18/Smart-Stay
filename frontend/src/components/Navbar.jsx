import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Home, Building2, LogOut, LayoutDashboard, Menu, X, User, 
  ChevronDown, ShieldCheck, ReceiptText, IndianRupee, Search, 
  ArrowRight
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAdminPage = location.pathname.startsWith('/admin');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const profileRef = useRef(null);

  // Detect whether user has scrolled past the hero section on the home page
  useEffect(() => {
    const handleScroll = () => {
      if (isHomePage) {
        // Hero is 100vh; trigger transition slightly before leaving hero
        const heroHeight = window.innerHeight || 650;
        setIsScrolledPastHero(window.scrollY > (heroHeight - 90));
      } else {
        setIsScrolledPastHero(true);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isHomePage]);

  // Click outside listener so profile dropdown closes cleanly
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setIsProfileOpen(false);
  };

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Listings', path: '/listings', icon: Building2 },
    ...(user ? [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Booking', path: '/bookings', icon: ReceiptText },
    ] : [])
  ];

  // When on the Home page AND at the top (over the hero photo), use dark/transparent glass.
  // The moment user scrolls past the hero into the white content sections, smoothly switch to luxury white glass!
  const isDarkHeroNav = isHomePage && !isScrolledPastHero;

  return (
    <nav 
      className={`${
        isHomePage 
          ? `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
              isDarkHeroNav
                ? 'bg-gradient-to-b from-black/75 via-black/25 to-transparent backdrop-blur-xs border-b border-white/10'
                : 'bg-white/95 backdrop-blur-2xl border-b border-slate-200/80 shadow-sm text-slate-900'
            }` 
          : 'sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-2xs transition-all duration-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20 transition-all duration-200">

          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group select-none">
              {/* Small Glassy Single-Line House Emblem */}
              <div className={`relative flex items-center justify-center w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl backdrop-blur-md transition-all duration-300 group-hover:scale-105 border ${
                isDarkHeroNav 
                  ? 'bg-white/10 border-white/20 text-emerald-400 shadow-sm shadow-black/20 group-hover:bg-white/15 group-hover:border-emerald-400/40' 
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 shadow-2xs group-hover:bg-emerald-500/15 group-hover:border-emerald-500/35'
              }`}>
                {/* Pure Single-Line House Icon (Clean line only, not double, delicate) */}
                <svg 
                  className="w-4.5 h-4.5 drop-shadow-xs" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M3 10.5L12 3L21 10.5V20C21 20.6 20.6 21 20 21H4C3.4 21 3 20.6 3 20V10.5Z" />
                  <path d="M9 21V13H15V21" />
                </svg>
              </div>
              
              {/* Brand Typography (Crisp White & Vibrant Emerald) */}
              <div className="flex items-center">
                <span className={`font-display font-black text-2xl sm:text-[26px] tracking-[-0.03em] transition-colors duration-200 ${
                  isDarkHeroNav ? 'text-white' : 'text-slate-900'
                }`}>
                  Stay
                </span>
                <span className={`font-display font-black text-2xl sm:text-[26px] tracking-[-0.03em] transition-all duration-200 ${
                  isDarkHeroNav 
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300' 
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600'
                }`}>
                  Nest
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5">
            {isAdminPage ? (
              <div className="flex items-center gap-2">
                <Link 
                  to="/admin" 
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/70 shadow-2xs"
                >
                  <ShieldCheck className="h-4 w-4 text-indigo-600" /> Admin Console
                </Link>
                <Link 
                  to="/" 
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" /> User View
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  if (isDarkHeroNav) {
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 select-none ${
                          isActive
                            ? 'bg-white/15 text-white border border-white/25 shadow-sm backdrop-blur-md'
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-white/60'}`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  }

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 select-none ${
                        isActive 
                          ? 'bg-slate-100 text-slate-950 font-black border border-slate-200/80 shadow-2xs' 
                          : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/70'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {user && (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN') && (
                  <Link 
                    to="/admin" 
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ml-1 transition-colors ${
                      isDarkHeroNav 
                        ? 'text-indigo-300 hover:text-white hover:bg-white/10 border border-indigo-400/30' 
                        : 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50'
                    }`}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" /> Admin
                  </Link>
                )}
              </div>
            )}

            <div className={`h-6 w-px mx-2 transition-colors duration-200 ${isDarkHeroNav ? 'bg-white/20' : 'bg-slate-200'}`} />
            
            {user ? (
              <div className="relative" ref={profileRef}>
                {/* Profile Trigger */}
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full border transition-all duration-200 cursor-pointer select-none ${
                    isDarkHeroNav
                      ? (isProfileOpen 
                          ? 'bg-white/25 border-white/40 shadow-inner' 
                          : 'bg-white/10 border-white/20 hover:bg-white/15 text-white shadow-sm backdrop-blur-md')
                      : (isProfileOpen 
                          ? 'bg-slate-100 border-slate-300 shadow-inner ring-2 ring-emerald-500/10' 
                          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 shadow-2xs hover:shadow-xs')
                  }`}
                  aria-expanded={isProfileOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-xs flex items-center justify-center shadow-xs ring-1 ring-white/50">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  
                  <div className="text-left hidden lg:block leading-tight">
                    <p className={`text-xs font-black truncate max-w-[110px] transition-colors duration-200 ${
                      isDarkHeroNav ? 'text-white' : 'text-slate-800'
                    }`}>{user.name}</p>
                    <p className={`text-[9px] font-bold uppercase tracking-wider leading-none transition-colors duration-200 ${
                      isDarkHeroNav ? 'text-emerald-300' : 'text-emerald-600'
                    }`}>Resident</p>
                  </div>
                  
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${
                    isDarkHeroNav ? 'text-white/70' : 'text-slate-400'
                  } ${isProfileOpen ? 'rotate-180 text-white' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2.5 w-72 bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl shadow-2xl shadow-slate-900/20 p-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right text-slate-900">
                      {/* Header with Avatar & Details */}
                      <div className="p-3.5 bg-gradient-to-br from-slate-50 to-slate-100/70 rounded-xl border border-slate-200/60 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-emerald-500/20 ring-1 ring-white shrink-0">
                            {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-slate-900 truncate">{user.name}</p>
                            <p className="text-[11px] font-medium text-slate-500 truncate">{user.email || 'Resident Account'}</p>
                            <div className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                              <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" /> Active Member
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Links */}
                      <div className="space-y-0.5">
                        <Link 
                          to="/profile" 
                          onClick={() => setIsProfileOpen(false)} 
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all group"
                        >
                          <span className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-white text-slate-600 flex items-center justify-center transition-colors shadow-2xs">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            Profile Settings
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </Link>

                        <Link 
                          to="/bookings" 
                          onClick={() => setIsProfileOpen(false)} 
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all group"
                        >
                          <span className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-white text-slate-600 flex items-center justify-center transition-colors shadow-2xs">
                              <ReceiptText className="w-3.5 h-3.5" />
                            </div>
                            My Bookings &amp; Slips
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </Link>

                        <Link 
                          to="/refund-request" 
                          onClick={() => setIsProfileOpen(false)} 
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all group"
                        >
                          <span className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-white text-slate-600 flex items-center justify-center transition-colors shadow-2xs">
                              <IndianRupee className="w-3.5 h-3.5" />
                            </div>
                            Refund Request
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </Link>

                        <div className="h-px bg-slate-200/70 my-1.5 mx-2" />

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer group"
                        >
                          <span className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-rose-100/60 group-hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors">
                              <LogOut className="w-3.5 h-3.5" />
                            </div>
                            Sign Out Session
                          </span>
                        </button>
                      </div>
                    </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login"
                className={`px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all active:scale-95 ${
                  isDarkHeroNav
                    ? 'bg-white text-slate-950 hover:bg-slate-100 shadow-md'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                }`}
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center md:hidden">
            <button 
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer border ${
                mobileMenuOpen
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/25'
                  : isDarkHeroNav 
                    ? 'bg-white/10 hover:bg-white/15 text-white border-white/20 backdrop-blur-md' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 shadow-2xs'
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 transition-transform duration-200 rotate-90" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          {/* Backdrop with smooth blur */}
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          
          <div className="fixed inset-x-3.5 top-18 z-50 max-h-[calc(100vh-5.5rem)] overflow-y-auto rounded-3xl bg-[#0d151c]/95 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/80 p-3.5 text-white animate-in fade-in slide-in-from-top-3 zoom-in-95 duration-200 hide-scrollbar">
            {user ? (
              <div className="space-y-3">
                {/* ── User Profile Badge (Tappable) ── */}
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all duration-200 group active:scale-[0.99]"
                >
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/30">
                      {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0d151c]" />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-white tracking-tight truncate group-hover:text-emerald-300 transition-colors">
                        {user.name || 'Resident'}
                      </p>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {user.email || 'Resident Member'}
                    </p>
                    <div className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/25">
                      Active Resident
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>

                {/* ── Main Navigation Group ── */}
                <div className="space-y-1">
                  <div className="px-2 pt-1 pb-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      Navigation
                    </span>
                  </div>

                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 group select-none ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent text-white border border-emerald-500/30 shadow-sm'
                            : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                            isActive
                              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                              : 'bg-white/[0.06] text-slate-400 group-hover:text-white group-hover:bg-white/[0.1]'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="tracking-wide text-xs">{item.label}</span>
                        </div>

                        {isActive ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                            Active
                          </span>
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-600 group-hover:text-slate-400 transition-transform" />
                        )}
                      </Link>
                    );
                  })}

                  {/* Admin link if applicable */}
                  {user && (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN') && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10 transition-all duration-150 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8.5 h-8.5 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span className="tracking-wide text-xs">Admin Console</span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-indigo-500" />
                    </Link>
                  )}
                </div>

                {/* ── Resident Services Group ── */}
                <div className="pt-2 border-t border-white/[0.08] space-y-1">
                  <div className="px-2 pt-1 pb-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      Resident Services
                    </span>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 group ${
                      location.pathname === '/profile'
                        ? 'bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent text-white border border-emerald-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        location.pathname === '/profile'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white/[0.06] text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/15'
                      }`}>
                        <User className="w-4 h-4" />
                      </div>
                      <span className="tracking-wide text-xs">Profile Settings</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-600 group-hover:text-slate-400 transition-transform" />
                  </Link>

                  <Link
                    to="/refund-request"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 group ${
                      location.pathname === '/refund-request'
                        ? 'bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent text-white border border-emerald-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        location.pathname === '/refund-request'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white/[0.06] text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/15'
                      }`}>
                        <IndianRupee className="w-4 h-4" />
                      </div>
                      <span className="tracking-wide text-xs">Refund Request</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-600 group-hover:text-slate-400 transition-transform" />
                  </Link>
                </div>

                {/* ── Sign Out Session ── */}
                <div className="pt-2 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 transition-all duration-150 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8.5 h-8.5 rounded-xl bg-rose-500/15 text-rose-400 group-hover:bg-rose-500/25 flex items-center justify-center shrink-0 transition-colors">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <span className="tracking-wide text-xs">Sign Out</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-rose-500/60 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2 space-y-3">
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 select-none ${
                          isActive
                            ? 'bg-emerald-500/20 text-white border border-emerald-500/30'
                            : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : 'bg-white/[0.06] text-slate-400'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="tracking-wide text-xs">{item.label}</span>
                        </div>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                      </Link>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-white/[0.08] grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/10 font-bold text-xs text-center tracking-wider transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs text-center tracking-wider shadow-lg shadow-emerald-600/25 transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
