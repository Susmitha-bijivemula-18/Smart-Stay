import React, { useState, useContext, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, IndianRupee, ArrowLeft, CheckCircle, Wifi, Coffee, Shield, Loader, AlertCircle, Info, ExternalLink, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';
import LocationDropdown from '../components/LocationDropdown';
import { INDIA_STATES, getCities, getAreas } from '../data/locationData';

const PG_TYPES = [
  { label: 'All PGs', value: 'all' },
  { label: 'Boys PG', value: 'boys' },
  { label: 'Girls PG', value: 'girls' },
  { label: 'Coliving', value: 'both' },
];

const PGCard = ({ pg }) => {
  const navigate = useNavigate();
  const gMapsUrl = `https://www.google.com/maps/search/?api=1&query=${pg.latitude},${pg.longitude}`;
  
  // Dynamic high-quality images for variety
  const images = [
    'https://images.unsplash.com/photo-1555854817-5b2260d5b66b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800'
  ];
  const imageUrl = images[Math.abs((pg.id || pg.pgId || 1).toString().split('').reduce((a,b) => a + b.charCodeAt(0), 0)) % images.length];

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col group h-full">
      
      {/* Upper Half: Image with Overlay */}
      <div 
        onClick={() => window.open(gMapsUrl, '_blank')}
        className="relative h-64 cursor-pointer overflow-hidden isolate"
      >
        <img src={imageUrl} alt={pg.pgName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
        
        {/* Gradients */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-brand-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Floating Location Badge */}
        <div className="absolute top-5 left-5 flex items-center gap-2 px-3 py-1.5 bg-black/30 backdrop-blur-md rounded-xl border border-white/20 text-white shadow-xl">
          <MapPin className="w-3.5 h-3.5 text-brand-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{pg.area}</span>
        </div>

        {/* Type Badge only */}
        <div className="absolute top-5 right-5 flex flex-col items-end gap-1.5">
           {/* PG Type Badge */}
           <div className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-tight shadow-md backdrop-blur-md border ${
             (pg.type || 'Both') === 'Boys' ? 'bg-sky-500/80 border-sky-400/30 text-white' :
             (pg.type || 'Both') === 'Girls' ? 'bg-pink-500/80 border-pink-400/30 text-white' :
             'bg-purple-500/80 border-purple-400/30 text-white'
           }`}>
             {(pg.type || 'Both') === 'Boys' ? '♂ Boys PG' : (pg.type || 'Both') === 'Girls' ? '♀ Girls PG' : '⇌ Coliving'}
           </div>
        </div>

        {/* PG Info overlay */}
        <div className="absolute bottom-5 left-5 right-5">
           <h3 className="font-black text-white text-xl tracking-tight mb-2 group-hover:text-brand-300 transition-colors">{pg.pgName}</h3>
           <div className="flex items-center gap-3">
             <div className="flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-lg text-slate-900">
               <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
               <span className="text-[11px] font-black">{pg.rating}</span>
             </div>
             <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
               {pg.city}
             </span>
           </div>
        </div>

        {/* Hover Interaction */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-90 group-hover:scale-100">
           <div className="bg-white text-brand-600 px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2 border border-brand-100">
             <ExternalLink className="w-3.5 h-3.5" /> View on Google Maps
           </div>
        </div>
      </div>

      {/* Lower Half: Action Only */}
      <div className="p-5 flex flex-col bg-white">
        {/* Price summary */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">Starting from</p>
            <div className="text-xl font-black text-slate-900 flex items-center gap-0.5">
              <span>₹</span>
              <span>{pg.price ? Number(pg.price).toLocaleString('en-IN') : '6,000'}</span>
              <span className="text-[10px] text-slate-400 font-medium ml-1">/mo</span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-0.5">Location</p>
            <p className="text-xs font-bold text-slate-700 truncate max-w-[100px] mb-1">{pg.area}</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/dashboard', { state: { pg } })}
          className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-500/20 transition-all hover:shadow-brand-500/40 active:scale-[0.98] flex items-center justify-center gap-2 mt-auto"
        >
          Slot Booking <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Listings = () => {
  const { user, loading: authLoading } = useContext(AuthContext);

  // Restore from sessionStorage on mount (when navigating back from Dashboard)
  const saved = (() => { try { return JSON.parse(sessionStorage.getItem('pg_search') || 'null'); } catch { return null; } })();

  const [selectedState, setSelectedState] = useState(saved?.selectedState || '');
  const [selectedCity, setSelectedCity]   = useState(saved?.selectedCity  || '');
  const [selectedArea, setSelectedArea]   = useState(saved?.selectedArea  || '');
  const [pgFilter, setPgFilter]           = useState(saved?.pgFilter || 'all');
  const [cities, setCities]               = useState(saved?.selectedState ? getCities(saved.selectedState) : []);
  const [areas, setAreas]                 = useState(saved?.selectedCity  ? getAreas(saved.selectedState, saved.selectedCity) : []);
  const [searched, setSearched]           = useState(saved?.pgs?.length > 0);
  const [pgs, setPgs]                     = useState(saved?.pgs || []);
  const [loading, setLoading]             = useState(false);
  const [isAiServiceLive, setIsAiServiceLive] = useState(true);
  const [townsMap, setTownsMap]           = useState({});

  // 1. Load Cities (Fixed major hubs + dynamic discovery)
  useEffect(() => {
    // reset dependent states when state changes
    setSelectedCity('');
    setSelectedArea('');
    
    if (!selectedState) {
      setCities([]);
      setAreas([]);
      return;
    }

    // Phase 1: Instant Local Load
    const hardcodedCities = getCities(selectedState);
    setCities([...hardcodedCities.sort(), "All Cities / Nearby Towns"]);
  }, [selectedState]);

  // 2. Load Areas / Villages
  useEffect(() => {
    // reset area when city changes
    setSelectedArea('');
    
    if (!selectedState) return;

    let baseAreas = [];
    if (selectedCity && selectedCity !== "All Cities / Nearby Towns") {
      baseAreas = getAreas(selectedState, selectedCity);
    }
    
    setAreas(baseAreas.sort());
  }, [selectedCity, selectedState]);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);

    try {
      // Fetch exactly the 10 PGs from the Database universally
      const res = await axios.get(`${API_BASE_URL}/pg/list`);
      let data = res.data || [];
      
      setPgs(data);
      setIsAiServiceLive(true);
      
      sessionStorage.setItem('pg_search', JSON.stringify({
        selectedState, selectedCity, selectedArea, pgs: data, pgFilter
      }));
    } catch (err) {
      console.warn("Backend Service not responding.", err);
      setIsAiServiceLive(false);
      setPgs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = pgs.filter(pg => {
    if (pgFilter === 'all') return true;
    const t = (pg.type || 'Both').toLowerCase();
    if (pgFilter === 'boys') return t === 'boys';
    if (pgFilter === 'girls') return t === 'girls';
    if (pgFilter === 'both') return t === 'both';
    return true;
  });

  const reset = () => {
    setSearched(false);
    setPgs([]);
    setSelectedArea('');
    sessionStorage.removeItem('pg_search');
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-500"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  if (!searched) return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center py-12">
      <div className="max-w-lg w-full mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white text-brand-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-slate-200 shadow-sm">
             <MapPin className="w-3 h-3" /> Explore Verified Stays
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-3 whitespace-nowrap">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600">Perfect</span> Space
          </h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">Select your preferred location to discover premium accommodations.</p>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5">
          <LocationDropdown label="Select State" placeholder="E.g. Andhra Pradesh" options={INDIA_STATES} value={selectedState} onChange={setSelectedState} />
          <LocationDropdown label="Select City" placeholder="Major Cities" options={cities} value={selectedCity} onChange={setSelectedCity} disabled={!selectedState} />
          <LocationDropdown 
            label="Select Area / Village" 
            placeholder={selectedCity === "All Cities / Nearby Towns" ? "Search any Area or Village" : "Search neighborhood"} 
            options={areas} 
            value={selectedArea} 
            onChange={setSelectedArea} 
            disabled={!selectedState} 
          />

          <div className="pt-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">I am looking for</label>
            <div className="grid grid-cols-4 gap-2">
              {PG_TYPES.map(t => (
                <button key={t.value} onClick={() => {
                  setPgFilter(t.value);
                  // Also persist filter so it's restored when navigating back
                  try {
                    const prev = JSON.parse(sessionStorage.getItem('pg_search') || '{}');
                    sessionStorage.setItem('pg_search', JSON.stringify({ ...prev, pgFilter: t.value }));
                  } catch {}
                }} className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-tight border transition-all ${pgFilter === t.value ? 'bg-brand-600 text-white border-brand-600 shadow-xl' : 'bg-white text-slate-500 border-slate-200 hover:border-brand-200'}`}>
                  {t.label.replace(' PG', '')}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSearch} disabled={!selectedState || loading} className={`w-full py-6 rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all mt-4 ${selectedState && !loading ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-2xl hover:-translate-y-1 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}>
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            {loading ? 'Analyzing Map Data...' : 'Start Prediction'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200 py-4 px-6 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4">
          <button onClick={reset} className="flex items-center gap-2 text-[10px] font-black text-brand-600 hover:text-brand-700 uppercase transition-colors bg-brand-50 px-4 py-2 rounded-xl border border-brand-100"><ArrowLeft className="w-4 h-4" /> New Search</button>
          <div className="flex-1 flex items-center gap-3 bg-white rounded-2xl px-5 py-2.5 border border-slate-200 shadow-sm">
            <MapPin className="w-4 h-4 text-brand-500" />
            <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{selectedArea || 'All Localities'}, {selectedCity}</span>
          </div>
          {!isAiServiceLive && (
             <div className="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-[10px] font-black uppercase tracking-tight flex items-center gap-2 shadow-sm">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> AI Insights Limited (Offline)
             </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
           <div className="flex items-center gap-3 mb-3">
             <div className="flex items-center gap-1.5 bg-brand-50 px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-brand-600 uppercase tracking-widest">Live Integration</span>
             </div>
             <span className="h-px flex-1 bg-slate-200/60" />
           </div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">Available Accommodations</h2>
           <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.1em]">
             {filteredResults.length} properties discovered in {selectedCity} area
           </p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">{[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-[3rem] h-[32rem] animate-pulse border border-slate-100 shadow-sm"></div>)}</div>
        ) : filteredResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredResults.map((pg) => <PGCard key={pg.id || pg.pgId} pg={pg} />)}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[4rem] border border-slate-200 shadow-xl max-w-3xl mx-auto px-12">
            <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <Search className="w-10 h-10 text-brand-600" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">No Results Found</h3>
            <p className="text-slate-400 text-lg font-bold mb-10 leading-relaxed italic">Our AI couldn't find any hostels or PGs in that exact city on the map yet. Try a broader search or a nearby city.</p>
            <button onClick={reset} className="px-12 py-5 bg-brand-600 text-white text-xs font-black uppercase tracking-widest rounded-3xl hover:bg-brand-700 transition-all shadow-2xl hover:-translate-y-2 active:scale-95">Search Another City</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Listings;
