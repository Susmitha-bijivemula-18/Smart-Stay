import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  BedDouble, Utensils, CheckCircle2, Sparkles,
  User, ChefHat, Crown, Leaf, Zap,
  ArrowRight, ArrowLeft, MapPin, Star,
  Calendar, CalendarDays, BadgePercent,
  Check, Phone, GraduationCap, Briefcase, Plane, Heart, HelpCircle, ReceiptText, DoorOpen,
  Smartphone, Wallet, CreditCard, ShieldCheck, Clock, Info, Lock,
  Coffee, Sun, Moon, X
} from 'lucide-react';
import api from '../services/api';
import confetti from 'canvas-confetti';

/* ─── Data ─────────────────────────────── */
const YEARLY_DISCOUNT = 0.15;

const SHARING_TYPES = [
  { id: 1, label: 'Single',   sub: 'Private room',  icon: '🛏️', mult: 1.10, tag: 'Most Private', tagColor: 'bg-indigo-600' },
  { id: 2, label: 'Double',   sub: '2 persons',     icon: '🛏️', mult: 0.85, tag: 'Popular',      tagColor: 'bg-emerald-500' },
  { id: 3, label: 'Triple',   sub: '3 persons',     icon: '🏠', mult: 0.70, tag: 'Value',        tagColor: 'bg-sky-500' },
  { id: 4, label: '4-Person', sub: '4 persons',     icon: '🏠', mult: 0.58, tag: 'Budget',       tagColor: 'bg-amber-500' },
  { id: 5, label: '5-Person', sub: '5 persons',     icon: '🏠', mult: 0.48, tag: 'Economy',      tagColor: 'bg-slate-500' },
];

const FOOD_PLANS = [
  { id: 'basic',   label: 'Basic',    icon: Leaf,    price: 3800, color: 'emerald', tag: 'Essential',  meals: ['Breakfast, Lunch & Dinner', 'Mon–Sat', 'Veg only'],      perks: ['Filtered water'] },
  { id: 'medium',  label: 'Standard', icon: ChefHat, price: 5200, color: 'brand',   tag: 'Popular',    meals: ['3 Meals/day', 'All 7 days', 'Veg + Non-Veg'],       perks: ['Fresh salads', 'Juice daily'] },
  { id: 'premium', label: 'Premium',  icon: Crown,   price: 7500, color: 'amber',   tag: 'Lux Life',   meals: ['24×7 Meals', 'Multi-cuisine', 'Midnight snacks'],    perks: ['Dietary requests', 'Fresh juice & sweets'] },
];

const MEAL_SCHEDULES = {
  basic: {
    title: 'Basic Plan Schedule',
    monSat: { morning: 'Idli / Poha / Dosa + Tea', afternoon: 'Dal, Rice, Roti, Seasonal Veg', evening: 'Rice, Dal, Veg Curry' },
    sunday: { morning: 'Aloo Paratha + Curd', afternoon: 'Special Veg Pulao & Paneer', evening: 'Veg Fried Rice / Noodles' },
    note: 'Pure Vegetarian. Simple, healthy, home-style food.'
  },
  medium: {
    title: 'Standard Plan Schedule',
    monSat: { morning: 'South/North Breakfast + Tea/Coffee', afternoon: 'Dal, Rice, Roti, 2 Veg Curries', evening: 'Rice, Roti, Veg Gravy, Salad' },
    sunday: { morning: 'Chole Bhature / Poori Sabzi', afternoon: 'Paneer Butter Masala & Jeera Rice', evening: 'Chicken Curry (Non-Veg) / Paneer Tikka (Veg)' },
    note: 'Sunday Evening Chicken Included. Fresh salads served daily.'
  },
  premium: {
    title: 'Premium Plan Schedule',
    monSat: { morning: 'Continental / Indian Buffet + Juice', afternoon: 'Rich Gravy, Rice, Roti, Salad, Sweet', evening: 'Multi-cuisine Dinner (Wed: Chicken/Paneer Special)' },
    sunday: { morning: 'Grand Breakfast Buffet', afternoon: 'Special Feast (Veg/Non-Veg)', evening: 'Chicken Dum Biryani (Non-Veg) / Veg Dum Biryani' },
    note: 'Wed & Sun Chicken Included. Midnight snacks & custom requests supported.'
  }
};

const colorMap = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-300', pill: 'bg-emerald-600' },
  brand:   { bg: 'bg-brand-50',   text: 'text-brand-600',   border: 'border-brand-300',   pill: 'bg-brand-600' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-300',   pill: 'bg-amber-600' },
};

