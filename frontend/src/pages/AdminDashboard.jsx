import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Home, Users, BookOpen, Plus, Search, 
  CheckCircle, XCircle, LogOut, LayoutDashboard, 
  TrendingUp, Clock, ShieldAlert, Edit, Trash2, MapPin, UserPlus, Menu, X, ArrowLeft,
  ChevronDown, ChevronRight, Mail, Phone, Calendar, Hash, CreditCard
} from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('summary');
  const [summaryData, setSummaryData] = useState({ users: 0, bookings: 0, pgs: 0, pending: 0 });
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBookingId, setExpandedBookingId] = useState(null);

  // ── ADD PG States ──
  const [openPgModal, setOpenPgModal] = useState(false);
  const [submittingPg, setSubmittingPg] = useState(false);
  const [newPg, setNewPg] = useState({ pgName: '', state: '', city: '', area: '', address: '', price: '', description: '' });

  // ── USER Management States ──
  const [openUserModal, setOpenUserModal] = useState(false);
  const [submittingUser, setSubmittingUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null if creating
  const [userForm, setUserForm] = useState({ name: '', email: '', phone: '', password: '', role: 'USER' });

  // ── Password Management States ──
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // ── Mobile Navbar States ──
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSubmittingPassword(true);
    try {
      await api.put(`/auth/changePassword/${user?.id}`, { newPassword });
      alert("Password updated successfully!");
      setOpenPasswordModal(false);
      setNewPassword('');
    } catch (err) { alert("Failed to update password"); } finally { setSubmittingPassword(false); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, bRes, pRes] = await Promise.all([
        api.get('/auth/users').catch(() => ({ data: [] })),
        api.get('/booking/all').catch(() => ({ data: [] })),
        api.get('/pg/list').catch(() => ({ data: [] }))
      ]);

      setUsers(uRes.data || []);
      setBookings(bRes.data || []);

      setSummaryData({
        users: (uRes.data || []).length,
        bookings: (bRes.data || []).length,
        pgs: (pRes.data || []).length,
        pending: (bRes.data || []).filter(b => b.status === 'PENDING').length
      });
    } catch (error) {
       console.error("Admin fetch failed", error);
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/booking/updateStatus/${id}`, null, { params: { status } });
      fetchData();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleAddPg = async (e) => {
    e.preventDefault();
    setSubmittingPg(true);
    let lat = 12.9716; let lon = 77.5946;

    try {
      const query = `${newPg.address}, ${newPg.area}, ${newPg.city}, ${newPg.state}, India`;
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
      const geoData = await geoRes.json();
      if (geoData && geoData.length > 0) { lat = parseFloat(geoData[0].lat); lon = parseFloat(geoData[0].lon); }
    } catch (e) { console.error("Geocoding lookup failed", e); }

    const payload = { ...newPg, latitude: lat, longitude: lon, price: parseFloat(newPg.price || 0) };

    try {
      await api.post('/pg/add', payload);
      alert(`🎉 PG Added with predicted map coordinates: [${lat}, ${lon}]`);
      setOpenPgModal(false);
      setNewPg({ pgName: '', state: '', city: '', area: '', address: '', price: '', description: '' });
      fetchData();
    } catch (err) { alert("Failed to create PG"); } finally { setSubmittingPg(false); }
  };

  // ── USER CRUD Handlers ──
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setSubmittingUser(true);
    try {
      if (editingUser) {
         // Update API: userForm sends subset Name, Phone, Role
         await api.put(`/auth/users/${editingUser.userId}`, { name: userForm.name, phone: userForm.phone, role: userForm.role });
         alert("User updated successfully");
      } else {
         // Create API
         await api.post('/auth/users', userForm);
         alert("User created successfully by Admin!");
      }
      setOpenUserModal(false);
      setEditingUser(null);
      setUserForm({ name: '', email: '', phone: '', password: '', role: 'USER' });
      fetchData();
    } catch (err) {
      alert("Failed to save user data");
    } finally {
      setSubmittingUser(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("🗑️ Are you sure you want to delete this user? This cannot be undone.")) {
       try {
         await api.delete(`/auth/users/${id}`);
         fetchData();
       } catch (err) { alert("Delete failed. Action restricted."); }
    }
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setUserForm({ name: u.name || '', email: u.email || '', phone: u.phone || '', password: '', role: u.role || 'USER' });
    setOpenUserModal(true);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const getStatusPill = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const calculateAmount = (b) => {
    if (b.totalAmount) return b.totalAmount;
    
    let amount = 0;
    const basePrice = b.pg?.price || 8000;
    
    // Room
    if (b.roomType) {
      let multiplier = 1.0;
      const type = b.roomType.toLowerCase();
      if (type.includes("single")) multiplier = 1.10;
      else if (type.includes("double")) multiplier = 0.85;
      else if (type.includes("triple")) multiplier = 0.70;
      else if (type.includes("4")) multiplier = 0.58;
      else if (type.includes("5")) multiplier = 0.48;
      
      const monthlyRoom = basePrice * multiplier;
      if (b.duration >= 12) amount += (monthlyRoom * 0.85) * b.duration;
      else amount += monthlyRoom * (b.duration || 1);
    }

    // Meals
    if (b.mealPlan) {
      let monthlyMeal = 0;
      const plan = b.mealPlan.toLowerCase();
      if (plan.includes("basic")) monthlyMeal = 3800;
      else if (plan.includes("standard")) monthlyMeal = 5200;
      else if (plan.includes("premium")) monthlyMeal = 7500;
      
      if (b.duration >= 12) amount += (monthlyMeal * 0.85) * b.duration;
      else amount += monthlyMeal * (b.duration || 1);
    }
    return amount;
  };

  const getStatusText = (status) => status?.toUpperCase() || '';

  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredBookings = bookings.filter(b => b.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || b.pg?.pgName?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 font-sans relative overflow-hidden">
      
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed top-16 right-0 bottom-0 left-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div className={`fixed md:sticky top-16 md:top-0 bottom-0 left-0 z-[60] md:z-40 w-64 bg-white border-r border-slate-200/60 flex flex-col shadow-xl md:shadow-sm transition-transform duration-300 md:translate-x-0 overflow-y-auto ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2"><LayoutDashboard className="w-5 h-5 text-indigo-600" /> Control Central</h2>
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-1">StayNest Admin</p>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-400">
             <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-6">
          {[ { id: 'summary', label: 'Dashboard', icon: ShieldAlert }, { id: 'pgs', label: 'Manage PGs', icon: Home }, { id: 'bookings', label: 'All Bookings', icon: BookOpen }, { id: 'users', label: 'Users List', icon: Users } ].map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center px-4 py-3.5 text-sm font-bold rounded-xl transition-all ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}>
              <tab.icon className={`mr-3 h-5 w-5 ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`} />{tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center font-black text-indigo-700">
             {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <button onClick={() => setOpenPasswordModal(true)} className="flex-1 min-w-0 text-left cursor-pointer hover:bg-slate-100/80 p-1 rounded-lg transition-colors">
             <p className="text-xs font-black text-slate-800 truncate">{user?.name || 'Admin'}</p>
             <p className="text-[9px] font-semibold text-slate-400 truncate">{user?.email || 'admin@staynest.com'}</p>
          </button>
        </div>
        <div className="p-4 border-t border-slate-100">
          <button onClick={() => navigate('/')} className="w-full flex items-center px-4 py-3 text-sm font-bold text-indigo-600 hover:bg-slate-50 border border-indigo-100/50 rounded-xl transition-colors mb-2"><Home className="mr-3 h-5 w-5 text-indigo-500" /> User View</button>
          <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"><LogOut className="mr-3 h-5 w-5 text-rose-500" /> Sign Out</button>
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
        
        {/* Mobile Navbar Header */}
        <div className="md:hidden bg-white px-4 py-3 border-b border-slate-100 flex items-center justify-between sticky top-0 z-20">
          <h2 className="text-md font-black text-slate-800 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-indigo-600" /> Control Central
          </h2>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-600 active:scale-95 transition-transform">
             {isMobileMenuOpen ? <ArrowLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight capitalize">{activeTab} View</h1>
            <p className="text-sm text-slate-500 font-medium">Manage and optimize your operations quickly.</p>
          </div>
          {activeTab === 'users' && (
             <button onClick={() => { setEditingUser(null); setUserForm({ name: '', email: '', phone: '', password: '', role: 'USER' }); setOpenUserModal(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform"><UserPlus className="w-4 h-4" /> Add User</button>
          )}
        </div>

        {loading ? ( <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div></div> ) : (
          <>
            {activeTab === 'summary' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {[ { title: "Total Users", count: summaryData.users, icon: Users, color: "text-blue-600", lightColor: "bg-blue-50" }, { title: "Total Bookings", count: summaryData.bookings, icon: BookOpen, color: "text-indigo-600", lightColor: "bg-indigo-50" }, { title: "Listed PGs", count: summaryData.pgs, icon: Home, color: "text-emerald-600", lightColor: "bg-emerald-50" }, { title: "Pending Orders", count: summaryData.pending, icon: Clock, color: "text-amber-600", lightColor: "bg-amber-50" } ].map((card, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between">
                    <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{card.title}</p><h3 className="text-3xl font-black text-slate-900">{card.count}</h3></div>
                    <div className={`p-4 rounded-xl ${card.lightColor}`}><card.icon className={`w-6 h-6 ${card.color}`} /></div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'pgs' && (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30">
                 <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-600"><MapPin className="w-10 h-10" /></div>
                 <h2 className="text-xl font-black text-slate-900 mb-2">Create New PG Item</h2>
                 <p className="text-slate-500 text-sm max-w-sm text-center mb-6 font-medium">Add a property with address details. Coordinates predicted automatically safely on save.</p>
                 <button onClick={() => setOpenPgModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg active:scale-95 transition-transform"><Plus className="w-4 h-4" /> Add New PG Listing</button>
              </div>
            )}

            {(activeTab === 'bookings' || activeTab === 'users') && (
               <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                 <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between backdrop-blur items-start sm:items-center gap-4 bg-slate-50/50">
                    <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-slate-400" /></div><input type="text" placeholder={`Search ${activeTab}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm w-64 outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                 </div>

                 <div className="overflow-x-auto">
                   <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50/70">
                        <tr>
                          {activeTab === 'bookings' ? (
                            <>
                              <th className="px-4 py-4 w-10"></th>
                               <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">Date</th>
                              <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                              <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">PG Information</th>
                              <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                              <th className="px-4 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </>
                          ) : (
                            <>
                              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                              <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {activeTab === 'bookings' && filteredBookings.map((b) => (
                          <React.Fragment key={b.bookingId}>
                            {/* Main Summary Row */}
                            <tr 
                              onClick={() => setExpandedBookingId(expandedBookingId === b.bookingId ? null : b.bookingId)}
                              className={`cursor-pointer transition-all ${expandedBookingId === b.bookingId ? 'bg-slate-50/80 shadow-inner' : 'hover:bg-slate-50/40'}`}
                            >
                              <td className="px-4 py-4 w-10">
                                {expandedBookingId === b.bookingId ? (
                                  <ChevronDown className="w-4 h-4 text-brand-500 animate-bounce-subtle" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-slate-300" />
                                )}
                              </td>
                               <td className="px-4 py-4 hidden sm:table-cell">
                                <div className="text-[11px] font-black text-slate-800">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A'}</div>
                                <div className="text-[10px] font-bold text-slate-400">ID #{b.bookingId}</div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="text-sm font-black text-slate-800 underline decoration-slate-200 underline-offset-4">{b.user?.name || 'Guest User'}</div>
                              </td>
                               <td className="px-4 py-4 max-w-[120px] sm:max-w-none">
                                <div className="text-sm font-black text-slate-800 truncate sm:whitespace-normal">{b.pg?.pgName || 'N/A'}</div>
                                <div className="text-[10px] font-bold text-slate-400 truncate sm:whitespace-normal">{b.pg?.area}</div>
                              </td>
                              <td className="px-4 py-4">
                                <span className={`px-2 py-0.5 text-[10px] font-black rounded-md border ${getStatusPill(b.status)}`}>
                                  {getStatusText(b.status)}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-right">
                                {b.status === 'PENDING' ? (
                                  <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                    <button 
                                      onClick={() => handleUpdateStatus(b.bookingId, 'CONFIRMED')} 
                                      className="p-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-all active:scale-90"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateStatus(b.bookingId, 'CANCELLED')} 
                                      className="p-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 transition-all active:scale-90"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] font-black text-slate-300 uppercase italic">Done</span>
                                )}
                              </td>
                            </tr>

                            {/* Flow-down Details (Expanded) */}
                            {expandedBookingId === b.bookingId && (
                              <tr className="bg-white/50 border-x-2 border-brand-100 animate-in fade-in slide-in-from-top-1 duration-200">
                                <td colSpan="6" className="px-2 sm:px-4 py-6 overflow-hidden">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-[calc(100vw-70px)] md:max-w-none">
                                    {/* User Block */}
                                    <div className="space-y-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden w-full">
                                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Customer Detail</h4>
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-slate-700">
                                          <Mail className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                                          <span className="text-xs font-bold break-all">{b.user?.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-700">
                                          <Phone className="w-3.5 h-3.5 text-brand-400" />
                                          <span className="text-xs font-bold">{b.user?.phone || 'No phone'}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Booking Specifics */}
                                    <div className="space-y-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden w-full">
                                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Plan Details</h4>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                          <div className="text-[9px] font-black text-slate-400 uppercase">Package</div>
                                          <div className="text-xs font-black text-slate-800">{b.duration >= 12 ? 'Yearly' : 'Monthly'}</div>
                                        </div>
                                        <div className="space-y-1">
                                          <div className="text-[9px] font-black text-slate-400 uppercase">Sharing</div>
                                          <div className="text-xs font-black text-slate-800 capitalize">{b.roomType} Share</div>
                                        </div>
                                        <div className="space-y-1">
                                          <div className="text-[9px] font-black text-slate-400 uppercase">Meal Plan</div>
                                          <div className="text-xs font-black text-indigo-600">{b.mealPlan || 'Basic'}</div>
                                        </div>
                                        <div className="space-y-1">
                                          <div className="text-[9px] font-black text-slate-400 uppercase">Check-in</div>
                                          <div className="text-xs font-black text-emerald-600">{b.checkinDate}</div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Financial Summary */}
                                    <div className="space-y-3 p-4 bg-brand-50/30 rounded-xl border border-brand-100 shadow-sm overflow-hidden w-full">
                                      <h4 className="text-[10px] font-black text-brand-400 uppercase tracking-widest border-b border-brand-100/50 pb-2">Pricing Summary</h4>
                                      <div className="flex flex-col justify-center h-full pb-4">
                                        <div className="text-[10px] font-black text-slate-400 lowercase">Total Amount Paid</div>
                                        <div className="text-2xl font-black text-brand-600">₹{(calculateAmount(b)).toLocaleString()}</div>
                                        {b.duration >= 12 && <div className="text-[9px] font-black text-emerald-600 uppercase mt-1">15% Yearly Rebate Applied</div>}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                       {activeTab === 'users' && filteredUsers.map((u) => (
                         <tr key={u.userId} className="hover:bg-slate-50/40 transition-colors">
                           <td className="px-6 py-4 text-xs font-black text-slate-400">#{u.userId}</td>
                           <td className="px-6 py-4 text-sm font-black text-slate-800">{u.name}</td>
                           <td className="px-6 py-4 text-sm font-bold text-slate-500">{u.email}</td>
                           <td className="px-6 py-4"><span className={`px-2 py-1 inline-flex text-xs font-black rounded-md ${u.role?.replace('ROLE_', '') === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>{u.role ? u.role.replace('ROLE_', '') : 'USER'}</span></td>
                           <td className="px-6 py-4 text-right">
                             <div className="flex justify-end gap-2">
                               <button onClick={() => openEditModal(u)} className="p-1 border border-slate-200 text-slate-600 rounded-md hover:bg-slate-100 hover:text-indigo-600"><Edit className="w-4 h-4" /></button>
                               <button onClick={() => handleDeleteUser(u.userId)} className="p-1 border border-slate-200 text-slate-600 rounded-md hover:bg-slate-100 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                             </div>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
            )}
          </>
        )}
      </div>
    </div>

      {/* ── ADD PG MODAL ── */}
      {openPgModal && ( <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"><div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl"><h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2"><MapPin className="text-indigo-600" /> Register PG Property</h3><form onSubmit={handleAddPg} className="space-y-4"><div className="grid grid-cols-2 gap-3"><div className="col-span-2"><label className="text-[11px] font-black text-slate-600 tracking-widest">PG Name *</label><input type="text" required value={newPg.pgName} onChange={e => setNewPg({...newPg, pgName: e.target.value})} className="mt-1 w-full border rounded-xl px-4 py-2 text-sm" /></div><div><label className="text-[11px] font-black text-slate-600 tracking-widest">State *</label><input type="text" required value={newPg.state} onChange={e => setNewPg({...newPg, state: e.target.value})} className="mt-1 w-full border rounded-xl px-4 py-2 text-sm" /></div><div><label className="text-[11px] font-black text-slate-600 tracking-widest">City *</label><input type="text" required value={newPg.city} onChange={e => setNewPg({...newPg, city: e.target.value})} className="mt-1 w-full border rounded-xl px-4 py-2 text-sm" /></div><div><label className="text-[11px] font-black text-slate-600 tracking-widest">Area *</label><input type="text" required value={newPg.area} onChange={e => setNewPg({...newPg, area: e.target.value})} className="mt-1 w-full border rounded-xl px-4 py-2 text-sm" /></div><div><label className="text-[11px] font-black text-slate-600 tracking-widest">Price *</label><input type="number" required value={newPg.price} onChange={e => setNewPg({...newPg, price: e.target.value})} className="mt-1 w-full border rounded-xl px-4 py-2 text-sm" /></div></div><div><label className="text-[11px] font-black text-slate-600 tracking-widest">Address *</label><textarea required value={newPg.address} onChange={e => setNewPg({...newPg, address: e.target.value})} className="mt-1 w-full border rounded-xl px-4 py-2 text-sm h-16" /></div><div className="flex gap-3 pt-4"><button type="button" onClick={() => setOpenPgModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl text-sm font-bold">Cancel</button><button type="submit" disabled={submittingPg} className="flex-1 py-3 bg-indigo-600 text-white font-black rounded-2xl text-sm">{submittingPg ? "Saving..." : "Add PG"}</button></div></form></div></div> )}

      {/* ── USER MANAGEMENT MODAL ── */}
      {openUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
              <UserPlus className="text-indigo-600" /> {editingUser ? "Edit Profile Options" : "Register Admin/User"}
            </h3>
            <p className="text-slate-500 text-xs mb-6 font-medium">Fields requires values. Set accurate levels for management access.</p>

            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Full Name *</label>
                <input type="text" required value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2 font-medium text-sm outline-indigo-500" placeholder="John Doe" />
              </div>

              {!editingUser && (
                <div>
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Email Endpoint *</label>
                  <input type="email" required value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2 font-medium text-sm outline-indigo-500" placeholder="johndoe@email.com" />
                </div>
              )}

              <div>
                <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Phone Address *</label>
                <input type="text" required value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})} className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2 font-medium text-sm outline-indigo-500" placeholder="+91 9876543210" />
              </div>

              {!editingUser && (
                <div>
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Set Password *</label>
                  <input type="password" required value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2 font-medium text-sm outline-indigo-500" placeholder="••••••••" />
                </div>
              )}

              <div>
                <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Account Privilege Level *</label>
                <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="mt-1 w-full border border-slate-200 bg-white rounded-xl px-4 py-2 font-medium text-sm outline-indigo-500">
                   <option value="USER">USER (Standard Tenant)</option>
                   <option value="ADMIN">ADMIN (Control Panel Access)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setOpenUserModal(false); setEditingUser(null); }} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={submittingUser} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-sm shadow-lg shadow-indigo-600/20 active:scale-98 transition-transform disabled:opacity-50">
                   {submittingUser ? "Saving..." : editingUser ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CHANGE PASSWORD MODAL ── */}
      {openPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h4 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">🔑 Change Password</h4>
            <p className="text-slate-500 text-xs mb-5">Set a new key for this account session.</p>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest">New Password *</label>
                <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-indigo-500" placeholder="••••••••" />
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setOpenPasswordModal(false)} className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors">Cancel</button>
                <button type="submit" disabled={submittingPassword} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs shadow-lg shadow-indigo-600/20 active:scale-98 transition-transform">
                   {submittingPassword ? "Saving..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
