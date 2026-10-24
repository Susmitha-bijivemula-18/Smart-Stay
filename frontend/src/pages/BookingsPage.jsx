import React, { useState, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BedDouble, Utensils, Download, Share2, CheckCircle2,
  MapPin, User, Phone, Calendar, CalendarDays, ArrowLeft,
  Sparkles, Copy, Check, FileText, X, ChevronDown, Building, ChevronRight,
  QrCode, ShieldCheck, Scissors, Receipt, IndianRupee, ReceiptText, Printer
} from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useContext, useEffect } from 'react';

/* ─── Helpers ───────────────────────────── */
const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const addYear = (date) => {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + 1);
  d.setDate(d.getDate() - 1);
  return d;
};

const fmtDate = (date) =>
  date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

/* ─── Clean Receipt Line Item with Dynamic CSS Hover Animations ─── */
const ReceiptRow = ({
  icon: Icon,
  title,
  dateString,
  badgeText,
  amount,
  period = '/mo',
  actionText = 'View Receipt',
  isRefund = false,
  cascadeClass = '',
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 sm:px-6 flex items-center justify-between transition-all duration-300 ease-out cursor-pointer group relative overflow-hidden select-none active:scale-[0.995] active:bg-slate-100/70 ${
        isRefund 
          ? 'bg-amber-50/20 hover:bg-gradient-to-r hover:from-amber-50/60 hover:via-amber-50/30 hover:to-transparent' 
          : 'bg-white hover:bg-gradient-to-r hover:from-emerald-50/35 hover:via-white hover:to-slate-50/60'
      } ${cascadeClass}`}
    >
      {/* Dynamic Animated Indicator Bar on Left */}
      <span className={`receipt-indicator-bar ${isRefund ? 'is-amber' : ''}`} />

      {/* Dynamic Shimmer Light Sweep on Hover */}
      <div className="shimmer-sweep-layer" />

      {/* Left Content */}
      <div className="flex items-center gap-3.5 min-w-0 pr-2 z-10">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:rotate-[-2deg] ${
          isRefund 
            ? 'bg-amber-100 text-amber-800 group-hover:bg-amber-200 group-hover:shadow-sm group-hover:shadow-amber-500/20' 
            : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-100/90 group-hover:text-emerald-800 group-hover:shadow-sm group-hover:shadow-emerald-500/20'
        }`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-105" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors duration-200 truncate">
              {title}
            </span>
            {badgeText && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all duration-200 group-hover:scale-105 ${
                isRefund 
                  ? 'bg-amber-100 text-amber-800 border border-amber-200/80 group-hover:border-amber-300' 
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/70 group-hover:border-emerald-400 group-hover:bg-emerald-100/70'
              }`}>
                {badgeText}
              </span>
            )}
            {dateString && (
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                • {dateString}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0 pl-2 z-10">
        {amount !== undefined && amount !== null && (
          <div className="text-right transition-transform duration-200 group-hover:scale-105">
            <span className={`text-sm sm:text-base font-bold transition-colors duration-200 ${
              isRefund 
                ? 'text-emerald-700 group-hover:text-emerald-800' 
                : 'text-slate-900 group-hover:text-emerald-700'
            }`}>
              {isRefund ? `+₹${amount.toLocaleString()}` : `₹${amount.toLocaleString()}`}
            </span>
            {period && <span className="text-xs text-slate-400 font-normal ml-0.5">{period}</span>}
          </div>
        )}

        {/* View Receipt Pill Button with Chevron Slide */}
        <div className="flex items-center text-xs font-semibold text-slate-400 group-hover:text-emerald-700 px-2 py-1 rounded-lg transition-all duration-200 group-hover:bg-emerald-50/90 group-hover:border group-hover:border-emerald-200/70">
          <span className="hidden md:inline mr-1">{actionText}</span>
          <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 text-slate-300 group-hover:text-emerald-600" />
        </div>
      </div>
    </div>
  );
};


/* ─── Modal Shell ───────────────────────── */
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 print:p-0 print:relative print:z-auto">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm print:hidden" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl animate-in zoom-in-95 duration-200 hide-scrollbar print:max-h-none print:shadow-none print:overflow-visible">
        {/* Modern Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-50 w-8 h-8 sm:w-10 sm:h-10 bg-slate-900/40 sm:bg-white/20 hover:bg-slate-900/60 sm:hover:bg-white/40 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all print:hidden shadow-lg border border-white/20"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        {children}
      </div>
    </div>
  );
};

/* ─── Main ──────────────────────────────── */
const BookingsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [serverBookings, setServerBookings] = useState([]);
  
  const stateBooking = location.state?.booking;
  const allBookingsStr = localStorage.getItem('allBookings');
  let allBookings = [];
  try {
    allBookings = allBookingsStr ? JSON.parse(allBookingsStr) : [];
  } catch (e) {
    console.error("Failed to parse allBookings", e);
  }
  
  if (allBookings.length === 0) {
    if (stateBooking) {
      allBookings = [stateBooking];
    } else {
      const latestBookingStr = localStorage.getItem('latestBooking');
      if (latestBookingStr) {
        try {
          allBookings = [JSON.parse(latestBookingStr)];
        } catch (e) {
          console.error("Failed to parse latestBooking", e);
        }
      }
    }
  }

  // Filter local bookings by user email for privacy
  allBookings = allBookings.filter(b => 
    b.userEmail === user?.email || 
    b.userDetails?.email === user?.email
  );

  const allRefundsStr = localStorage.getItem('refund_requests');
  let allRefunds = [];
  try {
    allRefunds = allRefundsStr ? JSON.parse(allRefundsStr) : [];
  } catch (e) {
    console.error("Failed to parse refund_requests", e);
  }

  // Filter local refunds by user email for privacy
  allRefunds = allRefunds.filter(r => r.userEmail === user?.email);

  // Effect to fetch all bookings from server
  useEffect(() => {
    const fetchAllBookings = async () => {
      try {
        const response = await api.get('/sync/bookings');
        if (response.data && Array.isArray(response.data)) {
          // Filter by current user email to ensure privacy
          const filtered = response.data.filter(b => 
            b.userDetails?.email === user?.email || 
            (b.userDetails?.email && user?.email && b.userDetails.email.toLowerCase() === user.email.toLowerCase())
          );
          setServerBookings(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch server bookings:", err);
      }
    };
    if (user?.email) {
      fetchAllBookings();
    }
  }, [user?.email]);

  // Combine Local + State + Server (using Set/ID for uniqueness)
  const combinedBookings = useMemo(() => {
    const map = new Map();
    
    // 1. Add server bookings first (source of truth)
    serverBookings.forEach(b => {
      const key = `${b.pg?.pgName}-${b.bookingDate}`;
      map.set(key, b);
    });

    // 2. Add local storage bookings (fallback/offline)
    allBookings.forEach(b => {
      const key = `${b.pg?.pgName}-${b.bookingDate}`;
      if (!map.has(key)) map.set(key, b);
    });

    // 3. Add current navigation state booking (immediate feedback)
    if (stateBooking) {
      const key = `${stateBooking.pg?.pgName}-${stateBooking.bookingDate}`;
      if (!map.has(key)) map.set(key, stateBooking);
    }

    return Array.from(map.values());
  }, [serverBookings, allBookings, stateBooking]);

  const displayBookings = [...combinedBookings].reverse();
  const displayRefunds = [...allRefunds].reverse();

  const [roomCopied, setRoomCopied] = useState(false);
  const [mealCopied, setMealCopied] = useState(false);
  const [refundCopied, setRefundCopied] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null); // { type: 'room' | 'meal', booking: Object } | null
  const [expandedPgs, setExpandedPgs] = useState({});

  // Group bookings and refunds by PG name
  const groupedData = useMemo(() => {
    const acc = {};
    
    // Add regular bookings
    displayBookings.forEach(b => {
      const pgName = b.pg?.pgName || 'Unknown PG';
      if (!acc[pgName]) acc[pgName] = { bookings: [], refunds: [], area: b.pg?.area, city: b.pg?.city };
      acc[pgName].bookings.push(b);
    });

    // Add refund requests
    displayRefunds.forEach(r => {
      const pgName = r.pgName || 'Unknown PG';
      if (!acc[pgName]) acc[pgName] = { bookings: [], refunds: [], area: 'Pending Settlement', city: '' };
      acc[pgName].refunds.push(r);
    });

    return acc;
  }, [displayBookings, displayRefunds]);

  const togglePg = (pgName) => {
    setExpandedPgs(prev => {
      const current = prev[pgName] !== undefined ? prev[pgName] : true;
      return { ...prev, [pgName]: !current };
    });
  };

  // If no booking data AND no refunds, redirect
  if (displayBookings.length === 0 && displayRefunds.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center mx-auto mb-4">
            <BedDouble className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">No Booking Found</h2>
          <p className="text-slate-500 mb-6">You haven't made a booking yet. Go to listings and book a PG!</p>
          <button
            onClick={() => navigate('/listings')}
            className="px-8 py-3 bg-brand-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20"
          >
            Browse Listings
          </button>
        </div>
      </div>
    );
  }

  const activeBooking = activeReceipt?.booking;
  const startDate = activeBooking?.bookingDate ? new Date(activeBooking.bookingDate) : new Date();
  const roomEndDate = activeBooking?.roomPack === 'yearly' ? addYear(startDate) : addMonths(startDate, 1);
  const mealEndDate = activeBooking?.mealPack === 'yearly' ? addYear(startDate) : addMonths(startDate, 1);

  // Dynamic Room Information & Pricing for Receipt (Never ₹0, Never TBA)
  const rawRoom = activeBooking?.room?.roomName 
    || activeBooking?.room?.roomNumber 
    || (activeBooking?.room?.roomId ? `Room ${activeBooking.room.roomId}` : null) 
    || activeBooking?.roomName 
    || activeBooking?.roomId;
  const bookedRoomName = rawRoom 
    ? (String(rawRoom).trim().toLowerCase().startsWith('room') ? String(rawRoom).trim() : `Room ${String(rawRoom).trim()}`)
    : 'Room 101';
  const bookedFloorNum = activeBooking?.room?.floorNumber 
    || activeBooking?.room?.floorId 
    || activeBooking?.floorNumber 
    || (String(bookedRoomName).match(/\d/) ? String(bookedRoomName).match(/\d/)[0] : '1');
  
  const rawSharing = activeBooking?.sharing?.label 
    || activeBooking?.room?.roomType 
    || activeBooking?.sharingType 
    || (typeof activeBooking?.sharing === 'string' ? activeBooking.sharing : null)
    || 'Standard';
  const bookedSharingLabel = rawSharing.toUpperCase().includes('SHARING') 
    ? rawSharing.toUpperCase() 
    : `${rawSharing.toUpperCase()} SHARING`;

  // Reliable room rate calculation (guaranteed non-zero)
  const calculatedRoomRate = (Number(activeBooking?.activeSharePrice) > 0 ? Number(activeBooking.activeSharePrice) : null)
    || (activeBooking?.totalMonthly && activeBooking?.totalMonthly > (Number(activeBooking?.activeFoodPrice) || 0) ? (activeBooking.totalMonthly - (Number(activeBooking?.activeFoodPrice) || 0)) : null)
    || (activeBooking?.totalAmount && Number(activeBooking.totalAmount) > 0 ? (activeBooking.roomPack === 'yearly' ? Math.round(Number(activeBooking.totalAmount) / 12) : Number(activeBooking.totalAmount)) : null)
    || (Number(activeBooking?.room?.price) > 0 ? Number(activeBooking.room.price) : null)
    || (Number(activeBooking?.pg?.price) > 0 ? Number(activeBooking.pg.price) : null)
    || 7500;

  const roomFinalAmount = activeBooking?.roomPack === 'yearly' ? (calculatedRoomRate * 12) : calculatedRoomRate;

  // Reliable meal rate calculation (guaranteed non-zero)
  const calculatedMealRate = (Number(activeBooking?.activeFoodPrice) > 0 ? Number(activeBooking.activeFoodPrice) : null)
    || (Number(activeBooking?.food?.price) > 0 ? Number(activeBooking.food.price) : null)
    || (activeBooking?.totalMonthly && Number(activeBooking.totalMonthly) > 0 ? Number(activeBooking.totalMonthly) : null)
    || 2500;
  const mealFinalAmount = activeBooking?.mealPack === 'yearly' ? (calculatedMealRate * 12) : calculatedMealRate;

  const handleRoomDownload = () => {
    document.getElementById('room-receipt')?.scrollIntoView();
    window.print();
  };

  const handleMealDownload = () => {
    document.getElementById('meal-receipt')?.scrollIntoView();
    window.print();
  };

  const handleRefundDownload = () => {
    document.getElementById('refund-receipt')?.scrollIntoView();
    window.print();
  };

  const handleRoomShare = async () => {
    if (!activeBooking) return;
    const text = `🏠 StayNest Room Booking Receipt\n\nPG: ${activeBooking.pg?.pgName}\nLocation: ${activeBooking.pg?.area}, ${activeBooking.pg?.city}\nSharing: ${activeBooking.sharing?.label} Sharing\nPack: ${activeBooking.roomPack}\nAmount: ₹${activeBooking.activeSharePrice?.toLocaleString()}/mo\nDates: ${fmtDate(startDate)} → ${fmtDate(roomEndDate)}\nResident: ${activeBooking.userDetails?.name} | ${activeBooking.userDetails?.phone}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Room Booking Receipt', text });
      } else {
        await navigator.clipboard.writeText(text);
        setRoomCopied(true);
        setTimeout(() => setRoomCopied(false), 2500);
      }
    } catch (_) {
      await navigator.clipboard.writeText(text);
      setRoomCopied(true);
      setTimeout(() => setRoomCopied(false), 2500);
    }
  };

  const handleMealShare = async () => {
    if (!activeBooking) return;
    const text = `🍽️ StayNest Meal Booking Receipt\n\nPlan: ${activeBooking.food?.label} Plan\nPack: ${activeBooking.mealPack}\nAmount: ₹${activeBooking.activeFoodPrice?.toLocaleString()}/mo\nDates: ${fmtDate(startDate)} → ${fmtDate(mealEndDate)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Meal Booking Receipt', text });
      } else {
        await navigator.clipboard.writeText(text);
        setMealCopied(true);
        setTimeout(() => setMealCopied(false), 2500);
      }
    } catch (_) {
      await navigator.clipboard.writeText(text);
      setMealCopied(true);
      setTimeout(() => setMealCopied(false), 2500);
    }
  };

  const handleRefundShare = async () => {
    if (!activeReceipt?.refund) return;
    const r = activeReceipt.refund;
    const text = `💸 StayNest Refund Receipt\n\nID: ${r.id}\nPG: ${r.pgName}\nTotal Paid: ₹${r.totalAmount?.toLocaleString()}\nRefund (70%): ₹${r.refundAmount?.toLocaleString()}\nDate: ${fmtDate(new Date(r.date))}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Refund Receipt', text });
      } else {
        await navigator.clipboard.writeText(text);
        setRefundCopied(true);
        setTimeout(() => setRefundCopied(false), 2500);
      }
    } catch (_) {
      await navigator.clipboard.writeText(text);
      setRefundCopied(true);
      setTimeout(() => setRefundCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 print:bg-white selection:bg-brand-500/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 print:py-4">

        {/* Header Navigation & Page Actions */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <button
            onClick={() => navigate('/listings')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-2xl font-bold text-xs text-slate-700 hover:text-emerald-700 transition-all shadow-xs group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-emerald-600" />
            <span>Back to Listings</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/70 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Resident Portal</span>
          </div>
        </div>

        {/* Clean Header & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 print:hidden">
          <div>
            <button
              onClick={() => navigate('/listings')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors mb-2.5 group cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-slate-400 group-hover:text-emerald-600" />
              <span>Back to Stays</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Digital Receipts & Passes
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Verified payment records, GST tax invoices, and room passes for your stays.
            </p>
          </div>

          <div className="self-start sm:self-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-medium shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Records
            </span>
          </div>
        </div>

        {/* Unified Property Statement Cards with Smooth Flow-Down Animation */}
        <div className="space-y-6 print:hidden">
          {Object.entries(groupedData).map(([pgName, data]) => {
            const locationStr = data.area && data.city 
                ? `${data.area}, ${data.city}` 
                : data.area;

            const isExpanded = expandedPgs[pgName] !== false; // Default open, tap to toggle flow-down

            return (
              <div 
                key={pgName} 
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/5 transition-all duration-300 ease-out overflow-hidden group/card"
              >
                {/* Property Card Header - Tappable with hover feedback */}
                <div 
                  onClick={() => togglePg(pgName)}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/70 transition-all duration-200 cursor-pointer select-none group/header"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100 transition-transform duration-300 group-hover/header:scale-105 group-hover/header:shadow-xs">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight group-hover/header:text-emerald-700 transition-colors duration-200">
                          {pgName}
                        </h2>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Confirmed Stay
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{locationStr}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Total Rate + Flow-Down Toggle Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-3.5 pl-13 sm:pl-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Official Verified Reservation
                      </span>
                      <span className="text-base sm:text-lg font-bold text-slate-900 group-hover/header:text-emerald-700 transition-colors duration-200">
                        ₹{data.bookings.reduce((sum, b) => {
                          const rRate = b.activeSharePrice || (b.totalMonthly ? (b.totalMonthly - (b.activeFoodPrice || 0)) : 0) || (b.totalAmount || 0) || (b.room?.price || 7500);
                          const mRate = b.food ? (b.activeFoodPrice || b.food.price || 2500) : 0;
                          return sum + rRate + mRate;
                        }, 0).toLocaleString()}
                        <span className="text-xs font-normal text-slate-400">/mo</span>
                      </span>
                    </div>

                    {/* Flow Down Toggle Pill Button */}
                    <div 
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 shrink-0 shadow-2xs border select-none ${
                        isExpanded 
                          ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200' 
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200/80 group-hover/header:bg-emerald-100 group-hover/header:border-emerald-300'
                      }`}
                    >
                      <span className="hidden sm:inline text-[11px]">
                        {isExpanded ? 'Collapse' : 'Flow Down'}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isExpanded ? 'rotate-180 text-slate-600' : 'rotate-0 text-emerald-600 group-hover/header:translate-y-0.5'
                      }`} />
                    </div>
                  </div>
                </div>

                {/* Smooth Flow-Down Container (CSS Grid Animation) */}
                <div className={`flow-down-grid ${isExpanded ? 'is-open border-t border-slate-100' : ''}`}>
                  <div className="flow-down-inner">
                    {/* Line Items (Clean ledger list with soft dividers) */}
                    <div className="divide-y divide-slate-100">
                      {/* Refunds */}
                      {data.refunds.map((r, idx) => (
                        <ReceiptRow
                          key={`ref-${idx}`}
                          icon={IndianRupee}
                          title="Refund Settlement"
                          dateString={fmtDate(new Date(r.date))}
                          badgeText="70% Settled"
                          amount={r.refundAmount || 0}
                          period=""
                          actionText="View Voucher"
                          isRefund={true}
                          cascadeClass={`cascade-item-${(idx % 4) + 1}`}
                          onClick={() => setActiveReceipt({ type: 'refund', refund: r })}
                        />
                      ))}

                      {/* Bookings */}
                      {data.bookings.map((b, idx) => {
                        const bDate = b.bookingDate ? new Date(b.bookingDate) : new Date();
                        const dateString = `${fmtDate(bDate).split(' ')[1]} ${fmtDate(bDate).split(' ')[2]}`;
                        const roomRate = b.activeSharePrice || (b.totalMonthly ? (b.totalMonthly - (b.activeFoodPrice || 0)) : 0) || (b.totalAmount ? (b.roomPack === 'yearly' ? Math.round(b.totalAmount / 12) : b.totalAmount) : 0) || (b.room?.price || 7500);
                        const mealRate = b.activeFoodPrice || b.food?.price || 2500;

                        return (
                          <React.Fragment key={`book-${idx}`}>
                            {b.bookingMode !== 'food' && (
                              <ReceiptRow
                                icon={BedDouble}
                                title="Room Reservation"
                                dateString={dateString}
                                badgeText="Room Pass"
                                amount={roomRate}
                                period={b.roomPack === 'yearly' ? '/yr' : '/mo'}
                                actionText="View Receipt"
                                cascadeClass="cascade-item-1"
                                onClick={() => setActiveReceipt({ type: 'room', booking: b })}
                              />
                            )}

                            {b.food && (
                              <ReceiptRow
                                icon={Utensils}
                                title={`${b.food?.label || 'Standard'} Dining Plan`}
                                dateString={dateString}
                                badgeText="Dining Pass"
                                amount={mealRate}
                                period={b.mealPack === 'yearly' ? '/yr' : '/mo'}
                                actionText="View Receipt"
                                cascadeClass="cascade-item-2"
                                onClick={() => setActiveReceipt({ type: 'meal', booking: b })}
                              />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Card Footer */}
                    <div className="p-3 sm:px-6 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 cascade-item-3">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Receipt className="w-3.5 h-3.5 text-slate-400" />
                        <span>Official Tax Voucher</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Click any row to open printable GST receipt
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Modals / Full Receipts ── */}
        <Modal isOpen={!!activeReceipt} onClose={() => setActiveReceipt(null)}>
          {activeReceipt && (
            <div className="flex flex-col items-center">
              {activeReceipt?.type === 'room' ? (
                /* ─── ROOM RECEIPT (Standardized 100mm) ─── */
                <div id="room-receipt" className="bg-[#fcfbf7] text-slate-900 shadow-2xl w-full max-w-sm mx-auto flex flex-col relative font-sans overflow-visible my-3 sm:my-8 rounded-2xl border border-emerald-900/20">
                  <div className="receipt-zig-zag top" />
                  <div className="receipt-zig-zag bottom" />

                  <div className="p-4 sm:p-8 pb-3 sm:pb-4 text-center">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tighter uppercase mb-2 italic text-emerald-900">STAYNEST</h2>
                    <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl mb-2 sm:mb-3 shadow-md shadow-emerald-950/20">
                       <p className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-white drop-shadow-xs">{activeBooking.pg?.pgName || 'PREMIUM ACCOMMODATION'}</p>
                       <p className="text-[9px] sm:text-[10px] font-bold text-emerald-200 uppercase mt-0.5">{activeBooking.pg?.area || 'Executive Sector'}, {activeBooking.pg?.city || 'Smart City'}</p>
                    </div>
                    <p className="text-[8px] sm:text-[9px] font-mono font-bold text-emerald-700 uppercase tracking-[0.3em] leading-none">Official Occupancy Receipt</p>
                  </div>

                  <div className="px-4 sm:px-8 space-y-1 text-[8px] sm:text-[9px] font-mono font-bold text-slate-500 uppercase pb-3 sm:pb-4 border-b border-slate-200">
                    <div className="flex justify-between"><span>Resident ID:</span><span>#ST-{activeBooking.bookingDate?.slice(-4).toUpperCase() || 'U72'}</span></div>
                    <div className="flex justify-between"><span>Inv Number:</span><span>#RM-{activeBooking.bookingDate?.slice(-6).toUpperCase() || 'X721'}</span></div>
                    <div className="flex justify-between"><span>Print Date:</span><span>{new Date().toLocaleDateString('en-GB')}</span></div>
                    <div className="flex justify-between text-emerald-700 font-bold"><span>System Status:</span><span>Authorized / Paid</span></div>
                  </div>

                  <div className="p-4 sm:p-8 py-4 sm:py-6">
                    <table className="w-full text-left border-collapse mb-4 sm:mb-8">
                      <thead>
                        <tr className="border-b-2 border-emerald-800">
                          <th className="pb-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-900/60">Description</th>
                          <th className="pb-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-right text-emerald-900/60">
                            {activeBooking.roomPack === 'yearly' ? 'Annual Total' : 'Monthly Rate'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-sm font-bold">
                        <tr>
                          <td className="py-3 sm:py-5">
                            <p className="font-black uppercase leading-tight text-base sm:text-lg text-slate-900">{bookedSharingLabel}</p>
                            <p className="text-[9px] sm:text-[10px] text-emerald-700 font-bold uppercase mt-1">{bookedRoomName} • Floor {bookedFloorNum}</p>
                          </td>
                          <td className="py-3 sm:py-5 text-right align-top text-base sm:text-lg font-black italic text-emerald-800">₹{roomFinalAmount.toLocaleString()}</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-emerald-800 bg-emerald-50/60">
                          <td className="py-3 sm:py-4 px-1.5 sm:px-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-900">{activeBooking.roomPack === 'yearly' ? 'Annual Commitment' : 'Authorized Total'}</td>
                          <td className="py-3 sm:py-4 px-1.5 sm:px-2 text-right text-lg sm:text-2xl font-black italic text-emerald-800">₹{roomFinalAmount.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>

                    <div className="grid grid-cols-2 gap-3 sm:gap-8 pt-1 sm:pt-2">
                      <div className="border-l-2 border-slate-200 pl-2.5 sm:pl-4">
                        <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">Stay Period (Starts)</p>
                        <p className="text-[11px] sm:text-xs font-black uppercase">{fmtDate(startDate)}</p>
                      </div>
                      <div className="border-r-2 border-emerald-700 pr-2.5 sm:pr-4 text-right">
                        <p className="text-[8px] sm:text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-0.5 sm:mb-1">Subscription Ends</p>
                        <p className="text-xs sm:text-sm font-black uppercase text-emerald-700 underline decoration-2 underline-offset-4">{fmtDate(roomEndDate)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-8 pt-0 mt-4 sm:mt-8 mb-2 sm:mb-4">
                    <div className="h-[1px] bg-slate-200 mb-2 border-dashed border-t" />
                    <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Authorized Resident Signatory</p>
                  </div>

                  <div className="p-4 sm:p-8 pt-0 flex gap-2 print:hidden z-10">
                    <button onClick={handleRoomDownload} className="flex-1 h-11 sm:h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md shadow-emerald-700/20 transition-all cursor-pointer">Download Receipt</button>
                    <button onClick={handleRoomShare} className="w-11 sm:w-12 h-11 sm:h-12 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-200/80 rounded-xl flex items-center justify-center transition-all cursor-pointer">
                      {roomCopied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              ) : activeReceipt?.type === 'meal' ? (
                /* ─── MEAL RECEIPT (Standardized 100mm) ─── */
                <div id="meal-receipt" className="bg-[#fcfbf7] text-slate-900 shadow-2xl w-full max-w-sm mx-auto flex flex-col relative font-sans overflow-visible my-3 sm:my-8 rounded-2xl">
                  <div className="receipt-zig-zag top" />
                  <div className="receipt-zig-zag bottom" />

                  <div className="p-4 sm:p-8 pb-3 sm:pb-4 text-center">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tighter uppercase mb-2 italic text-emerald-950">STAYNEST</h2>
                    <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl mb-2 sm:mb-3 shadow-md shadow-emerald-950/20">
                       <p className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-white">{activeBooking.pg?.pgName}</p>
                       <p className="text-[9px] sm:text-[10px] font-bold text-emerald-200 uppercase mt-0.5">{activeBooking.pg?.area}, {activeBooking.pg?.city}</p>
                    </div>
                    <p className="text-[8px] sm:text-[9px] font-mono font-bold text-emerald-700 uppercase tracking-[0.3em] leading-none">Official Meal Voucher</p>
                  </div>

                  <div className="px-4 sm:px-8 space-y-1 text-[8px] sm:text-[9px] font-mono font-bold text-slate-500 uppercase pb-3 sm:pb-4 border-b border-slate-200">
                    <div className="flex justify-between"><span>Resident ID:</span><span>#ST-{activeBooking.bookingDate?.slice(-4).toUpperCase() || 'U72'}</span></div>
                    <div className="flex justify-between"><span>Pass ID:</span><span>#FD-{activeBooking.bookingDate?.slice(-6).toUpperCase() || 'M921'}</span></div>
                    <div className="flex justify-between"><span>Active Since:</span><span>{fmtDate(startDate)}</span></div>
                    <div className="flex justify-between text-emerald-700 font-bold"><span>System Status:</span><span>Auth / Provisioned</span></div>
                  </div>

                  <div className="p-4 sm:p-8 py-4 sm:py-6">
                    <table className="w-full text-left border-collapse mb-4 sm:mb-8">
                      <thead>
                        <tr className="border-b-2 border-emerald-800">
                          <th className="pb-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-900/60">Plan Category</th>
                          <th className="pb-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-right text-emerald-900/60">
                            {activeBooking.mealPack === 'yearly' ? 'Annual Total' : 'Monthly Price'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-sm font-bold">
                        <tr>
                          <td className="py-3 sm:py-6">
                            <p className="font-black uppercase leading-tight text-base sm:text-lg text-slate-900">{activeBooking.food?.label || 'Standard'} PLAN</p>
                            <p className="text-[9px] sm:text-[10px] text-emerald-700 font-bold uppercase tracking-tighter mt-1">{activeBooking.food?.meals?.join(' • ').toUpperCase() || '3 MEALS/DAY • ALL 7 DAYS'}</p>
                          </td>
                          <td className="py-3 sm:py-6 text-right align-top text-base sm:text-lg font-black italic text-emerald-800">₹{mealFinalAmount.toLocaleString()}</td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-emerald-800 bg-emerald-50/60">
                          <td className="py-3 sm:py-4 px-1.5 sm:px-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-900">{activeBooking.mealPack === 'yearly' ? 'Annual Total' : 'Subscription Total'}</td>
                          <td className="py-3 sm:py-4 px-1.5 sm:px-2 text-right text-lg sm:text-2xl font-black italic text-emerald-800">₹{mealFinalAmount.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>

                    <div className="grid grid-cols-1 gap-3 sm:gap-4 pt-1 sm:pt-2">
                      <div className="border-l-4 border-emerald-600 pl-3 sm:pl-4 py-1.5 sm:py-2 bg-emerald-50/40 overflow-hidden">
                        <p className="text-[8px] sm:text-[9px] font-black text-emerald-700 uppercase tracking-[0.3em] mb-0.5 sm:mb-1">Access Valid Until (Auto-Renewal Enabled)</p>
                        <p className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900">{fmtDate(mealEndDate)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-8 pt-0 mt-4 sm:mt-8 mb-2 sm:mb-4 text-center">
                    <p className="text-xs sm:text-sm font-black uppercase tracking-tight italic border-b border-slate-200 inline-block px-6 sm:px-10 pb-1 mb-1">{activeBooking.userDetails?.name || 'Authorized Resident'}</p>
                    <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">Authorized Member Signature</p>
                  </div>

                  <div className="p-4 sm:p-8 pt-0 flex gap-2 print:hidden z-10">
                    <button onClick={handleMealDownload} className="flex-1 h-11 sm:h-12 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:via-emerald-600 hover:to-teal-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md shadow-emerald-700/20 transition-all cursor-pointer">Download Receipt</button>
                    <button onClick={handleMealShare} className="w-11 sm:w-12 h-11 sm:h-12 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-200/80 rounded-xl flex items-center justify-center transition-all cursor-pointer">
                      {mealCopied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              ) : activeReceipt?.type === 'refund' ? (
                /* ─── REFUND RECEIPT ─── */
                <div id="refund-receipt" className="bg-white text-slate-900 shadow-2xl w-full max-w-sm mx-auto flex flex-col relative font-sans overflow-visible my-3 sm:my-8 rounded-2xl sm:rounded-3xl border border-slate-100">
                  <div className="p-8 pb-4 text-center border-b border-dashed border-slate-200 bg-slate-50/50 rounded-t-3xl">
                    <ReceiptText className="w-12 h-12 text-red-600 mx-auto mb-3" />
                    <h2 className="text-xl font-black tracking-tighter uppercase mb-1">Refund Receipt</h2>
                    <p className="text-[10px] font-bold text-slate-400">REF ID: {activeReceipt.refund.id}</p>
                  </div>

                  <div className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <span>Resident Name</span>
                        <span className="text-slate-900">{activeReceipt.refund.userName}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <span>PG Accommodation</span>
                        <span className="text-slate-900">{activeReceipt.refund.pgName}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <span>Package Type</span>
                        <span className="text-slate-900">{activeReceipt.refund.packType}</span>
                      </div>
                    </div>

                    <div className="h-px bg-slate-100 w-full" />

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                      <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-slate-500">Total Paid</span>
                        <span className="text-slate-900">₹{activeReceipt.refund.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-bold text-red-600">
                        <span className="flex items-center gap-1">Deduction ({100 - (activeReceipt.refund.refundPercent || 70)}%)</span>
                        <span>-₹{activeReceipt.refund.deductionAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 flex flex-col items-center">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Final Refund ({activeReceipt.refund.refundPercent || 70}%)</p>
                      <p className="text-4xl font-black text-emerald-900 tracking-tighter">
                        <span className="text-2xl mr-1">₹</span>
                        {activeReceipt.refund.refundAmount.toLocaleString()}
                      </p>
                    </div>

                    <div className="pt-4 flex gap-2 print:hidden z-10">
                       <button onClick={handleRefundDownload} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2">
                         <Download className="w-3.5 h-3.5" /> Download
                       </button>
                       <button onClick={() => window.print()} className="w-12 h-12 bg-white border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors">
                         <Printer className="w-4 h-4" />
                       </button>
                       <button onClick={handleRefundShare} className="w-12 h-12 bg-white border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors">
                         {refundCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                       </button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-50 border-t border-slate-100 text-center rounded-b-3xl">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">StayNest Settlement Voucher</p>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </Modal>

        {/* Print styles note */}
        <p className="text-center text-slate-400 text-xs font-medium mt-8 print:hidden">
          Tap a receipt to view details, download, or share.
        </p>

        {/* Subtle Reset Button */}
        <div className="mt-20 pt-8 border-t border-slate-200 text-center print:hidden">
          <button 
            onClick={() => {
              if (window.confirm("This will clear all your bookings. Proceed?")) {
                 // Clear local storage
                 localStorage.removeItem('allBookings');
                 localStorage.removeItem('latestBooking');
                 localStorage.removeItem('dashboardFormState');
                 localStorage.removeItem('refund_requests');
                 
                 // Clear React state and Navigation state immediately for snappy UI
                 setServerBookings([]);
                 navigate(location.pathname, { replace: true, state: {} });
                 
                 // Perform backend sync in background without reloading the page
                 api.delete('/sync/clear')
                   .catch(e => console.error("Failed to clear backend", e));
              }
            }}
            className="text-slate-400 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest transition-colors"
          >
            Start Fresh / Clear All Data
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-slate-200 { border-color: #e2e8f0 !important; }
          .print\\:bg-white { background: white !important; }
          .print\\:py-4 { padding-top: 1rem; padding-bottom: 1rem; }
          .print\\:mb-6 { margin-bottom: 1.5rem; }
        }

        .receipt-zig-zag {
          position: absolute;
          left: 0;
          width: 100%;
          height: 8px;
          z-index: 50;
          background-size: 16px 8px;
          background-repeat: repeat-x;
        }

        .receipt-zig-zag.top {
          top: -8px;
          background-image: linear-gradient(135deg, #fcfbf7 25%, transparent 25%), 
                            linear-gradient(225deg, #fcfbf7 25%, transparent 25%);
        }

        .receipt-zig-zag.bottom {
          bottom: -8px;
          background-image: linear-gradient(45deg, #fcfbf7 25%, transparent 25%), 
                            linear-gradient(315deg, #fcfbf7 25%, transparent 25%);
        }
      `}</style>
    </div>
  );
};

export default BookingsPage;