/* ─── Step Badge ────────────────────────── */
const StepBadge = ({ num, label, active, done }) => (
  <div className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 ${active || done ? '' : 'opacity-40'}`}>
    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[9px] sm:text-[11px] font-black transition-all duration-300
      ${done ? 'bg-emerald-500/85 backdrop-blur-md border border-emerald-300 shadow-[0_4px_10px_-2px_rgba(16,185,129,0.4)] text-white' : active ? 'bg-brand-500/85 backdrop-blur-md border border-brand-300 shadow-[0_4px_10px_-2px_rgba(34,197,94,0.4)] text-white scale-[1.05]' : 'bg-slate-100 border border-slate-200 text-slate-400'}`}>
      {done ? <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : num}
    </div>
    <span className={`font-black text-[8px] sm:text-[10px] uppercase tracking-tighter sm:tracking-widest transition-colors ${active ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
  </div>
);
const Divider = () => <div className="flex-1 h-[1.5px] bg-slate-100 min-w-[8px] sm:mx-2 rounded-full" />;

/* ─── Custom Brand SVGs ─────────────────── */
const PhonePeIcon = ({ className }) => (
  <svg viewBox="0 0 100 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12.5 0C5.59644 0 0 5.59644 0 12.5V19.5C0 26.4036 5.59644 32 12.5 32H19.5C26.4036 32 32 26.4036 32 19.5V12.5C32 5.59644 26.4036 0 19.5 0H12.5Z" fill="#6739B7"/>
    <path d="M18.8 19.8C18.8 21.8 17.5 23.1 14.8 23.1H13.6V26.2H11.2V10.2H15.1C18 10.2 19.1 11.5 19.1 13.6C19.1 15 18.2 16.1 16.8 16.5C18.1 16.9 18.8 18.1 18.8 19.8ZM13.6 15.5H14.5C15.9 15.5 16.6 14.9 16.6 13.7C16.6 12.5 15.9 11.9 14.5 11.9H13.6V15.5ZM14.9 21.4C16.2 21.4 17.1 20.8 17.1 19.6C17.1 18.4 16.2 17.8 14.9 17.8H13.6V21.4H14.9Z" fill="white"/>
    <text x="38" y="21" fill="#6739B7" fontSize="16" fontWeight="900" fontFamily="Inter, sans-serif" letterSpacing="-0.5">PhonePe</text>
  </svg>
);

const GPayIcon = ({ className }) => (
  <svg viewBox="0 0 100 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M13.6 14.1V17.5H21.5C21.2 19.3 18.8 22.8 13.6 22.8C9.1 22.8 5.6 19.1 5.6 14.6C5.6 10.1 9.1 6.4 13.6 6.4C16.2 6.4 17.9 7.5 18.9 8.4L21.6 5.8C19.9 4.2 17 3.2 13.6 3.2C7.2 3.2 2 8.3 2 14.6C2 20.9 7.2 26 13.6 26C20.3 26 24.7 21.3 24.7 14.7C24.7 13.8 24.6 13.1 24.5 12.4H13.6V14.1Z" fill="#3c4043"/>
    <path d="M34.5 9.8V25H31V9.8H34.5ZM45.6 15.4C45.6 19.5 42.6 22.5 38.5 22.5C34.4 22.5 31.4 19.5 31.4 15.4C31.4 11.3 34.4 8.3 38.5 8.3C42.6 8.3 45.6 11.3 45.6 15.4ZM42.1 15.4C42.1 12.8 40.5 11 38.5 11C36.5 11 34.9 12.8 34.9 15.4C34.9 18 36.5 19.8 38.5 19.8C40.5 19.8 42.1 18 42.1 15.4Z" fill="#5f6368"/>
    <text x="48" y="21" fill="#5f6368" fontSize="18" fontWeight="600" fontFamily="Product Sans, sans-serif">Pay</text>
  </svg>
);

const PaytmIcon = ({ className }) => (
  <svg viewBox="0 0 100 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M0 8C0 3.58172 3.58172 0 8 0H92C96.4183 0 100 3.58172 100 8V24C100 28.4183 96.4183 32 92 32H8C3.58172 32 0 28.4183 0 24V8Z" fill="#00B9F5" fillOpacity="0.05"/>
    <path d="M12.5 8H19.5C22.5 8 23.5 9.5 23.5 11.5C23.5 13.5 22.5 15 19.5 15H15.5V24H12.5V8ZM15.5 12.5H19.5C20.5 12.5 20.8 12 20.8 11.5C20.8 11 20.5 10.5 19.5 10.5H15.5V12.5Z" fill="#002E6E"/>
    <path d="M32.5 15H25.5V12.5L29 8H32.5L28.5 12.5V15ZM32.5 15V24H29.5V15H32.5Z" fill="#002E6E"/>
    <text x="35" y="21" fill="#00BAF2" fontSize="20" fontWeight="900" fontFamily="Inter, sans-serif" letterSpacing="-1">Paytm</text>
  </svg>
);

const CardIcon = ({ className }) => (
  <svg viewBox="0 0 100 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="32" rx="6" fill="#1A1F71" fillOpacity="0.05"/>
    <path d="M15 10H19.5L16.5 22H12L15 10Z" fill="#1A1F71"/>
    <path d="M28.5 10.2C27.5 9.8 26.5 9.6 25.5 9.6C22.5 9.6 20.5 11.1 20.5 13.5C20.5 15.2 22 16.1 23.1 16.7C24.3 17.3 24.7 17.7 24.7 18.4C24.7 19.4 23.5 19.9 22.4 19.9C21.4 19.9 20.5 19.6 19.5 19.2L18.8 22.2C19.8 22.7 21 23 22.3 23C25.5 23 27.6 21.4 27.6 18.9C27.6 16.1 23.5 15.9 23.5 14.6C23.5 14.1 24 13.6 24.9 13.5C25.4 13.4 26.5 13.4 27.6 13.8L28.5 10.2Z" fill="#1A1F71"/>
    <circle cx="75" cy="16" r="9" fill="#EB001B"/>
    <circle cx="84" cy="16" r="9" fill="#F79E1B" fillOpacity="0.8"/>
  </svg>
);



/* ─── Main ──────────────────────────────── */
const UserDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // 0. Use local state for PG to avoid mutating location.state
  const [pg, setPg] = useState(location.state?.pg || null);
  const basePrice = pg?.price || 8000;

  // Add a guard to prevent logic running if pg is missing
  // This will show a placeholder if we haven't loaded the PG from state or localStorage yet
  if (!pg && !localStorage.getItem('dashboardFormState')) {
     return (
       <div className="min-h-screen bg-slate-50 flex items-center justify-center">
         <div className="text-center">
           <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
             <MapPin className="w-10 h-10 text-slate-400" />
           </div>
           <h2 className="text-2xl font-black text-slate-700 tracking-tight">No PG Selected</h2>
           <p className="text-slate-500 mt-2 mb-8 max-w-sm mx-auto">You haven't selected a PG to book yet. Please browse our listings to find your perfect stay.</p>
           <button 
             onClick={() => navigate('/listings')}
             className="px-8 py-4 bg-brand-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-500/20 hover:bg-brand-700 transition-all active:scale-95"
           >
             Browse Listings
           </button>
         </div>
       </div>
     );
  }

  const [selectedSharing, setSelectedSharing] = useState(null);
  const [roomPack,        setRoomPack]        = useState(null);
  const [selectedFood,    setSelectedFood]    = useState(null);
  const [mealPack,        setMealPack]        = useState(null);
  const [viewingMenu,     setViewingMenu]     = useState(null); // Which meal plan's schedule is open in the modal
  const [mobileMenuTab,   setMobileMenuTab]   = useState('all'); // 'all' | 'weekday' | 'sunday' for mobile view
  const [selectedRoom,    setSelectedRoom]    = useState(null); 
  const [availableRooms,  setAvailableRooms]  = useState([]);   
  const [step,            setStep]            = useState(1);       
  const [bookingMode,     setBookingMode]     = useState('full');  
  const [booked,          setBooked]          = useState(false);
  const [bookingLoading,  setBookingLoading]  = useState(false);
  const [agreedToTerms,   setAgreedToTerms]   = useState(false);
  const [paymentMethod,   setPaymentMethod]   = useState(null);
  const [paymentCategory, setPaymentCategory] = useState('upi');
  const [agreedToRefund,  setAgreedToRefund]  = useState(false);
  const [rating,          setRating]          = useState(0);
  const [feedbackSentiment, setFeedbackSentiment] = useState(null);
  const [globalBookings,  setGlobalBookings]  = useState([]);      // Global memory from server
  const [dbRooms,         setDbRooms]         = useState([]);      // Actual rooms from database

  // User Details State
  const [userDetails, setUserDetails] = useState({
    name: '',
    city: '',
    phone: '',
    purpose: ''
  });

  // --- Auto-Save and Restore Logic ---
  // 1. Load from localStorage on mount
  useEffect(() => {
    const savedStateStr = localStorage.getItem('dashboardFormState');
    if (savedStateStr) {
      try {
        const saved = JSON.parse(savedStateStr);
        if (saved.step) setStep(saved.step);
        if (saved.userDetails) {
          // Clean phone of any stray prefix or non-digits so input is purely digits
          const rawDigits = String(saved.userDetails.phone || '').replace(/\D/g, '');
          const clean10 = rawDigits.length > 10 && rawDigits.startsWith('91') ? rawDigits.slice(2, 12) : rawDigits.slice(0, 10);
          setUserDetails({ ...saved.userDetails, phone: clean10 });
        }
        
        // Restore PG from saved state if missing from navigation
        if (!pg && saved.pg) {
           setPg(saved.pg);
        }
      } catch (e) {
        console.error("Failed to parse saved dashboard state", e);
      }
    }
  }, []);

  // --- UX: Bulletproof Smooth Scroll (Stutter-Free) ---
  useEffect(() => {
    // We use a micro-delay to ensure React has fully swapped the step UI
    // before the browser starts the smooth scroll calculation.
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 10);
    return () => clearTimeout(timer);
  }, [step]);

  // Fetch global memory bookings from our simplified backend un-authenticated endpoint
  useEffect(() => {
    if (pg) {
      api.get('/sync/bookings')
        .then(res => setGlobalBookings(res.data || []))
        .catch(err => console.error("Could not fetch global bookings", err));

      // Fetch actual room status from DB
      const rawId = pg.id || pg.pgId;
      const cleanPgId = typeof rawId === 'string' ? parseInt(rawId.replace(/[^\d]/g, '')) : rawId;
      api.get(`/rooms/byPG/${cleanPgId || 1}`)
        .then(res => setDbRooms(res.data || []))
        .catch(err => console.error("Could not fetch rooms from DB", err));
    }
  }, [pg]);

  // Generate a mock 50 room building (5 floors, 10 rooms per floor) and sync with globally booked rooms
  const roomGrid = React.useMemo(() => {
    // 1. We now use the globalBookings fetched from the backend memory
    let currentBookings = globalBookings;

    // 2. Tally how many beds are claimed per room for the CURRENT PG
    const activePgIdRaw = pg?.id || pg?.pgId || location.state?.pg?.id || location.state?.pg?.pgId;
    const activePgId = typeof activePgIdRaw === 'string' ? parseInt(activePgIdRaw.replace(/[^\d]/g, '')) : activePgIdRaw;
    const roomClaims = {};
    const now = new Date();

    if (activePgId) {
       currentBookings.forEach(booking => {
          const rawBookingPgId = booking.pg?.id || booking.pg?.pgId;
          const bookingPgId = typeof rawBookingPgId === 'string' ? parseInt(rawBookingPgId.replace(/[^\d]/g, '')) : rawBookingPgId;
          if (bookingPgId === activePgId && booking.room?.roomId) {
             // Calculate expiry: bookingDate + (1 or 12 months)
             const bDate = new Date(booking.bookingDate || now);
             const durationMonths = booking.roomPack === 'yearly' ? 12 : 1;
             const expiryDate = new Date(bDate);
             expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
             
             // Check if expiring within 2 days (i.e., now is >= expiryDate - 2 days)
             const availabilityBufferMs = 2 * 24 * 60 * 60 * 1000;
             const isExpiringSoon = (expiryDate.getTime() - now.getTime()) <= availabilityBufferMs;

             // Strictly only claim if NOT expiring within 2 days
             if (!isExpiringSoon) {
               const stringId = String(booking.room.roomId);
               roomClaims[stringId] = (roomClaims[stringId] || 0) + 1;
             }
          }
       });
    }

    const floors = [];
    // Floor 5 down to 1
    for (let f = 5; f >= 1; f--) {
      // Floor index mapping: 5=1-sharing, 4=2-sharing, 3=3-sharing, 2=4-sharing, 1=5-sharing
      const sharingReq = 6 - f; 
      const rooms = [];
      for (let r = 1; r <= 10; r++) {
          // Bulletproof Sync: Match room IDs with backend (pgId * 1000 + f * 100 + r)
          const cleanPgId = activePgId || 1; 
          const dbRoomId = (cleanPgId * 1000) + (f * 100) + r;
          
          // Try to find actual room data from DB
          const matchedRoom = dbRooms.find(dr => dr.roomId === dbRoomId);
          
          // Merge Data: Use MAX of DB value and Global Memory Claims to avoid double-counting
          const dbOccupancy = matchedRoom ? matchedRoom.occupiedSlots : 0;
          const memoryClaims = roomClaims[String(dbRoomId)] || 0;
          const occupancy = Math.max(dbOccupancy, memoryClaims);
          
          if (dbRoomId % 1000 === 301) {
            console.log(`SYNC_DEBUG: Room ${dbRoomId} | DB: ${dbOccupancy} | Memory: ${memoryClaims} | Mixed: ${occupancy}`);
          }
          
          const capacity  = matchedRoom ? matchedRoom.sharingType : sharingReq;
          const available = Math.max(0, capacity - occupancy);
          
          rooms.push({
             roomId: dbRoomId, // Use the real ID for booking!
             roomName: `${f * 100 + r}`, // Keep the display name simple
            floorId: f,
            sharingType: capacity,
            maxCapacity: capacity,
            currentCapacity: available // Now correctly represents "Available Slots"
         });
      }
      floors.push({ floorNumber: f, sharingType: sharingReq, rooms });
    }
    return floors;
  }, [pg, globalBookings, dbRooms]);

  // 2. Save to localStorage on any state change
  useEffect(() => {
    if (pg) {
      const stateToSave = {
        pg,
        step,
        userDetails
      };
      localStorage.setItem('dashboardFormState', JSON.stringify(stateToSave));
    }
  }, [pg, step, userDetails]);
  // -----------------------------------

  const PURPOSES = [
    { id: 'study', label: 'Education / Study', icon: GraduationCap },
    { id: 'job',   label: 'Job / Business',  icon: Briefcase },
    { id: 'travel', label: 'Travel / Enjoy',  icon: Plane },
    { id: 'visit',  label: 'Personal Visit',  icon: Heart },
    { id: 'other',  label: 'Other',           icon: HelpCircle }
  ];

  const sharing = SHARING_TYPES.find(s => s.id === selectedSharing);
  const food    = FOOD_PLANS.find(f => f.id === selectedFood);

  const rawSharingPrice    = sharing ? Math.round(basePrice * sharing.mult) : 0;
  const monthlySharePrice  = rawSharingPrice;
  const yearlySharePrice   = Math.round(rawSharingPrice * (1 - YEARLY_DISCOUNT));
  
  // Suppress room costs if in food-only mode or no pack selected
  const activeSharePrice   = (bookingMode === 'food' || !roomPack) ? 0 : (roomPack === 'yearly' ? yearlySharePrice : monthlySharePrice);
  const activeFoodPrice    = !mealPack ? 0 : (mealPack === 'yearly' ? Math.round((food?.price || 0) * (1 - YEARLY_DISCOUNT)) : (food?.price || 0));
  const totalMonthly       = activeSharePrice + activeFoodPrice;
  
  const roomSavings = (bookingMode === 'food' || roomPack !== 'yearly') ? 0 : (monthlySharePrice - yearlySharePrice) * 12;
  const mealSavings = mealPack === 'yearly' ? ((food?.price || 0) * 12) - (Math.round((food?.price || 0) * (1 - YEARLY_DISCOUNT)) * 12) : 0;
  const savings = roomSavings + mealSavings;
  const finalPayable = (roomPack === 'yearly' || mealPack === 'yearly') 
    ? ((roomPack === 'yearly' ? activeSharePrice * 12 : activeSharePrice) + 
       (mealPack === 'yearly' ? activeFoodPrice * 12 : activeFoodPrice)) 
    : totalMonthly;

  // Pure 10 digits for Indian phone number
  const phoneDigits = String(userDetails.phone || '').replace(/\D/g, '').slice(0, 10);

  const handleConfirm = async () => {
    setBookingLoading(true);
    console.log("UserDashboard: handleConfirm starting. User ID:", user?.id);
    try { 
      // Requirement 5: Refresh latest room data before booking
      const rawId = pg?.id || pg?.pgId;
      const cleanPgId = typeof rawId === 'string' ? parseInt(rawId.replace(/[^\d]/g, '')) : rawId;
      try {
        const roomUpdate = await api.get(`/rooms/byPG/${cleanPgId || 1}`);
        setDbRooms(roomUpdate.data || []);
        
        // Final check if the room is still available in the refreshed data
        if (bookingMode !== 'food' && selectedRoom) {
            const latestRoom = roomUpdate.data.find(r => r.roomId === selectedRoom.roomId);
            if (latestRoom && latestRoom.occupiedSlots >= latestRoom.sharingType) {
                throw new Error("This room was just booked by someone else! Please pick another.");
            }
        }
      } catch (e) {
        console.warn("Pre-booking refresh failed, proceeding with current state", e);
      }

      console.log("UserDashboard: Sending /booking/create request... Room ID:", (bookingMode !== 'food' && selectedRoom) ? selectedRoom.roomId : 'NONE');
      await api.post('/booking/create', { 
        user: { id: user?.id },
        pg: { id: cleanPgId || 1 }, // Map to Java field 'id'
        room: (bookingMode !== 'food' && selectedRoom) ? { id: selectedRoom.roomId } : null,
        mealPlan: food?.label || null,
        roomType: sharing?.label || null,
        checkinDate: new Date().toISOString().split('T')[0],
        duration: roomPack === 'yearly' || mealPack === 'yearly' ? 12 : 1 
      }); 
      
      console.log("UserDashboard: /booking/create successful.");
      await new Promise(r => setTimeout(r, 1200));
      
      // Clear the saved form state upon successful booking
      localStorage.removeItem('dashboardFormState');
      
      setBookingLoading(false);
      setBooked(true);
    } catch (error) {
       setBookingLoading(false);
       console.error("UserDashboard: Booking creation failed", error);
       if (error.response) {
         console.error("UserDashboard: Error status:", error.response.status);
         console.error("UserDashboard: Error data:", error.response.data);
       }
       
       // 401s are handled silently by api.js interceptor (refresh token & retry).
       // If we still get 401 here, the refresh token itself expired or retry failed.
       if (error.response?.status === 401) {
          console.warn("UserDashboard: Received final 401. NOT REDIRECTING yet for debug.");
          // logout();
          // navigate('/login');
       } else {
          alert("Booking failed: " + (error.response?.data?.message || error.message));
       }
    }
  };

  // ── Celebration Blast on Successful Booking ──
  useEffect(() => {
    if (booked) {
      // 1. Initial powerful center blast
      confetti({
        particleCount: 110,
        spread: 85,
        origin: { x: 0.5, y: 0.4 },
        colors: ['#10b981', '#059669', '#34d399', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'],
        startVelocity: 45
      });

      // 2. Left side celebratory blast cannon
      const t1 = setTimeout(() => {
        confetti({
          particleCount: 65,
          angle: 60,
          spread: 80,
          origin: { x: 0.08, y: 0.65 },
          colors: ['#10b981', '#14b8a6', '#f59e0b', '#6366f1', '#ec4899']
        });
      }, 200);

      // 3. Right side celebratory blast cannon
      const t2 = setTimeout(() => {
        confetti({
          particleCount: 65,
          angle: 120,
          spread: 80,
          origin: { x: 0.92, y: 0.65 },
          colors: ['#10b981', '#14b8a6', '#f59e0b', '#6366f1', '#ec4899']
        });
      }, 350);

      // 4. Golden stars and sparkling glitter burst
      const t3 = setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 130,
          startVelocity: 30,
          origin: { x: 0.5, y: 0.3 },
          colors: ['#ffd700', '#10b981', '#a7f3d0', '#fbbf24', '#f43f5e']
        });
      }, 600);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [booked]);

  /* ── Confirmation screen (Popup) ── */
  if (booked) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-7 sm:p-9 max-w-md w-full text-center shadow-2xl shadow-emerald-950/40 border border-emerald-100/90 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        
        {/* Ambient Decorative Gradient Orbs */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-gradient-to-tr from-amber-400/15 to-emerald-400/15 rounded-full blur-2xl pointer-events-none" />

        {/* Shockwave Blast & 3D Centerpiece */}
        <div className="relative w-28 h-28 mx-auto mb-5 flex items-center justify-center">
          {/* Shockwave rings */}
          <div className="absolute inset-0 bg-emerald-400/25 rounded-full animate-ping opacity-75" />
          <div className="absolute -inset-2 rounded-full border-2 border-emerald-300/40 animate-pulse" />
          <div className="absolute -inset-4 rounded-full bg-emerald-500/15 blur-md" />
          
          {/* Main 3D Glowing Circle */}
          <div className="relative w-24 h-24 bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/50 border-4 border-white transition-transform hover:scale-105">
            <Check className="w-12 h-12 text-white stroke-[3.5] drop-shadow-md animate-in zoom-in-50 duration-300" />
          </div>

          {/* Blast confetti specs around disk */}
          <div className="absolute -top-2 right-1 w-3.5 h-3.5 bg-amber-400 rounded-full animate-bounce shadow-sm" />
          <div className="absolute top-7 -left-3 w-3 h-3 bg-sky-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '150ms' }} />
          <div className="absolute -bottom-1.5 right-3 w-3 h-3 bg-rose-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '300ms' }} />
          <div className="absolute top-1 left-2 w-2 h-2 bg-emerald-400 rounded-full animate-ping" style={{ animationDelay: '500ms' }} />
          <div className="absolute -bottom-1 left-4 w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '450ms' }} />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-3 shadow-xs">
          <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" /> Payment Confirmed
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1.5">
          Booking Successful!
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mb-5 leading-relaxed">
          Your slot at <span className="font-bold text-slate-800">{pg?.pgName || 'PG'}</span> is reserved and active.
        </p>

        {/* Mini Receipt Preview Card */}
        <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5 mb-5 text-left shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reserved Slot</p>
              <p className="text-xs font-bold text-slate-800">
                {bookingMode === 'food' ? 'Meal Plan Only' : `${sharing?.label || 'Selected'} Sharing`}
                {selectedRoom?.roomNumber ? ` • Room ${selectedRoom.roomNumber}` : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount Paid</p>
              <p className="text-sm font-black text-emerald-600">₹{finalPayable.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-medium text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Verified Booking Slot
            </span>
            <span className="font-bold text-slate-700 uppercase text-[10px] bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-xs">
              {paymentMethod || 'UPI'} Paid
            </span>
          </div>
        </div>

        {/* View Receipt Button */}
        <button 
          onClick={() => {
            const calculatedTotal = bookingMode === 'full' 
              ? (roomPack === 'yearly' ? totalMonthly * 12 : totalMonthly) 
              : (mealPack === 'yearly' ? activeFoodPrice * 12 : activeFoodPrice);

            const bookingData = {
              pg: pg,
              pgId: pg?.id || pg?.pgId,
              userEmail: user?.email,
              bookingMode: bookingMode,
              sharing: bookingMode === 'full' && sharing ? { id: sharing.id, label: sharing.label } : null,
              roomPack: bookingMode === 'full' ? roomPack : null,
              room: bookingMode === 'full' && selectedRoom ? { 
                roomId: selectedRoom.roomId, 
                roomName: selectedRoom.roomName || `Room ${selectedRoom.roomId}`,
                roomNumber: selectedRoom.roomName || selectedRoom.roomId,
                roomType: selectedRoom.roomType,
                floorNumber: selectedRoom.floorNumber || (selectedRoom.roomName && String(selectedRoom.roomName).match(/\d/) ? String(selectedRoom.roomName).match(/\d/)[0] : 1) || 1,
                floorId: selectedRoom.floorNumber || 1,
                price: activeSharePrice
              } : null,
              food: food ? { id: food.id, label: food.label, price: food.price, meals: food.meals } : null,
              mealPack: mealPack,
              activeSharePrice: bookingMode === 'full' ? activeSharePrice : 0,
              activeFoodPrice: activeFoodPrice,
              totalMonthly: bookingMode === 'full' ? totalMonthly : activeFoodPrice,
              totalAmount: calculatedTotal,
              status: 'CONFIRMED',
              userDetails: { 
                ...userDetails, 
                phone: userDetails.phone?.startsWith('+91') ? userDetails.phone : (userDetails.phone ? `+91 ${userDetails.phone}` : ''),
                email: user?.email 
              }
            };
            const existingBookingsStr = localStorage.getItem('allBookings');
            let allBookings = existingBookingsStr ? JSON.parse(existingBookingsStr) : [];
            
            if (allBookings.length === 0) {
              const oldLatestStr = localStorage.getItem('latestBooking');
              if (oldLatestStr) {
                try {
                  const oldLatest = JSON.parse(oldLatestStr);
                  if (oldLatest.pg?.pgName !== bookingData.pg?.pgName) {
                     allBookings.push(oldLatest);
                  }
                } catch(e) {}
              }
            }

            const bookingWithDate = { ...bookingData, bookingDate: new Date().toISOString() };
            allBookings.push(bookingWithDate);
            localStorage.setItem('allBookings', JSON.stringify(allBookings));
            localStorage.setItem('latestBooking', JSON.stringify(bookingWithDate));
            
            api.post('/sync/book', bookingWithDate)
              .finally(() => {
                navigate('/bookings', { state: { booking: bookingWithDate } });
              });
          }} 
          className="w-full py-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:via-emerald-600 hover:to-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/30 hover:shadow-2xl hover:shadow-emerald-600/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer group"
        >
          <ReceiptText className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
          <span>View My Receipt</span>
          <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Feedback Section */}
        <div className="mt-6 pt-5 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Rate Your Experience</p>
          
          {/* Stars */}
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="transition-all duration-200 transform hover:scale-125 active:scale-95 cursor-pointer"
              >
                <Star className={`w-7 h-7 transition-colors ${rating >= star ? 'text-amber-400 fill-amber-400 drop-shadow-sm' : 'text-slate-200 hover:text-amber-300'}`} />
              </button>
            ))}
          </div>

          {/* Sentiment Chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { id: 'fast', label: '⚡ Super Fast' },
              { id: 'easy', label: '👌 Very Easy' },
              { id: 'love', label: '❤️ Loved It' },
              { id: 'premium', label: '💎 Premium' }
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setFeedbackSentiment(chip.id)}
                className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all duration-200 cursor-pointer
                  ${feedbackSentiment === chip.id 
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/30 -translate-y-0.5' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50/40'}`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {rating > 0 && (
            <p className="mt-4 text-emerald-600 text-xs font-black animate-in zoom-in duration-300 uppercase tracking-widest flex items-center justify-center gap-1">
              ❤️ Thank you for the feedback!
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-32 sm:pb-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Premium Back Navigation */}
        <button 
          onClick={() => {
            localStorage.removeItem('dashboardFormState');
            navigate('/listings');
          }} 
          className="group mb-8 flex items-center gap-3 px-5 py-3 bg-white/50 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:bg-white hover:border-brand-200 transition-all active:scale-[0.98] outline-none"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Navigation</p>
            <p className="text-sm font-bold text-slate-700 leading-none">Back to Listings</p>
          </div>
        </button>

        {/* PG Hero Banner — Luxury Obsidian Design */}
        {pg ? (
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-[2rem] p-6 sm:p-8 mb-8 text-white border border-slate-800/80 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)]">
            {/* Ambient Lighting & Rim Highlights */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-50" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              {/* Left Column: Property Identity */}
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-3 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Booking Slot For</span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight mb-3 font-display drop-shadow-sm">
                  {pg.pgName}
                </h1>
                
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-slate-300">
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span>{pg.area}, {pg.city}</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-slate-700 hidden sm:inline" />
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/25 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified Sanctuary</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Rating & Pricing */}
              <div className="text-left sm:text-right flex-shrink-0 flex sm:flex-col justify-between sm:justify-center items-end border-t sm:border-t-0 border-white/10 pt-4 sm:pt-0">
                <div className="inline-flex items-center gap-2 bg-white/[0.08] hover:bg-white/[0.12] backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-xl shadow-xs text-white transition-all mb-2.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 drop-shadow-xs" />
                  <span className="text-sm font-black tracking-tight">{pg.rating || '4.8'}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1.5 border-l border-white/15">Top Rated</span>
                </div>

                <div>
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Starting from</p>
                  <div className="flex items-baseline justify-start sm:justify-end gap-1">
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-display">
                      ₹{Math.round(basePrice * 0.55).toLocaleString()}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-400 font-bold">/mo</span>
                  </div>
                  <p className="text-[10px] font-semibold text-emerald-400/90 flex items-center justify-start sm:justify-end gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>All-inclusive monthly rate</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-[2rem] p-7 mb-8 text-white border border-slate-800 shadow-2xl">
            <h1 className="text-2xl font-black tracking-tight font-display">Slot Booking</h1>
          </div>
        )}

        {/* Global Mode Switcher - Compact & Perfect */}
        {!booked && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-sm">
              <button 
                onClick={() => {
                  setBookingMode('full');
                  if (step >= 3) setStep(1); 
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] transition-all duration-300
                  ${bookingMode === 'full' 
                    ? 'bg-white text-slate-900 shadow-lg shadow-slate-200/50 border border-slate-100 scale-105' 
                    : 'text-slate-500 hover:text-brand-600 hover:bg-white/60'}`}
              >
                <BedDouble className={`w-3.5 h-3.5 ${bookingMode === 'full' ? 'text-brand-600' : 'text-slate-400'}`} />
                Full Pack
              </button>
              <button 
                onClick={() => {
                  setBookingMode('food');
                  setStep(3); 
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] transition-all duration-300
                  ${bookingMode === 'food' 
                    ? 'bg-white text-slate-900 shadow-lg shadow-slate-200/50 border border-slate-100 scale-105' 
                    : 'text-slate-500 hover:text-emerald-600 hover:bg-white/60'}`}
              >
                <Utensils className={`w-3.5 h-3.5 ${bookingMode === 'food' ? 'text-emerald-600' : 'text-slate-400'}`} />
                Food Only
              </button>
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-lg rounded-2xl p-1.5 sm:p-3 shadow-sm border border-slate-200 mb-6 gap-0 sm:gap-2">
          {bookingMode === 'full' && (
            <>
              <StepBadge num={1} label="Sharing" active={step===1} done={step>1} />
              <Divider />
              <StepBadge num={2} label="Rooms"   active={step===2} done={step>2} />
              <Divider />
            </>
          )}
          <StepBadge num={3} label="Meals"   active={step===3} done={step>3} />
          <Divider />
          <StepBadge num={4} label="Details" active={step===4} done={step>4} />
          <Divider />
          <StepBadge num={5} label="Confirm" active={step===5} done={booked} />
        </div>

        {/* ── STEP 1: SHARING + INLINE PACK ── */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">Choose Sharing Type</h2>
            <p className="text-slate-500 text-sm font-medium mb-6">
              PG base rate: <span className="font-black text-slate-800">₹{basePrice.toLocaleString()}/mo</span>
            </p>

            {/* ── Number tiles ── */}
            <div className="flex gap-2 mb-3">
              {SHARING_TYPES.map(s => {
                const sel = selectedSharing === s.id;
                return (
                  <button key={s.id}
                    onClick={() => { setSelectedSharing(s.id); setRoomPack(null); }}
                    className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg border font-black text-sm transition-all duration-300 ease-out cursor-pointer hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 active:scale-95 relative overflow-hidden group
                      ${sel
                        ? 'border-brand-300 bg-brand-500/90 backdrop-blur-md text-white shadow-[0_8px_20px_-4px_rgba(34,197,94,0.5)] scale-[1.02]'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:shadow-sm'}`}>
                    {s.id}
                    <span className={`text-[8px] font-black uppercase tracking-widest leading-none
                      ${sel ? 'text-brand-100' : 'text-slate-400'}`}>
                      {s.id === 1 ? 'bed' : 'beds'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Detail card for selected sharing */}
            {selectedSharing && sharing && (() => {
              const s = sharing;
              const price = Math.round(basePrice * s.mult);
              const roomInfo = {
                1: { 
                  name: 'Private Sanctuary', 
                  type: 'Single Occupancy',
                  desc: 'A premium, fully private room designed for maximum focus and comfort. No shared space within the room.',
                  amenities: {
                    comfort: ['Premium Single Bed', 'Study Desk & Ergo Chair', 'Large Wardrobe', 'Balcony Access'],
                    tech: ['AC + Fan', 'WiFi 6 Enabled', 'Power Backup', 'Smart Switch'],
                    privacy: ['Personal Bathroom', 'Electronic Lock', 'Private Entrance']
                  }
                },
                2: { 
                  name: 'Executive Shared', 
                  type: 'Double Sharing',
                  desc: 'A spacious shared room for two, balancing social interaction with personal workspace.',
                  amenities: {
                    comfort: ['2 Twin Beds', '2 Study Desks', 'Splice Wardrobe', 'Large Window'],
                    tech: ['AC + Fan', 'WiFi 6 Enabled', 'Power Backup'],
                    privacy: ['Shared Bathroom (1:2)', 'Keyed Drawer', 'Partition Option']
                  }
                },
                3: { 
                  name: 'Standard Triple', 
                  type: 'Triple Sharing',
                  desc: 'Value-driven sharing for three roommates with optimized furniture placement.',
                  amenities: {
                    comfort: ['3 Compact Beds', 'Shared Study Zone', '3-Way Closet'],
                    tech: ['High-Power Fan', 'Broadband WiFi', 'Power Backup'],
                    privacy: ['Shared Bathroom (1:3)', 'Secure Locker']
                  }
                },
                4: { 
                  name: 'Classic Quad', 
                  type: '4-Person Sharing',
                  desc: 'Social and budget-friendly living with ample floor space for four.',
                  amenities: {
                    comfort: ['4 Sturdy Beds', 'Common Storage', 'Side Tables'],
                    tech: ['Dual High-Power Fans', 'Broadband WiFi'],
                    privacy: ['Shared Bathroom (1:4)', 'Digital Locker Access']
                  }
                },
                5: { 
                  name: 'Economy Suite', 
                  type: '5-Person Sharing',
                  desc: 'The most economical stay without compromising on essential comfort.',
                  amenities: {
                    comfort: ['Bunk/Single Mix', 'Compact Storage', 'Common Area'],
                    tech: ['Dual Fans', 'Basic WiFi'],
                    privacy: ['Large Shared Bathroom', 'Safety Lockers']
                  }
                },
              }[selectedSharing];

              if (!roomInfo) return null;

              return (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-5 shadow-xl shadow-slate-200/50 animate-in fade-in zoom-in-95 duration-500">
                  <div className="p-3 md:p-4">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-brand-50 text-brand-700 font-black px-2 py-0.5 text-[9px] rounded-md uppercase tracking-wider border border-brand-100">
                            {roomInfo.type}
                          </span>
                          <span className="bg-emerald-50 text-emerald-700 font-black px-2 py-0.5 text-[9px] rounded-md uppercase tracking-wider border border-emerald-100">
                            {s.tag}
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">{roomInfo.name}</h3>
                        <p className="text-slate-500 text-xs font-medium max-w-md leading-relaxed">
                          {roomInfo.desc}
                        </p>
                      </div>
                      <div className="w-full md:w-auto bg-slate-50 border border-slate-100 rounded-xl p-3 text-center md:text-right mt-2 md:mt-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Price per person</p>
                        <div className="flex items-baseline justify-center md:justify-end gap-1">
                          <span className="text-2xl font-black text-brand-600">₹{price.toLocaleString()}</span>
                          <span className="text-slate-400 font-bold text-[10px]">/mo</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">Comfort & Space</p>
                        <ul className="space-y-1.5">
                          {roomInfo.amenities.comfort.map((a, i) => (
                            <li key={i} className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">Tech & Connectivity</p>
                        <ul className="space-y-1.5">
                          {roomInfo.amenities.tech.map((a, i) => (
                            <li key={i} className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                              <Zap className="w-3.5 h-3.5 text-amber-500" /> {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">Privacy & Safety</p>
                        <ul className="space-y-1.5">
                          {roomInfo.amenities.privacy.map((a, i) => (
                            <li key={i} className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                              <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" /> {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Inline Monthly/Yearly pack — shows only after a sharing is selected */}
            {selectedSharing && (
              <div className="bg-white border-[1.5px] border-brand-200 rounded-2xl p-3 sm:p-4 mb-5 shadow-lg shadow-brand-500/5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h3 className="text-sm font-black text-slate-900 mb-1">
                  {sharing?.label} Sharing — Choose Your Pack
                </h3>
                <p className="text-slate-400 text-xs font-medium mb-3">Yearly saves you <span className="text-emerald-600 font-black">15%</span></p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Monthly */}
                  <div onClick={() => setRoomPack('monthly')}
                    className={`relative rounded-xl border-[1.5px] p-3 cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md active:translate-y-0.5 active:scale-[0.98]
                      ${roomPack === 'monthly' ? 'border-brand-500 bg-brand-50 shadow-[0_8px_20px_-4px_rgba(34,197,94,0.3)] ring-1 ring-brand-500/20' : 'border-slate-200 bg-slate-50 hover:border-brand-300'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${roomPack === 'monthly' ? 'bg-brand-600' : 'bg-slate-200'}`}>
                          <Calendar className={`w-4 h-4 ${roomPack === 'monthly' ? 'text-white' : 'text-slate-500'}`} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">Monthly</p>
                          <p className="text-slate-400 text-[10px]">Cancel anytime</p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0
                        ${roomPack === 'monthly' ? 'border-brand-600 bg-brand-600' : 'border-slate-300'}`}>
                        {roomPack === 'monthly' && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    {/* Price breakdown */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">{sharing?.label} Sharing</span>
                        <span className="font-black text-slate-800">₹{monthlySharePrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-0.5">
                        <span className="font-black text-slate-700">Room / month</span>
                        <span className="font-black text-brand-700 text-sm">₹{monthlySharePrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Yearly */}
                  <div onClick={() => setRoomPack('yearly')}
                    className={`relative rounded-xl border-[1.5px] p-3 cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md active:translate-y-0.5 active:scale-[0.98]
                      ${roomPack === 'yearly' ? 'border-emerald-500 bg-emerald-50 shadow-[0_8px_20px_-4px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/20' : 'border-slate-200 bg-slate-50 hover:border-emerald-300'}`}>
                    <div className="absolute -top-2 right-3 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <BadgePercent className="w-2.5 h-2.5" /> Best Deal — 15% Off
                    </div>
                    <div className="flex items-center justify-between mb-2 mt-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${roomPack === 'yearly' ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                          <CalendarDays className={`w-4 h-4 ${roomPack === 'yearly' ? 'text-white' : 'text-slate-500'}`} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">Yearly</p>
                          <p className="text-slate-400 text-[10px]">Pay for 12 months</p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0
                        ${roomPack === 'yearly' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                        {roomPack === 'yearly' && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                    </div>

                    {/* 12-month breakdown */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Per month rate</span>
                        <div className="flex items-center gap-1.5">
                          <span className="line-through text-slate-400 text-[10px]">₹{monthlySharePrice.toLocaleString()}</span>
                          <span className="font-black text-emerald-700 text-sm">₹{yearlySharePrice.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">× 12 months</span>
                        <span className="font-black text-slate-900">₹{(yearlySharePrice * 12).toLocaleString()}</span>
                      </div>
                      <div className="rounded-lg bg-emerald-100 border border-emerald-200 px-2 py-1 flex justify-between items-center mt-1">
                        <span className="text-emerald-700 font-black text-[10px]">🎉 You save per year</span>
                        <span className="font-black text-emerald-700 text-xs">₹{((monthlySharePrice - yearlySharePrice) * 12).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-0.5">
                        <span className="font-black text-slate-700">Annual total</span>
                        <span className="font-black text-emerald-700 text-sm">₹{(yearlySharePrice * 12).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-2">
              <button onClick={() => setStep(2)} disabled={!pg || !selectedSharing || !roomPack}
                className={`w-full sm:w-auto h-11 px-8 rounded-full font-black text-[10px] sm:text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all duration-300
                  ${pg && selectedSharing && roomPack ? 'bg-brand-500 border border-brand-400/50 text-white shadow-[0_8px_20px_-4px_rgba(34,197,94,0.5)] hover:bg-brand-700 hover:border-brand-600 hover:shadow-[0_12px_24px_-4px_rgba(21,128,61,0.6)] hover:-translate-y-1 active:translate-y-0.5 active:scale-[0.97] cursor-pointer relative overflow-hidden group' : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'}`}>
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: MEAL ── */}
        {step === 3 && (
          <div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-1">Choose Meal Plan</h2>
                <p className="text-slate-500 font-medium">Served fresh every day by in-house chef</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl flex items-center gap-2">
                <BadgePercent className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">
                  Room: {roomPack} | Meals: {mealPack}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {FOOD_PLANS.map(f => {
                const c = colorMap[f.color];
                const displayPrice = mealPack === 'yearly' ? Math.round(f.price * (1 - YEARLY_DISCOUNT)) : f.price;
                const sel = selectedFood === f.id;
                const Icon = f.icon;
                return (
                  <div key={f.id} onClick={() => { setSelectedFood(f.id); setMealPack(null); }}
                    className={`relative rounded-[1.5rem] border-[1.5px] p-4 md:p-5 cursor-pointer transition-all duration-300 group
                      ${sel ? `${c.border} ${c.bg} shadow-[0_8px_20px_-4px_rgba(0,0,0,0.1)] scale-[1.02]` : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5'}`}>
                    <span className={`absolute -top-3 left-4 md:left-5 ${c.pill} text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm`}>{f.tag}</span>
                    
                    <div className="flex items-start justify-between mt-1 mb-3">
                      <div className={`w-10 h-10 rounded-xl ${sel ? c.bg : 'bg-slate-50'} flex items-center justify-center transition-colors`}>
                        <Icon className={`w-5 h-5 ${sel ? c.text : 'text-slate-400'}`} />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${sel ? c.border : 'border-slate-300'}`}>
                          {sel && <CheckCircle2 className={`w-3.5 h-3.5 ${c.text}`} />}
                        </div>
                      </div>
                    </div>

                    <h3 className="font-black text-lg text-slate-900 mb-2">{f.label} Plan</h3>
                    
                    <ul className="space-y-1 mb-3">
                      {f.meals.map((m, i) => (
                        <li key={i} className={`flex items-center gap-2 text-xs font-bold ${sel ? c.text : 'text-slate-600'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />{m}
                        </li>
                      ))}
                    </ul>
                    
                    <div className="space-y-1 border-t border-slate-100 pt-2 mb-4">
                      {f.perks.map((p, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                          <Zap className="w-3 h-3 text-amber-400" />{p}
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={(e) => { e.stopPropagation(); setViewingMenu(f.id); }}
                      className={`w-full mb-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.97] border-[1.5px]
                        ${sel 
                          ? 'bg-white border-transparent text-slate-900 shadow-[0_6px_16px_-4px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.2)] hover:-translate-y-0.5' 
                          : 'bg-white border-slate-200 text-slate-600 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-md hover:-translate-y-0.5'}`}
                    >
                      <Info className="w-3.5 h-3.5" /> View Menu
                    </button>

                    <div className="flex items-end justify-between border-t border-slate-100 pt-3">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Plan / Month</span>
                        <div className={`text-xl font-black mt-0.5 ${sel ? c.text : 'text-slate-900'}`}>₹{displayPrice.toLocaleString()}</div>
                        {mealPack === 'yearly' && <span className="text-[10px] line-through text-slate-400 font-bold">₹{f.price.toLocaleString()}</span>}
                      </div>
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors ${sel ? `${c.bg} ${c.text} border ${c.border}` : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                        {sel ? 'Selected ✓' : 'Pick'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inline Monthly/Yearly pack for Meals */}
            {selectedFood && (
              <div className="bg-white border-2 border-brand-200 rounded-3xl p-6 mb-8 shadow-xl shadow-brand-500/5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h3 className="text-base font-black text-slate-900 mb-1">
                  {food?.label} Plan — Choose Your Pack
                </h3>
                <p className="text-slate-400 text-sm font-medium mb-5">Yearly saves you <span className="text-emerald-600 font-black">15%</span> on every meal</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Monthly */}
                  <div onClick={() => setMealPack('monthly')}
                    className={`relative rounded-xl border-[1.5px] p-4 cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md active:translate-y-0.5 active:scale-[0.98]
                      ${mealPack === 'monthly' ? 'border-brand-500 bg-brand-50 shadow-[0_8px_20px_-4px_rgba(34,197,94,0.3)] ring-1 ring-brand-500/20' : 'border-slate-200 bg-slate-50 hover:border-brand-300'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${mealPack === 'monthly' ? 'bg-brand-600' : 'bg-slate-200'}`}>
                          <Calendar className={`w-5 h-5 ${mealPack === 'monthly' ? 'text-white' : 'text-slate-500'}`} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">Monthly</p>
                          <p className="text-slate-400 text-xs">Standard rate</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                        ${mealPack === 'monthly' ? 'border-brand-600 bg-brand-600' : 'border-slate-300'}`}>
                        {mealPack === 'monthly' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </div>
                    {/* Price breakdown */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">{food?.label} Plan</span>
                        <span className="font-black text-slate-800">₹{(food?.price || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-2 mt-1">
                        <span className="font-black text-slate-700">Total / month</span>
                        <span className="font-black text-brand-700 text-base">₹{(food?.price || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Yearly */}
                  <div onClick={() => setMealPack('yearly')}
                    className={`relative rounded-xl border-[1.5px] p-4 cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md active:translate-y-0.5 active:scale-[0.98]
                      ${mealPack === 'yearly' ? 'border-emerald-500 bg-emerald-50 shadow-[0_8px_20px_-4px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/20' : 'border-slate-200 bg-slate-50 hover:border-emerald-300'}`}>
                    <div className="absolute -top-3 right-4 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <BadgePercent className="w-3 h-3" /> Best Deal — 15% Off
                    </div>
                    <div className="flex items-center justify-between mb-4 mt-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${mealPack === 'yearly' ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                          <CalendarDays className={`w-5 h-5 ${mealPack === 'yearly' ? 'text-white' : 'text-slate-500'}`} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">Yearly</p>
                          <p className="text-slate-400 text-xs">15% Discounted</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                        ${mealPack === 'yearly' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                        {mealPack === 'yearly' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </div>

                    {/* 12-month breakdown */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Per month rate</span>
                        <div className="flex items-center gap-1.5">
                          <span className="line-through text-slate-400 text-xs">₹{(food?.price || 0).toLocaleString()}</span>
                          <span className="font-black text-emerald-700 text-base">₹{Math.round((food?.price || 0) * (1 - YEARLY_DISCOUNT)).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">× 12 months</span>
                        <span className="font-black text-slate-900">₹{(Math.round((food?.price || 0) * (1 - YEARLY_DISCOUNT)) * 12).toLocaleString()}</span>
                      </div>
                      <div className="rounded-xl bg-emerald-100 border border-emerald-200 px-3 py-2 flex justify-between items-center mt-1">
                        <span className="text-emerald-700 font-black text-xs">🎉 You save per year</span>
                        <span className="font-black text-emerald-700 text-sm">₹{(((food?.price || 0) * 12) - (Math.round((food?.price || 0) * (1 - YEARLY_DISCOUNT)) * 12)).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-2 mt-1">
                        <span className="font-black text-slate-700">Annual total</span>
                        <span className="font-black text-emerald-700 text-base">₹{(Math.round((food?.price || 0) * (1 - YEARLY_DISCOUNT)) * 12).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 sm:gap-4">
              <button onClick={() => {
                if (bookingMode === 'food') {
                  setStep(1); 
                  setBookingMode('full'); // Reset mode if they go back to the selection screen
                } else {
                  setStep(2);
                }
              }} className="h-11 px-5 sm:px-6 border border-slate-200 rounded-full font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 backdrop-blur-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 ease-out">← Back</button>
              <button onClick={() => setStep(4)} disabled={!selectedFood || !mealPack}
                className={`flex-1 h-11 rounded-full font-black text-[10px] sm:text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all duration-300
                  ${selectedFood && mealPack ? 'bg-brand-500/90 backdrop-blur-md border border-white/40 text-white shadow-[0_8px_20px_-4px_rgba(34,197,94,0.5)] hover:bg-brand-400/90 hover:border-white/60 hover:shadow-[0_8px_20px_-4px_rgba(34,197,94,0.6)] hover:-translate-y-1 active:translate-y-0.5 active:scale-95 transition-all duration-300 ease-out relative overflow-hidden' : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'}`}>
                Enter Details <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: ROOMS (GRID VIEW) ── */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900 mb-1">Select Your Room</h2>
              <p className="text-slate-500 font-medium">Click on an available room below to lock it in.</p>
            </div>

            {/* Building Grid */}
            <div className="bg-white rounded-3xl p-3 sm:p-5 mb-8 shadow-2xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-brand-400/10 to-transparent blur-3xl pointer-events-none rounded-full" />
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-400/10 to-transparent blur-3xl pointer-events-none rounded-full" />
               <div className="w-full flex flex-col gap-2 relative overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
                  {roomGrid.map((floor) => {
                     const isFloorActive = floor.sharingType === selectedSharing;
                     return (
                        <div key={floor.floorNumber} className={`flex items-stretch gap-1.5 sm:gap-2 transition-all duration-500 ease-in-out ${isFloorActive ? 'opacity-100' : 'opacity-30 grayscale pointer-events-none hover:opacity-50'}`}>
                           
                           {/* Floor Label */}
                           <div className="w-12 sm:w-16 bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl flex flex-col items-center justify-center border border-slate-200/60 flex-shrink-0 p-1.5 shadow-sm">
                              <p className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Floor</p>
                              <p className="text-lg sm:text-xl font-black text-slate-800 leading-none">{floor.floorNumber}</p>
                              <p className="text-[6px] sm:text-[7px] font-extrabold text-slate-500 mt-1 uppercase tracking-widest text-center">
                                 {floor.sharingType} Share
                              </p>
                           </div>

                           {/* Rooms List */}
                           <div className="flex-1 flex gap-1.5 sm:gap-2 min-w-max sm:min-w-0">
                              {floor.rooms.map(r => {
                                 const isSelected = selectedRoom?.roomId === r.roomId;
                                 const displayCapacity = isSelected ? r.currentCapacity - 1 : r.currentCapacity;
                                 const isFull = displayCapacity === 0 && !isSelected;

                                 return (
                                    <button
                                       key={r.roomId}
                                       onClick={() => setSelectedRoom(r)}
                                       disabled={!isFloorActive || isFull}
                                       className={`min-w-[44px] sm:min-w-[50px] flex-1 flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl border transition-all duration-300 ease-out relative overflow-hidden group
                                          ${isSelected 
                                             ? 'border-brand-500 bg-gradient-to-b from-brand-50 to-white shadow-lg shadow-brand-500/20 scale-105 z-10 ring-1 ring-brand-500/20' 
                                             : isFull 
                                               ? 'border-slate-100 bg-slate-50/50 opacity-40 cursor-not-allowed'
                                               : 'border-slate-200 bg-white hover:border-brand-400 hover:bg-brand-50/50 hover:shadow-md hover:-translate-y-1 hover:scale-[1.03] z-0 hover:z-10'}`}
                                    >
                                       {isSelected && (
                                          <div className="absolute inset-0 bg-brand-500/10 animate-pulse pointer-events-none" />
                                       )}

                                       <DoorOpen className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5 transition-all duration-300 ${isSelected ? 'text-brand-600 scale-110' : isFull ? 'text-slate-300' : 'text-slate-400 group-hover:text-brand-500 group-hover:scale-110'}`} />
                                       <span className={`text-xs sm:text-sm font-black tracking-tight transition-colors ${isSelected ? 'text-brand-900' : isFull ? 'text-slate-400' : 'text-slate-700 group-hover:text-slate-900'}`}>{r.roomName}</span>

                                       <div className={`mt-1 sm:mt-1.5 px-1.5 py-0.5 rounded text-[7px] font-black tracking-wider border transition-colors flex flex-col items-center w-full max-w-[44px]
                                           ${isSelected
                                              ? 'bg-brand-100 text-brand-700 border-brand-200 shadow-inner'
                                              : isFull
                                                ? 'bg-slate-100 text-slate-400 border-slate-100'
                                                : 'bg-emerald-50/80 text-emerald-600 border-emerald-100/50 group-hover:border-emerald-200 group-hover:bg-emerald-100'}`}>
                                           <span className="leading-none mb-0.5">{displayCapacity}/{r.maxCapacity}</span>
                                           <span className="text-[5px] sm:text-[6px] uppercase tracking-tighter opacity-80 font-bold">{isFull ? 'Full' : 'Avail'}</span>
                                        </div>
                                    </button>
                                 );
                              })}
                           </div>
                        </div>
                     );
                  })}

                  {/* Ground Level Decor */}
                  <div className="h-1.5 border-b-[3px] border-slate-200 mx-4 mt-1 border-dashed opacity-40" />
               </div>
            </div>

            <div className="flex gap-3 sm:gap-4 mt-2">
              <button 
                onClick={() => setStep(1)} 
                className="h-11 px-5 sm:px-6 border border-slate-200 rounded-full font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 backdrop-blur-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 ease-out">
                ← Back
              </button>
              <button 
                onClick={() => setStep(3)} 
                disabled={!selectedRoom}
                className={`flex-1 h-11 rounded-full font-black text-[10px] sm:text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all duration-300
                  ${selectedRoom ? 'bg-brand-500 border border-brand-400/50 text-white shadow-[0_8px_20px_-4px_rgba(34,197,94,0.5)] hover:bg-brand-700 hover:border-brand-600 hover:shadow-[0_12px_24px_-4px_rgba(21,128,61,0.6)] hover:-translate-y-1 active:translate-y-0.5 active:scale-[0.97] transition-all duration-300 ease-out cursor-pointer relative overflow-hidden group' : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'}`}
              >
                Choose Meals <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: USER DETAILS ── */}
        {step === 4 && (
          <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-slate-900 mb-2">Personal Details</h2>
              <p className="text-slate-500 font-medium">Please provide your details for the booking records.</p>
            </div>

            <div className="space-y-6 bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border-[1.5px] border-slate-100 shadow-2xl shadow-slate-200/40 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                <div className="group">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 px-2 transition-colors group-focus-within:text-emerald-600">Full Name</label>
                   <input 
                     type="text" 
                     placeholder="John Doe"
                     className="w-full h-14 px-5 bg-white border border-slate-200 rounded-2xl focus:border-emerald-500 focus:outline-none focus:ring-0 focus:shadow-none transition-colors duration-200 outline-none font-bold text-slate-900 placeholder:text-slate-300 hover:border-slate-300"
                     value={userDetails.name}
                     onChange={(e) => setUserDetails({...userDetails, name: e.target.value})}
                   />
                </div>
                <div className="group">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 px-2 transition-colors group-focus-within:text-emerald-600">City / Hometown</label>
                   <input 
                     type="text" 
                     placeholder="e.g. Bangalore"
                     className="w-full h-14 px-5 bg-white border border-slate-200 rounded-2xl focus:border-emerald-500 focus:outline-none focus:ring-0 focus:shadow-none transition-colors duration-200 outline-none font-bold text-slate-900 placeholder:text-slate-300 hover:border-slate-300"
                     value={userDetails.city}
                     onChange={(e) => setUserDetails({...userDetails, city: e.target.value})}
                   />
                </div>
              </div>

              <div className="group relative z-10">
                <div className="flex items-center justify-between mb-2 px-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] transition-colors group-focus-within:text-emerald-600">
                    Phone Number
                  </label>
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                    🇮🇳 India (+91)
                  </span>
                </div>

                <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all duration-200 hover:border-slate-300 overflow-hidden h-14">
                  {/* Predefined India +91 Badge */}
                  <div className="flex items-center gap-1.5 px-4 h-full bg-slate-50 border-r border-slate-200 shrink-0 select-none">
                    <span className="text-base" role="img" aria-label="India">🇮🇳</span>
                    <span className="font-black text-xs sm:text-sm text-slate-800 tracking-wider">+91</span>
                  </div>

                  <div className="relative flex-1 flex items-center h-full">
                    <Phone className="absolute left-3.5 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                    <input 
                      type="tel" 
                      inputMode="numeric"
                      placeholder="Enter 10-digit number"
                      maxLength={10}
                      className="w-full h-full pl-10 pr-10 bg-transparent border-none outline-none focus:outline-none focus:ring-0 font-bold text-slate-900 placeholder:text-slate-300 text-sm tracking-wider"
                      value={userDetails.phone || ''}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setUserDetails({ ...userDetails, phone: digits });
                      }}
                    />
                    {(userDetails.phone || '').length === 10 && (
                      <div className="absolute right-3.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center animate-in zoom-in-50 duration-200 shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Validation Status Strip */}
                <div className="flex items-center justify-between px-2 mt-1.5 text-[10px]">
                  {!userDetails.phone || userDetails.phone.length === 0 ? (
                    <span className="text-slate-400 font-medium">Predefined Indian prefix (+91) included automatically</span>
                  ) : userDetails.phone.length < 10 ? (
                    <span className="text-amber-600 font-semibold flex items-center gap-1">
                      <span>⚠️</span> Enter remaining {10 - userDetails.phone.length} digit{10 - userDetails.phone.length > 1 ? 's' : ''} ({userDetails.phone.length}/10)
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <span>✓</span> 10-digit mobile number ready (+91 {userDetails.phone})
                    </span>
                  )}
                  <span className={`font-mono font-bold text-[9px] ${(userDetails.phone || '').length === 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {(userDetails.phone || '').length}/10
                  </span>
                </div>
              </div>

              <div>
              <div className="relative z-10 mt-8">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4 px-2">Purpose of Stay</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {PURPOSES.map(p => {
                    const PIcon = p.icon;
                    const isSel = userDetails.purpose === p.id;
                    return (
                      <button 
                        key={p.id}
                        type="button"
                        onClick={() => setUserDetails({...userDetails, purpose: p.id})}
                        className={`group flex flex-col items-center justify-center p-4 rounded-2xl border-[1.5px] transition-all duration-300 gap-3 cursor-pointer active:scale-95
                          ${isSel 
                            ? 'border-transparent bg-white text-brand-600 shadow-[0_8px_20px_-4px_rgba(0,0,0,0.1)] scale-[1.02] ring-1 ring-brand-500/20' 
                            : 'border-slate-200 bg-slate-50/50 text-slate-400 hover:bg-white hover:border-slate-300 hover:shadow-md hover:text-slate-600 hover:-translate-y-1'}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isSel ? 'bg-brand-50' : 'bg-white shadow-sm group-hover:scale-110'}`}>
                          <PIcon className={`w-5 h-5 transition-colors duration-300 ${isSel ? 'text-brand-500' : 'text-slate-400 group-hover:text-brand-400'}`} />
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-[0.15em] leading-none text-center transition-colors ${isSel ? 'text-brand-700' : 'text-slate-500 group-hover:text-slate-700'}`}>
                          {p.label.split(' / ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              </div>

            </div>

            <div className="flex gap-3 sm:gap-4 items-center">
              <button onClick={() => setStep(3)} className="h-11 px-5 sm:px-6 border border-slate-200 rounded-full font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 backdrop-blur-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 ease-out">
                ← Back
              </button>

              {/* Review Booking Button — ONLY shown when exactly 10 digits are entered */}
              {(userDetails.phone || '').length === 10 ? (
                <button 
                  onClick={() => setStep(5)} 
                  disabled={!userDetails.name || !userDetails.purpose}
                  className={`flex-1 h-11 rounded-full font-black text-[10px] sm:text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all duration-300 animate-in fade-in zoom-in-95 duration-200
                    ${userDetails.name && userDetails.purpose 
                      ? 'bg-brand-500 border border-brand-400/50 text-white shadow-[0_8px_20px_-4px_rgba(34,197,94,0.5)] hover:bg-brand-700 hover:border-brand-600 hover:shadow-[0_12px_24px_-4px_rgba(21,128,61,0.6)] hover:-translate-y-1 active:translate-y-0.5 active:scale-[0.97] transition-all duration-300 ease-out cursor-pointer relative overflow-hidden' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'}`}
                >
                  Review Booking <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex-1 h-11 rounded-full bg-slate-100/80 border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-[10px] sm:text-[11px] font-bold tracking-wider px-4 text-center select-none">
                  Enter 10-digit number to review ({(userDetails.phone || '').length}/10)
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 5: CONFIRM ── */}
        {step === 5 && (
          <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Confirm & Pay</h2>
              <p className="text-slate-500 text-sm">Review your booking details before completing payment.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* ── Left Column ── */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* PG Header — compact premium bar */}
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 rounded-2xl px-5 py-4 text-white">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16" />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold tracking-tight">{pg?.pgName || 'PG Sanctuary'}</h3>
                      <div className="flex items-center gap-3 text-emerald-200/70 text-xs mt-1">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {pg?.area}, {pg?.city}</span>
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {pg?.rating || '4.2'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 items-end text-[9px] font-semibold uppercase tracking-wider">
                      {bookingMode === 'full' && selectedRoom && (
                        <span className="bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">Room {selectedRoom.roomType || selectedRoom.roomId}</span>
                      )}
                      {bookingMode === 'full' && (
                        <span className="bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">{roomPack} · Room</span>
                      )}
                      <span className="bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">{mealPack} · Meals</span>
                    </div>
                  </div>
                </div>

                {/* Personal Details */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Resident Details</h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Name</p>
                      <p className="text-sm font-semibold text-slate-800">{userDetails.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Purpose</p>
                      <p className="text-sm font-semibold text-slate-800 capitalize">{userDetails.purpose}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Phone</p>
                      <p className="text-sm font-semibold text-slate-800">{userDetails.phone?.startsWith('+91') ? userDetails.phone : (userDetails.phone ? `+91 ${userDetails.phone}` : 'N/A')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Hometown</p>
                      <p className="text-sm font-semibold text-slate-800">{userDetails.city || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Pricing — clean line items */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Pricing Summary</h4>
                  <div className="space-y-2">
                    {bookingMode === 'full' && (
                      <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{sharing?.label} Sharing — Room</p>
                          <p className="text-[10px] text-slate-400 capitalize">{roomPack} pack</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-800">₹{activeSharePrice.toLocaleString()}<span className="text-xs text-slate-400 font-normal">/mo</span></p>
                          {roomPack === 'yearly' && <p className="text-[10px] text-slate-400">₹{(activeSharePrice * 12).toLocaleString()} /yr</p>}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{food?.label} — Meals</p>
                        <p className="text-[10px] text-slate-400 capitalize">{mealPack} pack</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800">₹{activeFoodPrice.toLocaleString()}<span className="text-xs text-slate-400 font-normal">/mo</span></p>
                        {mealPack === 'yearly' && <p className="text-[10px] text-slate-400">₹{(activeFoodPrice * 12).toLocaleString()} /yr</p>}
                      </div>
                    </div>

                    {(roomPack === 'yearly' || mealPack === 'yearly') && (
                      <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-200">
                        <div className="flex items-center gap-2">
                          <BadgePercent className="w-3.5 h-3.5 text-emerald-600" />
                          <p className="text-xs font-medium text-emerald-700">Yearly Discount (15%)</p>
                        </div>
                        <p className="text-sm font-semibold text-emerald-600">−₹{savings.toLocaleString()}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-sm font-bold text-slate-900">Monthly Total</p>
                      <p className="text-lg font-bold text-slate-900">₹{totalMonthly.toLocaleString()}<span className="text-xs text-slate-400 font-normal ml-0.5">/mo</span></p>
                    </div>
                    
                    {(roomPack === 'yearly' || mealPack === 'yearly') && (
                      <div className="flex items-center justify-between bg-gradient-to-r from-emerald-700 to-teal-700 text-white rounded-xl px-4 py-3 mt-1">
                        <p className="text-xs font-semibold">Total Payable Now</p>
                        <p className="text-lg font-bold">
                          ₹{((roomPack === 'yearly' ? activeSharePrice * 12 : activeSharePrice) + 
                            (mealPack === 'yearly' ? activeFoodPrice * 12 : activeFoodPrice)).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Right Column ── */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Policy & Agreement */}
                {bookingMode === 'full' && (
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider leading-none">Policy & Refund</h4>
                        <p className="text-[9px] text-emerald-600 font-medium mt-0.5">StayNest Guarantee</p>
                      </div>
                    </div>
                    
                    {/* Guidelines */}
                    <div className="px-5 py-3.5 border-b border-slate-100 space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-md bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Clock className="w-3 h-3 text-amber-500" />
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Renew <span className="font-semibold text-slate-700">2 days</span> before expiry to keep your slot.</p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Info className="w-3 h-3 text-blue-500" />
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Unconfirmed slots are released to other residents.</p>
                      </div>
                    </div>

                    {/* Refund Schedule */}
                    <div className="px-5 py-3.5 border-b border-slate-100">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Refund Schedule</p>
                      <div className="space-y-1">
                        {roomPack === 'yearly' ? (
                          <>
                            <div className="flex justify-between text-[11px] py-2 px-3.5 bg-emerald-50/60 rounded-lg border border-emerald-100/50">
                              <span className="text-slate-600">1st month</span>
                              <span className="font-bold text-emerald-600">80%</span>
                            </div>
                            <div className="flex justify-between text-[11px] py-2 px-3.5 bg-slate-50/60 rounded-lg">
                              <span className="text-slate-600">2–5 months</span>
                              <span className="font-bold text-amber-600">40%</span>
                            </div>
                            <div className="flex justify-between text-[11px] py-2 px-3.5 bg-slate-50/60 rounded-lg">
                              <span className="text-slate-600">6–8 months</span>
                              <span className="font-bold text-orange-500">20%</span>
                            </div>
                            <div className="flex justify-between text-[11px] py-2 px-3.5 rounded-lg">
                              <span className="text-slate-400">After 8 months</span>
                              <span className="font-semibold text-slate-400">No refund</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between text-[11px] py-2 px-3.5 bg-emerald-50/60 rounded-lg border border-emerald-100/50">
                            <span className="text-slate-600">Anytime</span>
                            <span className="font-bold text-emerald-600">60%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Agreement Checkbox */}
                    <div 
                      className={`px-5 py-3.5 flex items-center gap-3 cursor-pointer select-none transition-all duration-200 group ${
                        agreedToRefund 
                          ? 'bg-emerald-50/50 hover:bg-emerald-50/80 border-t border-emerald-100/70' 
                          : 'hover:bg-slate-50 border-t border-slate-100'
                      }`}
                      onClick={() => {
                        const next = !agreedToRefund;
                        setAgreedToRefund(next);
                        setAgreedToTerms(next);
                      }}
                    >
                      <div className={`w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-200
                        ${agreedToRefund 
                          ? 'bg-emerald-600 border-emerald-600 shadow-sm shadow-emerald-600/30 scale-105' 
                          : 'border-slate-300 bg-white group-hover:border-emerald-500 group-hover:scale-105'}`}>
                        {agreedToRefund && <Check className="w-3.5 h-3.5 text-white animate-in zoom-in-50 duration-150" strokeWidth={3} />}
                      </div>
                      <p className="text-[11px] text-slate-600 group-hover:text-slate-900 transition-colors">
                        I agree to the <span className="font-semibold text-slate-800 underline decoration-emerald-400/50 underline-offset-2">booking policy & refund terms</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payment Method</h4>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      <Lock className="w-2.5 h-2.5" /> 100% Encrypted
                    </span>
                  </div>
                  
                  <div className="flex bg-slate-100/80 p-1 rounded-xl mb-3.5 border border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => { 
                        setPaymentCategory('upi'); 
                        if (paymentMethod === 'card' || !paymentMethod) setPaymentMethod('phonepe'); 
                      }}
                      className={`flex-1 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer
                        ${paymentCategory === 'upi' 
                          ? 'bg-white text-emerald-800 shadow-sm shadow-slate-300/40 border border-slate-200/60 scale-[1.01]' 
                          : 'text-slate-400 hover:text-slate-600 hover:bg-white/40 active:scale-95'}`}
                    >
                      <Smartphone className={`w-3.5 h-3.5 transition-colors ${paymentCategory === 'upi' ? 'text-emerald-600' : 'text-slate-400'}`} /> UPI
                    </button>
                    <button
                      type="button"
                      onClick={() => { 
                        setPaymentCategory('card'); 
                        setPaymentMethod('card'); 
                      }}
                      className={`flex-1 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer
                        ${paymentCategory === 'card' 
                          ? 'bg-white text-emerald-800 shadow-sm shadow-slate-300/40 border border-slate-200/60 scale-[1.01]' 
                          : 'text-slate-400 hover:text-slate-600 hover:bg-white/40 active:scale-95'}`}
                    >
                      <CreditCard className={`w-3.5 h-3.5 transition-colors ${paymentCategory === 'card' ? 'text-emerald-600' : 'text-slate-400'}`} /> Card
                    </button>
                  </div>

                  {paymentCategory === 'upi' && (
                    <div className="space-y-2 animate-in fade-in duration-200">
                      {[
                        { id: 'phonepe', label: 'PhonePe', icon: PhonePeIcon },
                        { id: 'gpay',    label: 'Google Pay', icon: GPayIcon },
                        { id: 'paytm',   label: 'Paytm',   icon: PaytmIcon },
                      ].map((method) => {
                        const Icon = method.icon;
                        const isSelected = paymentMethod === method.id;
                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setPaymentMethod(method.id)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer group active:scale-[0.99]
                              ${isSelected 
                                ? 'border-emerald-500 bg-emerald-50/60 shadow-sm shadow-emerald-600/10 translate-x-1' 
                                : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/20 hover:shadow-sm hover:translate-x-0.5'}`}
                          >
                            <div className="w-8 h-3.5 flex items-center justify-center shrink-0">
                              <Icon className="w-full h-full" />
                            </div>
                            <span className={`text-xs flex-1 text-left transition-colors ${isSelected ? 'font-bold text-emerald-950' : 'font-medium text-slate-700 group-hover:text-slate-900'}`}>
                              {method.label}
                            </span>
                            <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200
                              ${isSelected 
                                ? 'border-emerald-600 bg-emerald-600 shadow-sm shadow-emerald-600/30 scale-105' 
                                : 'border-slate-300 group-hover:border-emerald-400 group-hover:scale-105'}`}>
                              {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full animate-in zoom-in-50 duration-150" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {paymentCategory === 'card' && (
                    <div className="space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                      <input 
                        type="text" 
                        placeholder="Card number (16 digits)" 
                        maxLength={19}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:outline-none hover:border-slate-300 focus:border-emerald-500 focus:ring-0 focus:shadow-none transition-colors placeholder:text-slate-400 bg-white" 
                      />
                      <div className="grid grid-cols-2 gap-2.5">
                        <input 
                          type="text" 
                          placeholder="MM / YY" 
                          maxLength={5}
                          className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:outline-none hover:border-slate-300 focus:border-emerald-500 focus:ring-0 focus:shadow-none transition-colors placeholder:text-slate-400 text-center bg-white" 
                        />
                        <input 
                          type="password" 
                          placeholder="CVV" 
                          maxLength={4}
                          className="border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:outline-none hover:border-slate-300 focus:border-emerald-500 focus:ring-0 focus:shadow-none transition-colors placeholder:text-slate-400 text-center bg-white" 
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Total Payable Strip & Action Buttons ── */}
                <div className="space-y-3 pt-1">
                  {/* Mini Total Summary Card */}
                  <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-slate-50 rounded-2xl border border-emerald-100/80 p-3.5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                        <ReceiptText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Total Payable</p>
                        <p className="text-[11px] text-slate-500">
                          {roomPack === 'yearly' || mealPack === 'yearly' ? 'Full Yearly Plan' : '1st Month Advance'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900 tracking-tight">
                        ₹{finalPayable.toLocaleString()}
                      </p>
                      <span className="inline-block text-[9px] font-medium text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded-md">
                        All inclusive
                      </span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2.5 items-stretch">
                    <button 
                      type="button"
                      onClick={() => setStep(4)} 
                      className="px-4 py-3 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 hover:-translate-x-0.5 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>

                    <button 
                      type="button"
                      onClick={handleConfirm} 
                      disabled={bookingLoading || (bookingMode === 'full' ? (!agreedToTerms || !paymentMethod || !agreedToRefund) : !paymentMethod)}
                      className={`flex-1 py-3.5 px-5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 select-none group relative overflow-hidden
                        ${(bookingMode === 'full' ? (agreedToTerms && paymentMethod && agreedToRefund) : paymentMethod) 
                          ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white hover:from-emerald-500 hover:via-emerald-600 hover:to-teal-600 hover:-translate-y-0.5 active:scale-[0.98] shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 cursor-pointer' 
                          : 'bg-slate-100 text-slate-400 border border-slate-200/80 cursor-not-allowed'}`}
                    >
                      {bookingLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform duration-200" />
                          <span>Pay ₹{finalPayable.toLocaleString()} & Confirm</span>
                          <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform duration-200" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Trust badge */}
                  <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 100% Safe Checkout
                    </span>
                    <span>•</span>
                    <span>Instant Confirmation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* ── MEAL MENU MODAL ── */}
      {viewingMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setViewingMenu(null)} />
          <div className="relative bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl shadow-slate-950/40 w-full max-w-sm sm:max-w-2xl max-h-[90vh] sm:max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
            {/* Modal Header — Emerald Green Theme */}
            <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 px-3.5 py-3 sm:px-8 sm:py-6 text-white relative overflow-hidden border-b border-emerald-500/30 shadow-inner shrink-0">
              {/* Ambient Header Glows */}
              <div className="absolute -top-12 -right-12 w-32 sm:w-44 h-32 sm:h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-32 sm:w-44 h-32 sm:h-44 bg-teal-300/15 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start justify-between relative z-10 gap-2">
                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-md text-[8px] sm:text-[10px] font-extrabold uppercase tracking-widest text-emerald-100 border border-white/25 mb-1 sm:mb-2.5 shadow-2xs">
                    <Utensils className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-100" /> Dining Schedule
                  </div>
                  <h3 className="text-sm sm:text-2xl font-black text-white tracking-tight truncate">
                    {MEAL_SCHEDULES[viewingMenu].title}
                  </h3>
                  <p className="text-emerald-100/90 text-[10px] sm:text-sm font-medium mt-0.5 sm:mt-1 leading-snug sm:leading-relaxed max-w-lg line-clamp-2 sm:line-clamp-none">
                    {MEAL_SCHEDULES[viewingMenu].note}
                  </p>
                </div>

                <button 
                  type="button"
                  onClick={() => setViewingMenu(null)}
                  className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/30 hover:scale-105 active:scale-95 shrink-0 shadow-sm mt-0.5"
                  aria-label="Close menu"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-2.5 sm:p-7 bg-slate-50 overflow-y-auto flex-1 hide-scrollbar">
              
              {/* Mobile Tab Filter (Hidden on desktop) */}
              <div className="flex md:hidden bg-slate-200/70 p-0.5 rounded-xl mb-2 gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileMenuTab('all')}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-black transition-all ${mobileMenuTab === 'all' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  All Meals
                </button>
                <button
                  type="button"
                  onClick={() => setMobileMenuTab('weekday')}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-black transition-all ${mobileMenuTab === 'weekday' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Mon – Sat
                </button>
                <button
                  type="button"
                  onClick={() => setMobileMenuTab('sunday')}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-black transition-all ${mobileMenuTab === 'sunday' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  ⭐ Sunday
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-5">
                
                {/* Mon - Sat Schedule Card */}
                <div className={`bg-white border border-slate-200/90 rounded-xl sm:rounded-3xl p-2.5 sm:p-5 shadow-xs transition-all ${mobileMenuTab === 'sunday' ? 'hidden md:block' : 'block'}`}>
                  <div className="flex items-center justify-between pb-1.5 sm:pb-3.5 mb-1.5 sm:mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 sm:gap-2.5">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                      <div>
                        <h4 className="text-[11px] sm:text-xs font-black text-slate-900 uppercase tracking-wider leading-none">Mon — Sat</h4>
                        <p className="text-[8px] sm:text-[10px] text-slate-400 font-medium mt-0.5">Daily Nutritious Diet</p>
                      </div>
                    </div>
                    <span className="text-[8px] sm:text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-emerald-200/60">
                      3 Meals/Day
                    </span>
                  </div>

                  <div className="space-y-1 sm:space-y-3">
                    <div className="p-2 sm:p-3.5 bg-slate-50/80 rounded-lg sm:rounded-2xl border border-slate-200/70 hover:border-emerald-200/80 transition-colors">
                      <div className="flex items-center justify-between mb-0.5 sm:mb-1.5">
                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Morning Breakfast
                        </span>
                        <span className="text-[8px] sm:text-[10px] text-slate-600 font-semibold bg-white px-1 py-0.5 sm:px-2 sm:py-0.5 rounded border border-slate-200/60">
                          7:30 – 9:30 AM
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-sm font-bold text-slate-900 leading-snug">
                        {MEAL_SCHEDULES[viewingMenu].monSat.morning}
                      </p>
                    </div>

                    <div className="p-2 sm:p-3.5 bg-slate-50/80 rounded-lg sm:rounded-2xl border border-slate-200/70 hover:border-emerald-200/80 transition-colors">
                      <div className="flex items-center justify-between mb-0.5 sm:mb-1.5">
                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Afternoon Lunch
                        </span>
                        <span className="text-[8px] sm:text-[10px] text-slate-600 font-semibold bg-white px-1 py-0.5 sm:px-2 sm:py-0.5 rounded border border-slate-200/60">
                          12:30 – 2:30 PM
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-sm font-bold text-slate-900 leading-snug">
                        {MEAL_SCHEDULES[viewingMenu].monSat.afternoon}
                      </p>
                    </div>

                    <div className="p-2 sm:p-3.5 bg-slate-50/80 rounded-lg sm:rounded-2xl border border-slate-200/70 hover:border-emerald-200/80 transition-colors">
                      <div className="flex items-center justify-between mb-0.5 sm:mb-1.5">
                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Evening Dinner
                        </span>
                        <span className="text-[8px] sm:text-[10px] text-slate-600 font-semibold bg-white px-1 py-0.5 sm:px-2 sm:py-0.5 rounded border border-slate-200/60">
                          7:30 – 9:30 PM
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-sm font-bold text-slate-900 leading-snug">
                        {MEAL_SCHEDULES[viewingMenu].monSat.evening}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sunday Special Schedule Card */}
                <div className={`bg-white border border-slate-200/90 rounded-xl sm:rounded-3xl p-2.5 sm:p-5 shadow-xs transition-all ${mobileMenuTab === 'weekday' ? 'hidden md:block' : 'block'}`}>
                  <div className="flex items-center justify-between pb-1.5 sm:pb-3.5 mb-1.5 sm:mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 sm:gap-2.5">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                      <div>
                        <h4 className="text-[11px] sm:text-xs font-black text-slate-900 uppercase tracking-wider leading-none">Sunday Special</h4>
                        <p className="text-[8px] sm:text-[10px] text-slate-400 font-medium mt-0.5">Chef's Weekly Feast</p>
                      </div>
                    </div>
                    <span className="text-[8px] sm:text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-amber-200/60">
                      Special Feast
                    </span>
                  </div>

                  <div className="space-y-1 sm:space-y-3">
                    <div className="p-2 sm:p-3.5 bg-slate-50/80 rounded-lg sm:rounded-2xl border border-slate-200/70 hover:border-amber-200/80 transition-colors">
                      <div className="flex items-center justify-between mb-0.5 sm:mb-1.5">
                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Grand Breakfast
                        </span>
                        <span className="text-[8px] sm:text-[10px] text-slate-600 font-semibold bg-white px-1 py-0.5 sm:px-2 sm:py-0.5 rounded border border-slate-200/60">
                          8:00 – 10:00 AM
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-sm font-bold text-slate-900 leading-snug">
                        {MEAL_SCHEDULES[viewingMenu].sunday.morning}
                      </p>
                    </div>

                    <div className="p-2 sm:p-3.5 bg-slate-50/80 rounded-lg sm:rounded-2xl border border-slate-200/70 hover:border-amber-200/80 transition-colors">
                      <div className="flex items-center justify-between mb-0.5 sm:mb-1.5">
                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Royal Feast Lunch
                        </span>
                        <span className="text-[8px] sm:text-[10px] text-slate-600 font-semibold bg-white px-1 py-0.5 sm:px-2 sm:py-0.5 rounded border border-slate-200/60">
                          1:00 – 3:00 PM
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-sm font-bold text-slate-900 leading-snug">
                        {MEAL_SCHEDULES[viewingMenu].sunday.afternoon}
                      </p>
                    </div>

                    <div className="p-2 sm:p-3.5 bg-slate-50/80 rounded-lg sm:rounded-2xl border border-slate-200/70 hover:border-amber-200/80 transition-colors">
                      <div className="flex items-center justify-between mb-0.5 sm:mb-1.5">
                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Sunday Dinner
                        </span>
                        <span className="text-[8px] sm:text-[10px] text-slate-600 font-semibold bg-white px-1 py-0.5 sm:px-2 sm:py-0.5 rounded border border-slate-200/60">
                          8:00 – 10:00 PM
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-sm font-bold text-slate-900 leading-snug">
                        {MEAL_SCHEDULES[viewingMenu].sunday.evening}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Modal Footer */}
              <div className="mt-2.5 sm:mt-6 pt-2 sm:pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500 text-center sm:text-left">
                  <Utensils className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                  <span className="text-[9px] sm:text-[11px] font-semibold text-slate-600">Pure RO drinking water • Hygienic home-style cooking daily</span>
                </div>

                <button 
                  type="button"
                  onClick={() => setViewingMenu(null)}
                  className="w-full sm:w-auto px-5 sm:px-8 py-2 sm:py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:via-emerald-600 hover:to-teal-600 active:scale-95 text-white rounded-xl font-bold sm:font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-md sm:shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                >
                  Close Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;






