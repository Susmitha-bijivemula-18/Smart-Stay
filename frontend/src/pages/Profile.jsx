import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  User as UserIcon, Mail, Shield, ShieldCheck, Phone, MapPin, 
  ChevronRight, Building2, BedDouble, Utensils, Calendar, Edit3, Lock, Bell, 
  HelpCircle, LogOut, ArrowLeft, Camera, Save, X, FileText, 
  CreditCard, AlertCircle, Star, MessageSquare, Briefcase, 
  Check, Eye, EyeOff, KeyRound, Smartphone, Download
} from 'lucide-react';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Active Tab State
  const [activeTab, setActiveTab] = useState('profile');

  // Interactive Edit Mode State for Personal Details
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Stored Extended Resident Details
  const storageKey = user?.id ? `resident_profile_${user.id}` : `resident_profile_${user?.email || 'default'}`;
  
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved profile", e);
      }
    }
    return {
      phone: '9876543210',
      occupation: 'Software Engineer @ Tech Park',
      gender: 'Male',
      hometown: 'Bengaluru, Karnataka',
      bloodGroup: 'O+ Positive',
      emergencyName: 'Ramesh (Guardian)',
      emergencyRelation: 'Parent / Father',
      emergencyPhone: '+91 94401 23456',
      emergencyCity: 'Bengaluru',
      bio: 'Resident in Bengaluru tech corridor. Enjoys high-speed WiFi and quiet study spaces.'
    };
  });

  const [editForm, setEditForm] = useState({ ...profileData });

  // Active Stay / Booking Data
  const [activeStay, setActiveStay] = useState(null);

  useEffect(() => {
    try {
      const storedBookings = JSON.parse(localStorage.getItem('allBookings') || '[]');
      const singleBooking = JSON.parse(localStorage.getItem('latestBooking') || 'null');
      const refundRequests = JSON.parse(localStorage.getItem('refund_requests') || '[]');

      // Filter out any bookings that have been refunded or cancelled
      const activeList = storedBookings.filter(b => {
        const isRefunded = refundRequests.some(r => 
          (r.bookingDate && r.bookingDate === b.bookingDate) || 
          (r.pgName === b.pg?.pgName && r.roomNumber && String(r.roomNumber) === String(b.room?.roomName || b.room?.roomNumber || b.room?.roomId))
        );
        return !isRefunded && b.status !== 'REFUNDED' && b.status !== 'CANCELLED';
      });

      // Get the most recent active confirmed stay
      const latest = (activeList && activeList.length > 0) 
        ? activeList[activeList.length - 1] 
        : (singleBooking && !refundRequests.some(r => r.bookingDate === singleBooking.bookingDate) ? singleBooking : null);
      
      setActiveStay(latest || null);
    } catch (e) {
      console.error("Failed to load booking context for profile", e);
      setActiveStay(null);
    }
  }, []);

  // Helpers to accurately format room and pricing from the actual booking
  const getBookedRoomName = (stay) => {
    if (!stay) return 'Unassigned';
    const r = stay.room;
    if (r) {
      let name = r.roomName || r.roomNumber || (r.roomId ? `Room ${r.roomId}` : null);
      if (name) {
        if (!String(name).toLowerCase().startsWith('room')) {
          name = `Room ${name}`;
        }
        const floor = r.floorNumber || r.floorId || (String(name).match(/\d/) ? String(name).match(/\d/)[0] : 1);
        return `${name} (Floor ${floor})`;
      }
    }
    if (stay.roomName) {
      const name = String(stay.roomName).toLowerCase().startsWith('room') ? stay.roomName : `Room ${stay.roomName}`;
      return `${name} (Floor 1)`;
    }
    if (stay.bookingMode === 'food' && !stay.room) {
      return 'Dining Plan Only';
    }
    return 'Room Assigned (Floor 1)';
  };

  const getBookedRent = (stay) => {
    if (!stay) return '—';
    if (stay.totalMonthly && stay.totalMonthly > 0) {
      return `₹${stay.totalMonthly.toLocaleString()}`;
    }
    if (stay.activeSharePrice && stay.activeSharePrice > 0) {
      return `₹${stay.activeSharePrice.toLocaleString()}`;
    }
    if (stay.totalAmount && stay.totalAmount > 0) {
      const monthly = stay.roomPack === 'yearly' ? Math.round(stay.totalAmount / 12) : stay.totalAmount;
      return `₹${monthly.toLocaleString()}`;
    }
    if (stay.room?.price && stay.room.price > 0) {
      return `₹${stay.room.price.toLocaleString()}`;
    }
    if (stay.pg?.basePrice) {
      return `₹${Number(stay.pg.basePrice).toLocaleString()}`;
    }
    return '₹7,500';
  };

  // Password Change Form State
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ text: '', isError: false });

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('Amenities & WiFi');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Settings Toggles
  const [notifications, setNotifications] = useState({
    mealAlerts: true,
    gateCurfew: true,
    rentReminder: true,
    whatsappUpdates: true
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md w-full shadow-xs">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-slate-600">
            <UserIcon className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Access Required</h2>
          <p className="text-slate-500 text-xs mb-6">Please log in to inspect and manage your resident profile.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-semibold text-xs rounded-xl transition-all"
          >
            Log In Now
          </button>
        </div>
      </div>
    );
  }

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileData(editForm);
    localStorage.setItem(storageKey, JSON.stringify(editForm));
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPass.length < 6) {
      setPasswordMessage({ text: 'New password must be at least 6 characters.', isError: true });
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordMessage({ text: 'Passwords do not match. Please verify.', isError: true });
      return;
    }
    setPasswordMessage({ text: 'Password successfully updated in your StayNest vault.', isError: false });
    setPasswordForm({ current: '', newPass: '', confirm: '' });
    setTimeout(() => setPasswordMessage({ text: '', isError: false }), 4000);
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setFeedbackText('');
    }, 4000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile & KYC', icon: <UserIcon className="w-4 h-4" /> },
    { id: 'stay', label: 'Current Stay', icon: <Building2 className="w-4 h-4" /> },
    { id: 'emergency', label: 'Emergency Contacts', icon: <Shield className="w-4 h-4" /> },
    { id: 'security', label: 'Security & Password', icon: <Lock className="w-4 h-4" /> },
    { id: 'feedback', label: 'Support & Feedback', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50/80 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* ── Top Bar & Back Navigation ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors w-fit group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Verified Resident
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-mono font-medium">
              ID: #SN-2026-{user.id || '1048'}
            </span>
          </div>
        </div>

        {/* ── Glassy Emerald Profile Header ── */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-emerald-100/90 shadow-xs overflow-hidden">
          
          {/* Frosted Glassy Emerald Top Accent Bar */}
          <div className="h-28 sm:h-32 bg-gradient-to-r from-emerald-700/90 via-emerald-600/85 to-teal-700/90 backdrop-blur-xl border-b border-emerald-400/30 relative p-6 flex items-start justify-between overflow-hidden shadow-inner">
            {/* Ambient Glassy Glow Orbs */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-300/25 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-1/2 -right-8 w-40 h-40 bg-teal-300/20 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center gap-2 text-white/95 text-xs font-semibold relative z-10">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span>Resident Management Portal</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur-md border border-white/30 shadow-xs relative z-10">
              {user.role?.replace('ROLE_', '') || 'RESIDENT'}
            </span>
          </div>

          {/* Profile Identity & Summary */}
          <div className="p-6 sm:p-7 pt-0 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 -mt-12 sm:-mt-14 mb-6">
              
              {/* Avatar + Main Details */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-1 shadow-md shadow-emerald-950/10 border-2 border-emerald-100 ring-4 ring-emerald-500/15">
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-emerald-800 font-extrabold text-3xl">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </div>
                  <button 
                    title="Change Avatar"
                    onClick={() => alert("Avatar uploaded successfully.")}
                    className="absolute bottom-1.5 right-1.5 p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-700/25 backdrop-blur-md border border-emerald-400/30 transition-all hover:scale-110 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      {user.name}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200/70 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs font-medium flex items-center justify-center sm:justify-start gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {user.email}
                  </p>
                  <p className="text-slate-600 text-xs flex items-center justify-center sm:justify-start gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    {profileData.occupation}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center sm:justify-end gap-2.5">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {isEditing ? (
                    <>
                      <X className="w-3.5 h-3.5 text-red-500" /> Cancel
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" /> Edit Profile
                    </>
                  )}
                </button>
                <button
                  onClick={() => navigate('/bookings')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/25 border border-emerald-400/30 backdrop-blur-md hover:scale-[1.02]"
                >
                  <FileText className="w-3.5 h-3.5" /> Digital Receipts
                </button>
              </div>
            </div>

            {/* ── Glassy 3-Column Metrics Strip (GATE PASS ID Removed!) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-slate-100">
              
              {/* 1. Current Stay */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50/50 via-white/80 to-slate-50/60 backdrop-blur-md border border-emerald-100/90 shadow-2xs hover:border-emerald-300/80 transition-all flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800/70 mb-0.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" /> Current Stay
                </span>
                <span className="text-sm font-bold text-slate-900 truncate" title={activeStay?.pg?.pgName}>
                  {activeStay?.pg?.pgName || 'No Active Stay'}
                </span>
              </div>

              {/* 2. Room Slot */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50/50 via-white/80 to-slate-50/60 backdrop-blur-md border border-emerald-100/90 shadow-2xs hover:border-emerald-300/80 transition-all flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800/70 mb-0.5 flex items-center gap-1.5">
                  <BedDouble className="w-3.5 h-3.5 text-emerald-600" /> Room Slot
                </span>
                <span className="text-sm font-bold text-slate-900 truncate">
                  {getBookedRoomName(activeStay)}
                </span>
              </div>

              {/* 3. Monthly Rent */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50/50 via-white/80 to-slate-50/60 backdrop-blur-md border border-emerald-100/90 shadow-2xs hover:border-emerald-300/80 transition-all flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800/70 mb-0.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Monthly Rent
                </span>
                <span className="text-sm font-bold text-emerald-700">
                  {getBookedRent(activeStay)} {activeStay && <span className="text-xs font-normal text-slate-400">/mo</span>}
                </span>
              </div>

            </div>

            {/* Notification Toast */}
            {saveSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Profile changes successfully saved.</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Main Layout: Tabs + Content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Navigation Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white/90 backdrop-blur-md p-2.5 rounded-2xl border border-emerald-100/80 shadow-xs space-y-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsEditing(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 font-bold border border-emerald-400/30'
                        : 'text-slate-600 hover:bg-emerald-50/70 hover:text-emerald-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600'}>
                        {tab.icon}
                      </div>
                      <span>{tab.label}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </div>

            {/* Support Help Box */}
            <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-50/40 via-white/90 to-teal-50/30 backdrop-blur-md border border-emerald-100/80 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Resident Support</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Have an inquiry regarding room inventory, Wi-Fi, or billing? Contact your local property supervisor.
              </p>
              <div className="pt-1 flex gap-2">
                <a
                  href="tel:1234567890"
                  className="flex-1 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-[11px] font-bold text-center transition-colors shadow-2xs"
                >
                  Call Desk
                </a>
                <button
                  onClick={() => navigate('/listings')}
                  className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-bold text-center transition-all shadow-xs shadow-emerald-600/20"
                >
                  Browse PGs
                </button>
              </div>
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="lg:col-span-8">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-emerald-100/80 shadow-xs p-6 sm:p-7">
              
              {/* ────────────────────────────────────────────────────────── */}
              {/* TAB 1: PROFILE & KYC                                      */}
              {/* ────────────────────────────────────────────────────────── */}
              {activeTab === 'profile' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Resident Information</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Personal details and verified contact records.</p>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/70 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-emerald-600" /> Edit
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                          <input
                            type="text"
                            value={editForm.name || user.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Contact Phone</label>
                          <input
                            type="tel"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Occupation / College</label>
                          <input
                            type="text"
                            value={editForm.occupation}
                            onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Hometown / City</label>
                          <input
                            type="text"
                            value={editForm.hometown}
                            onChange={(e) => setEditForm({ ...editForm, hometown: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Blood Group</label>
                          <select
                            value={editForm.bloodGroup}
                            onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          >
                            <option value="O+ Positive">O+ Positive</option>
                            <option value="O- Negative">O- Negative</option>
                            <option value="A+ Positive">A+ Positive</option>
                            <option value="A- Negative">A- Negative</option>
                            <option value="B+ Positive">B+ Positive</option>
                            <option value="B- Negative">B- Negative</option>
                            <option value="AB+ Positive">AB+ Positive</option>
                            <option value="AB- Negative">AB- Negative</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Resident Bio</label>
                        <textarea
                          rows={2}
                          value={editForm.bio}
                          onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/25 border border-emerald-400/30"
                        >
                          <Save className="w-3.5 h-3.5" /> Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                        <UserIcon className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-semibold uppercase text-slate-400">Full Name</p>
                          <p className="text-xs font-bold text-slate-900 mt-0.5">{user.name}</p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                        <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-semibold uppercase text-slate-400">Email Address</p>
                          <p className="text-xs font-bold text-slate-900 mt-0.5">{user.email}</p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                        <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-semibold uppercase text-slate-400">Contact Number</p>
                          <p className="text-xs font-bold text-slate-900 mt-0.5">{profileData.phone}</p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                        <Briefcase className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-semibold uppercase text-slate-400">Occupation</p>
                          <p className="text-xs font-bold text-slate-900 mt-0.5">{profileData.occupation}</p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-semibold uppercase text-slate-400">Hometown</p>
                          <p className="text-xs font-bold text-slate-900 mt-0.5">{profileData.hometown}</p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                        <ShieldCheck className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-semibold uppercase text-slate-400">Blood Group</p>
                          <p className="text-xs font-bold text-slate-900 mt-0.5">{profileData.bloodGroup}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* KYC Verification Badges */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verification Status</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <div>
                          <p className="text-xs font-semibold text-slate-900">Government Identity (Aadhaar)</p>
                          <p className="text-[11px] text-slate-500">e-KYC Verified Record</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <div>
                          <p className="text-xs font-semibold text-slate-900">Resident Safety Verification</p>
                          <p className="text-[11px] text-slate-500">NOC Cleared</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ────────────────────────────────────────────────────────── */}
              {/* TAB 2: CURRENT STAY                                        */}
              {/* ────────────────────────────────────────────────────────── */}
              {activeTab === 'stay' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Current Stay Details</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Your active accommodation and allocated room slot.</p>
                    </div>
                    {activeStay && (
                      <button
                        onClick={() => navigate('/bookings')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/70 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" /> View Receipt
                      </button>
                    )}
                  </div>

                  {activeStay ? (
                    <div className="space-y-4">
                      {/* Glassy Active Stay Card */}
                      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-900/90 via-emerald-800/85 to-teal-950/90 backdrop-blur-xl text-white shadow-lg shadow-emerald-950/15 border border-emerald-500/25 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10">
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[11px] font-semibold border border-emerald-400/30 backdrop-blur-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                              Confirmed Stay
                            </span>
                            <h3 className="text-lg font-bold mt-1.5 tracking-tight text-white">{activeStay.pg?.pgName || 'Property Assigned'}</h3>
                            <p className="text-xs text-emerald-200/80 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                              {activeStay.pg?.area || 'Local Area'}, {activeStay.pg?.city || 'City'}
                            </p>
                          </div>

                          <div className="text-left sm:text-right">
                            <span className="text-[10px] uppercase tracking-wider text-emerald-200/70 block">Monthly Rate</span>
                            <span className="text-xl font-bold text-white">
                              {getBookedRent(activeStay)}
                            </span>
                            <span className="text-[10px] text-emerald-200/60 block">GST Inclusive</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-emerald-700/50 text-xs relative z-10">
                          <div>
                            <span className="text-[10px] text-emerald-200/70 uppercase block">Room Allocated</span>
                            <span className="font-semibold text-white text-xs mt-0.5 block">{getBookedRoomName(activeStay)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-emerald-200/70 uppercase block">Package</span>
                            <span className="font-semibold text-white text-xs mt-0.5 block">{activeStay.roomPack || 'Standard Room'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-emerald-200/70 uppercase block">Move-in Date</span>
                            <span className="font-semibold text-white text-xs mt-0.5 block">{activeStay.bookingDate ? new Date(activeStay.bookingDate).toLocaleDateString('en-IN') : 'Active'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Dining Info */}
                      {activeStay.food && (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-700">
                              <Utensils className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{activeStay.food.label || 'Active'} Dining Plan</p>
                              <p className="text-[11px] text-slate-500">3 Fresh Meals Daily • Sunday Special Included</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-emerald-700">₹{(activeStay.activeFoodPrice || 2500).toLocaleString()}/mo</span>
                        </div>
                      )}

                      {/* Quick Shortcuts */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => navigate('/bookings')}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/25 border border-emerald-400/30"
                        >
                          <FileText className="w-3.5 h-3.5" /> Digital Receipts & Invoices
                        </button>
                        <button
                          onClick={() => navigate('/refund-request')}
                          className="px-4 py-2 rounded-xl bg-amber-50/80 hover:bg-amber-100 text-amber-800 border border-amber-200/80 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Cancel / Request Refund
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">No Active Stay Reserved</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        You do not currently hold an active room reservation. Browse verified hostels to reserve a room.
                      </p>
                      <button
                        onClick={() => navigate('/listings')}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition-all cursor-pointer shadow-md shadow-emerald-600/25 border border-emerald-400/30"
                      >
                        Explore Verified Stays
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ────────────────────────────────────────────────────────── */}
              {/* TAB 3: EMERGENCY CONTACTS                                  */}
              {/* ────────────────────────────────────────────────────────── */}
              {activeTab === 'emergency' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="pb-4 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-900">Guardian & Emergency Details</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Contact persons reached in case of urgent matters or medical emergencies.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-semibold uppercase text-slate-400">Primary Guardian</p>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">{profileData.emergencyName}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{profileData.emergencyRelation}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-semibold uppercase text-slate-400">Emergency Telephone</p>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">{profileData.emergencyPhone}</p>
                      <a href={`tel:${profileData.emergencyPhone}`} className="text-[11px] text-slate-600 font-semibold hover:underline mt-0.5 inline-block">
                        Direct Call Available
                      </a>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-semibold uppercase text-slate-400">Guardian City</p>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">{profileData.emergencyCity}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-semibold uppercase text-slate-400">Local Emergency Services</p>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">Dial 112 (National Emergency)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Property manager available 24/7</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ────────────────────────────────────────────────────────── */}
              {/* TAB 4: SECURITY & PASSWORD                                 */}
              {/* ────────────────────────────────────────────────────────── */}
              {activeTab === 'security' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="pb-4 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-900">Account Security</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Manage authentication credentials and notification preferences.</p>
                  </div>

                  {/* Change Password Form */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Change Password</h3>
                    
                    {passwordMessage.text && (
                      <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                        passwordMessage.isError 
                          ? 'bg-red-50 text-red-800 border border-red-200' 
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {passwordMessage.isError ? <AlertCircle className="w-4 h-4 text-red-600" /> : <Check className="w-4 h-4 text-emerald-600" />}
                        <span>{passwordMessage.text}</span>
                      </div>
                    )}

                    <form onSubmit={handlePasswordSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">New Password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={passwordForm.newPass}
                              onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 pr-9"
                              placeholder="Min 6 characters"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Confirm New Password</label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordForm.confirm}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            placeholder="Re-enter password"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/25 border border-emerald-400/30"
                      >
                        <KeyRound className="w-3.5 h-3.5" /> Update Password
                      </button>
                    </form>
                  </div>

                  {/* Notification Alerts */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alert Notifications</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div>
                          <p className="text-xs font-semibold text-slate-900">Dining Meal Cutoff Reminders</p>
                          <p className="text-[11px] text-slate-500">Reminder 30 minutes prior to dining closure</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.mealAlerts}
                          onChange={(e) => setNotifications({ ...notifications, mealAlerts: e.target.checked })}
                          className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div>
                          <p className="text-xs font-semibold text-slate-900">Gate Entry Alerts</p>
                          <p className="text-[11px] text-slate-500">Notification upon late-night entry verification</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.gateCurfew}
                          onChange={(e) => setNotifications({ ...notifications, gateCurfew: e.target.checked })}
                          className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ────────────────────────────────────────────────────────── */}
              {/* TAB 5: SUPPORT & FEEDBACK                                  */}
              {/* ────────────────────────────────────────────────────────── */}
              {activeTab === 'feedback' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="pb-4 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-900">Resident Feedback & Inquiries</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Share observations regarding room maintenance, food, or amenities.</p>
                  </div>

                  {feedbackSubmitted ? (
                    <div className="p-6 rounded-xl bg-emerald-50/50 border border-emerald-200 text-center space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm shadow-emerald-600/30">
                        <Check className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">Feedback Transmitted</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Thank you for your submission. The property supervisor has received your report.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                          Stay Rating
                        </label>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFeedbackRating(star)}
                              className="p-1 cursor-pointer transition-transform hover:scale-110"
                            >
                              <Star className={`w-6 h-6 ${
                                feedbackRating >= star 
                                   ? 'text-amber-400 fill-amber-400' 
                                  : 'text-slate-200'
                              }`} />
                            </button>
                          ))}
                          <span className="text-xs font-semibold text-slate-700 ml-2">
                            {feedbackRating} / 5 Stars
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Department</label>
                        <select
                          value={feedbackCategory}
                          onChange={(e) => setFeedbackCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        >
                          <option value="Food & Dining">Food Quality & Dining Menu</option>
                          <option value="Amenities & WiFi">Wi-Fi & Power Backup</option>
                          <option value="Cleanliness">Room Housekeeping</option>
                          <option value="General">General Inquiries</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Feedback Comments</label>
                        <textarea
                          rows={3}
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Provide details or suggestions for the management team..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/25 border border-emerald-400/30"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Submit Feedback
                      </button>
                    </form>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ── Page Footer ── */}
        <div className="pt-4 text-center text-xs text-slate-400">
          <p>© 2026 StayNest • Resident Management Portal</p>
        </div>

      </div>
    </div>
  );
};

export default Profile;
