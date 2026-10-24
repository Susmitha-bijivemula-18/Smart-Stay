import React, { useState, useContext, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  IndianRupee, ReceiptText, ShieldCheck, ArrowRight, ArrowLeft, 
  CheckCircle2, ChevronDown, Building2, MapPin, Clock, 
  Calendar, Lock, Sparkles, FileText, Check, AlertCircle, User
} from 'lucide-react';

const RefundRequest = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [pgName, setPgName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [isPgDropdownOpen, setIsPgDropdownOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [serverBookings, setServerBookings] = useState([]);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsPgDropdownOpen(false);
      }
    };
    if (isPgDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPgDropdownOpen]);

  // Load bookings from localStorage and Server
  useEffect(() => {
    const fetchAll = async () => {
      let local = [];
      let refunds = [];
      try {
        const allStr = localStorage.getItem('allBookings');
        local = allStr ? JSON.parse(allStr) : [];
        const refStr = localStorage.getItem('refund_requests');
        refunds = refStr ? JSON.parse(refStr) : [];
        const latestStr = localStorage.getItem('latestBooking');
        if (latestStr) {
          const latest = JSON.parse(latestStr);
          if (!local.some(b => b.bookingDate === latest.bookingDate)) {
            local.push(latest);
          }
        }
      } catch (e) {
        console.error("Local load error", e);
      }

      let server = [];
      try {
        const res = await api.get('/sync/bookings');
        if (res.data && Array.isArray(res.data)) {
          server = res.data.filter(b => 
            b.userDetails?.email === user?.email || 
            (b.userDetails?.email && user?.email && b.userDetails.email.toLowerCase() === user.email.toLowerCase())
          );
          setServerBookings(server);
        }
      } catch (e) {
        console.error("Server sync error", e);
      }

      // Combine and deduplicate by bookingDate
      const map = new Map();
      server.forEach(b => map.set(b.bookingDate, b));
      local.forEach(b => {
        if (b.bookingDate && !map.has(b.bookingDate)) map.set(b.bookingDate, b);
      });

      // Filter out ANY booking that already has a refund request
      const combined = Array.from(map.values());
      const filtered = combined.filter(b => {
        if (!b.bookingDate) return false;
        const bTime = new Date(b.bookingDate).getTime();
        return !refunds.some(r => {
          if (!r.bookingDate) return false;
          return new Date(r.bookingDate).getTime() === bTime;
        });
      });

      setBookings(filtered);
    };

    if (user?.email) {
      fetchAll();
    }
  }, [user?.email]);

  // Get individual bookings for the dropdown sorted by newest
  const individualBookings = useMemo(() => {
    return [...bookings].sort((a, b) => new Date(b.bookingDate || 0) - new Date(a.bookingDate || 0));
  }, [bookings]);

  const handleSelectBooking = (booking) => {
    setPgName(booking.pg?.pgName || '');
    setIsPgDropdownOpen(false);
    setSelectedBooking(booking);

    if (booking) {
      const rMultiplier = booking.roomPack === 'yearly' ? 12 : 1;
      const mMultiplier = booking.mealPack === 'yearly' ? 12 : 1;
      
      const roomCost = (booking.activeSharePrice || 0) * rMultiplier;
      const mealCost = (booking.activeFoodPrice || 0) * mMultiplier;
      const totalCombined = roomCost + mealCost;
      
      setTotalAmount(totalCombined.toString());
    } else {
      setTotalAmount('');
    }
  };

  const amountValue = parseFloat(totalAmount) || 0;
  const { refundAmount, deductionAmount, refundPercent, monthsElapsed } = useMemo(() => {
    const amountVal = amountValue;
    if (!selectedBooking || !selectedBooking.bookingDate) {
      return { refundAmount: amountVal * 0.7, deductionAmount: amountVal * 0.3, refundPercent: 70, monthsElapsed: 0 };
    }

    const bookingDate = new Date(selectedBooking.bookingDate);
    const now = new Date();
    
    let months = (now.getFullYear() - bookingDate.getFullYear()) * 12 + (now.getMonth() - bookingDate.getMonth());
    if (now.getDate() < bookingDate.getDate()) {
      months--;
    }
    const elapsed = Math.max(1, months + 1);

    let percent = 0;
    if (elapsed <= 1) percent = 80;
    else if (elapsed <= 5) percent = 40;
    else if (elapsed <= 8) percent = 20;
    else percent = 0;

    const refund = amountVal * (percent / 100);
    const deduction = amountVal - refund;

    return { 
      refundAmount: refund, 
      deductionAmount: deduction, 
      refundPercent: percent,
      monthsElapsed: elapsed
    };
  }, [totalAmount, selectedBooking]);

  const stableRefId = useMemo(() => {
    if (selectedBooking?.bookingDate) {
      const t = new Date(selectedBooking.bookingDate).getTime().toString().slice(-6);
      return `REF-${t}`;
    }
    return 'REF-PENDING';
  }, [selectedBooking]);

  const handleApply = (e) => {
    e.preventDefault();
    const amountVal = parseFloat(totalAmount) || 0;
    if (amountVal > 0 && pgName) {
      const newRefund = {
        id: stableRefId,
        pgName,
        userEmail: user?.email,
        packType: selectedBooking?.roomPack === 'yearly' ? 'Yearly' : 'Monthly',
        roomPack: selectedBooking?.roomPack,
        mealPack: selectedBooking?.mealPack,
        totalAmount: amountVal,
        refundAmount,
        deductionAmount,
        refundPercent,
        monthsElapsed,
        date: new Date().toISOString(),
        bookingDate: selectedBooking.bookingDate,
        userName: user?.name
      };

      const existing = JSON.parse(localStorage.getItem('refund_requests') || '[]');
      localStorage.setItem('refund_requests', JSON.stringify([...existing, newRefund]));

      const updatedBookings = bookings.filter(b => b.bookingDate !== selectedBooking.bookingDate);
      localStorage.setItem('allBookings', JSON.stringify(updatedBookings));
      setBookings(updatedBookings);

      const latest = JSON.parse(localStorage.getItem('latestBooking') || '{}');
      if (latest.bookingDate === selectedBooking.bookingDate) {
        localStorage.removeItem('latestBooking');
      }

      if (selectedBooking?.room?.roomId) {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
        fetch(`${API_BASE_URL}/sync/release`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pgName: selectedBooking.pg?.pgName,
            roomId: selectedBooking.room.roomId,
            bookingDate: selectedBooking.bookingDate
          })
        }).catch(err => console.error("Failed to release bed on refund", err));
      }

      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Navigation */}
        <button 
          type="button"
          onClick={() => navigate(-1)} 
          className="group mb-8 inline-flex items-center gap-2.5 px-4 py-2 bg-white border border-slate-200/90 rounded-full shadow-2xs hover:bg-slate-50 hover:border-slate-300 hover:shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-xs font-bold text-slate-700">Back</span>
        </button>

        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-black uppercase tracking-widest mb-3 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Settlement & Cancellation Desk
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display mb-2.5">
            Refund Request Center
          </h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Select your confirmed booking to compute automated tenure settlements according to standardized PG cancellation guidelines.
          </p>
        </div>

        {/* Main Grid: Form + Live Receipt */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── Left Column: Form & Policy (7 cols) ── */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Request Form Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
              <form onSubmit={handleApply} className="space-y-5">
                
                {/* Full Name */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">
                    Resident Name
                  </label>
                  <div className="flex items-center justify-between px-4 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-slate-200/70 text-slate-600 flex items-center justify-center">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-bold text-slate-800">{user?.name || 'Resident'}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      Verified Account
                    </span>
                  </div>
                </div>

                {/* Select Booked PG */}
                <div ref={dropdownRef}>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">
                    Select Active Booking
                  </label>
                  <div className="relative">
                    <div 
                      onClick={() => !submitted && setIsPgDropdownOpen(!isPgDropdownOpen)}
                      className={`w-full px-4 py-3.5 bg-white border rounded-2xl text-sm font-bold flex items-center justify-between cursor-pointer transition-all duration-200
                        ${isPgDropdownOpen 
                          ? 'border-emerald-500 shadow-sm ring-2 ring-emerald-500/15' 
                          : 'border-slate-200 hover:border-slate-300 shadow-2xs'} 
                        ${submitted ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${pgName ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className={`truncate ${pgName ? 'text-slate-900 font-black' : 'text-slate-400 font-medium'}`}>
                          {pgName 
                            ? `${pgName} · ${new Date(selectedBooking?.bookingDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}` 
                            : 'Choose your PG accommodation booking...'}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${isPgDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                    </div>

                    {/* Dropdown Options */}
                    {isPgDropdownOpen && !submitted && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 z-30 p-2 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-1.5 mb-1 border-b border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Available Bookings</p>
                        </div>
                        {individualBookings.length > 0 ? (
                          individualBookings.map((b, idx) => (
                            <div 
                              key={idx}
                              onClick={() => handleSelectBooking(b)}
                              className="p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors group"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-black text-slate-900 text-sm truncate uppercase tracking-tight group-hover:text-emerald-700 transition-colors">
                                      {b.pg?.pgName}
                                    </p>
                                    <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md shrink-0">
                                      {b.bookingMode === 'full' ? 'Stay + Food' : 'Food Only'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-slate-400" />
                                      {new Date(b.bookingDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                    <span>•</span>
                                    <span className="truncate">{b.pg?.area}, {b.pg?.city}</span>
                                  </div>
                                </div>
                                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center">
                            <p className="text-xs font-bold text-slate-400">No active bookings available for refund.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Breakdown Itemizer */}
                {selectedBooking && !submitted && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 animate-in fade-in duration-300 space-y-2.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Calculated Booking Charges
                    </p>
                    
                    {selectedBooking.activeSharePrice > 0 && (
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-600">
                          {selectedBooking.sharing?.label} Sharing Room ({selectedBooking.roomPack === 'yearly' ? 'Yearly' : 'Monthly'})
                        </span>
                        <span className="font-bold text-slate-900">
                          ₹{(selectedBooking.activeSharePrice * (selectedBooking.roomPack === 'yearly' ? 12 : 1)).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {selectedBooking.activeFoodPrice > 0 && (
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-600">
                          {selectedBooking.food?.label} Meals ({selectedBooking.mealPack === 'yearly' ? 'Yearly' : 'Monthly'})
                        </span>
                        <span className="font-bold text-slate-900">
                          ₹{(selectedBooking.activeFoodPrice * (selectedBooking.mealPack === 'yearly' ? 12 : 1)).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Total Paid */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">
                    Total Verified Amount Paid (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      required
                      readOnly={!!selectedBooking}
                      className={`w-full pl-8 pr-4 py-3.5 border rounded-2xl text-sm font-bold text-slate-900 outline-none transition-all
                        ${selectedBooking 
                          ? 'bg-slate-50 border-slate-200 cursor-not-allowed text-slate-600' 
                          : 'bg-white border-slate-200 focus:border-emerald-500'}`}
                    />
                  </div>
                </div>

                {/* Action Button */}
                {!submitted ? (
                  <button 
                    type="submit"
                    disabled={!selectedBooking || amountValue <= 0}
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 shadow-md
                      ${selectedBooking && amountValue > 0
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 active:scale-[0.98] cursor-pointer'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}`}
                  >
                    <span>Generate Refund Receipt</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-emerald-900 uppercase tracking-tight">Settlement Request Submitted</p>
                      <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Your receipt has been generated and filed under your records.</p>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Processing Policy Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Settlement Rules & Deductions</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Policy timeline for annual and multi-month packages</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${monthsElapsed === 1 ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/70' : 'text-slate-600 bg-slate-50/60'}`}>
                  <span>First Month Duration (Within 30 Days)</span>
                  <span className="font-black">80% Refund (20% Fee)</span>
                </div>

                <div className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${monthsElapsed >= 2 && monthsElapsed <= 5 ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/70' : 'text-slate-600 bg-slate-50/60'}`}>
                  <span>2nd to 5th Month</span>
                  <span className="font-black">40% Refund (60% Fee)</span>
                </div>

                <div className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${monthsElapsed >= 6 && monthsElapsed <= 8 ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/70' : 'text-slate-600 bg-slate-50/60'}`}>
                  <span>6th to 8th Month</span>
                  <span className="font-black">20% Refund (80% Fee)</span>
                </div>

                <div className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${monthsElapsed > 8 ? 'bg-rose-50 text-rose-900 font-bold border border-rose-200/70' : 'text-slate-600 bg-slate-50/60'}`}>
                  <span>After 8th Month</span>
                  <span className="font-black">No Return (Non-refundable)</span>
                </div>
              </div>

              {monthsElapsed > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Status for this booking:</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {monthsElapsed} Month(s) Elapsed · {refundPercent}% Eligible
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* ── Right Column: Live Settlement Receipt (5 cols) ── */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-900/[0.04] overflow-hidden relative">
              
              {/* Receipt Top Header */}
              <div className="p-6 text-center border-b border-dashed border-slate-200 bg-slate-50/60">
                <div className="w-12 h-12 rounded-2xl bg-white text-slate-800 flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-200/70">
                  <ReceiptText className="w-6 h-6 text-slate-700" strokeWidth={2.2} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">
                  Refund Settlement Summary
                </h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold tracking-wider mt-2 border border-slate-200/60">
                  <span>REF ID:</span>
                  <span className="font-black text-slate-800">{stableRefId}</span>
                </div>
              </div>

              {/* Receipt Body */}
              <div className="p-6 sm:p-7 space-y-5">
                
                {/* Details Breakdown */}
                <div className="space-y-3 pb-4 border-b border-slate-100 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Accommodation</span>
                    <span className="font-black text-slate-900 text-right">{pgName || 'Not Selected'}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Tenure Plan</span>
                    <span className="font-bold text-slate-800 capitalize">
                      {selectedBooking?.roomPack || selectedBooking?.mealPack || 'Standard'}
                    </span>
                  </div>

                  {selectedBooking?.bookingDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Booking Date</span>
                      <span className="font-bold text-slate-800">
                        {new Date(selectedBooking.bookingDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Resident ID</span>
                    <span className="font-bold text-slate-800 truncate max-w-[170px]">{user?.email || 'Guest'}</span>
                  </div>
                </div>

                {/* Amounts Breakdown */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Total Paid Amount</span>
                    <span className="font-black text-slate-900 text-sm">₹{amountValue.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Service & Processing ({100 - refundPercent}%)</span>
                    <span className="font-bold text-rose-600">
                      {deductionAmount > 0 ? `−₹${deductionAmount.toLocaleString()}` : '₹0'}
                    </span>
                  </div>
                </div>

                {/* Clean, High-Contrast Refundable Amount Box */}
                <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 text-center border border-slate-200/80 shadow-2xs">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-1.5">
                    Refundable Settlement Amount ({refundPercent}%)
                  </p>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 font-display tracking-tight">
                    ₹{refundAmount.toLocaleString()}
                  </div>
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[10px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Direct return to original payment method</span>
                  </div>
                </div>

                {/* Post Submit Action */}
                {submitted && (
                  <div className="pt-2 animate-in fade-in duration-300">
                    <button 
                      type="button"
                      onClick={() => navigate('/bookings')}
                      className="w-full py-4 bg-slate-900 hover:bg-slate-800 active:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-slate-900/15 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <ReceiptText className="w-4 h-4 text-emerald-400" />
                      <span>View in Receipts & Bookings</span>
                    </button>
                  </div>
                )}

                {/* Trust Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-3 text-[10px] font-semibold text-slate-400">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" /> 256-bit Encrypted
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-slate-400" /> Verified Resident
                  </span>
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default RefundRequest;
