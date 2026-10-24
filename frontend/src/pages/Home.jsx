import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Phone, HelpCircle, Mail, MessageSquare, 
  Building2, Users, IndianRupee, MapPin, 
  Search, ArrowRight, ShieldCheck, Map, 
  ChevronRight, ChevronLeft
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const HERO_PROPERTIES = [
  {
    id: 1,
    title: 'Stanza Living Luxe Sanctuary',
    location: 'Koramangala 4th Block, Bengaluru',
    price: 12500,
    bedsLeft: 2,
    rating: '4.95',
    tag: 'Executive Studio',
    category: 'coliving',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1920&q=85',
  },
  {
    id: 2,
    title: 'Urban Nest Designer Loft',
    location: 'HSR Layout Sector 3, Bengaluru',
    price: 10800,
    bedsLeft: 3,
    rating: '4.88',
    tag: 'Tech Hub Premium',
    category: 'boys',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1920&q=85',
  },
  {
    id: 3,
    title: 'Zolo CyberPark Penthouse Suites',
    location: 'Gachibowli Financial Dist, Hyderabad',
    price: 13500,
    bedsLeft: 1,
    rating: '4.98',
    tag: 'Ultra Luxury Living',
    category: 'coliving',
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1920&q=85',
  },
  {
    id: 4,
    title: 'Boston Heights Co-Living Villa',
    location: 'Whitefield EPIP Zone, Bengaluru',
    price: 11200,
    bedsLeft: 4,
    rating: '4.85',
    tag: 'Executive Villa',
    category: 'girls',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=85',
  },
  {
    id: 5,
    title: 'Indiranagar Boutique Social Club',
    location: '100ft Road Indiranagar, Bengaluru',
    price: 14000,
    bedsLeft: 2,
    rating: '4.92',
    tag: 'Boutique Co-Living',
    category: 'coliving',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1920&q=85',
  },
  {
    id: 6,
    title: 'Palm Grove Modern Residency',
    location: 'Koregaon Park, Pune',
    price: 11800,
    bedsLeft: 3,
    rating: '4.90',
    tag: 'Designer Suites',
    category: 'coliving',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=85',
  }
];

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [heroSearch, setHeroSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [mobileSupportMode, setMobileSupportMode] = useState('grid'); // 'grid' | 'list'
  
  // Crossfade state management: prevSlide stays 100% visible beneath activeSlide during 1200ms dissolve
  const [activeSlide, setActiveSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(0);

  // Preload all high-res background images so transitions never flicker
  useEffect(() => {
    HERO_PROPERTIES.forEach(prop => {
      const img = new Image();
      img.src = prop.image;
    });
  }, []);

  // Update prevSlide after 1200ms crossfade finishes so underlying layer is ready for the next slide
  useEffect(() => {
    const timer = setTimeout(() => {
      setPrevSlide(activeSlide);
    }, 1200);
    return () => clearTimeout(timer);
  }, [activeSlide]);

  // Non-stop, continuous auto-loop: changes smoothly every 5.5s without getting stuck
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((curr) => {
        setPrevSlide(curr);
        return (curr + 1) % HERO_PROPERTIES.length;
      });
    }, 5500);

    return () => clearInterval(timer);
  }, []);

  const changeSlide = (nextIndex) => {
    if (nextIndex === activeSlide) return;
    setPrevSlide(activeSlide);
    setActiveSlide(nextIndex);
  };

  const handleNextSlide = () => {
    setActiveSlide((curr) => {
      setPrevSlide(curr);
      return (curr + 1) % HERO_PROPERTIES.length;
    });
  };

  const handlePrevSlide = () => {
    setActiveSlide((curr) => {
      setPrevSlide(curr);
      return (curr - 1 + HERO_PROPERTIES.length) % HERO_PROPERTIES.length;
    });
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (heroSearch.trim()) params.set('search', heroSearch.trim());
    if (activeCategory !== 'all') params.set('type', activeCategory);
    navigate(`/listings${params.toString() ? `?${params.toString()}` : ''}`);
  };

  useEffect(() => {
    setMounted(true);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

    const hiddenElements = document.querySelectorAll('.scroll-reveal');
    hiddenElements.forEach((el) => observer.observe(el));

    return () => {
      hiddenElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  const currentProperty = HERO_PROPERTIES[activeSlide];

  return (
    <div className="w-full bg-[#0a0f1d] font-sans overflow-hidden selection:bg-emerald-500 selection:text-white">
      
      {/* ─── VISIBLE CINEMATIC KEN BURNS HARDWARE-ACCELERATED SMOOTH ZOOM ─── */}
      <style>{`
        @keyframes kenBurnsZoomInA {
          0% {
            transform: scale(1.0) translate3d(0, 0, 0);
          }
          100% {
            transform: scale(1.18) translate3d(0, -14px, 0);
          }
        }
        @keyframes kenBurnsZoomOutB {
          0% {
            transform: scale(1.18) translate3d(8px, -6px, 0);
          }
          100% {
            transform: scale(1.02) translate3d(-6px, 0, 0);
          }
        }
        @keyframes kenBurnsZoomInC {
          0% {
            transform: scale(1.0) translate3d(-8px, 0, 0);
          }
          100% {
            transform: scale(1.17) translate3d(8px, -10px, 0);
          }
        }
        @keyframes kenBurnsZoomInD {
          0% {
            transform: scale(1.0) translate3d(6px, 0, 0);
          }
          100% {
            transform: scale(1.18) translate3d(-6px, -12px, 0);
          }
        }

        .ken-burns-0 { animation: kenBurnsZoomInA 8.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; will-change: transform; }
        .ken-burns-1 { animation: kenBurnsZoomOutB 8.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; will-change: transform; }
        .ken-burns-2 { animation: kenBurnsZoomInC 8.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; will-change: transform; }
        .ken-burns-3 { animation: kenBurnsZoomInD 8.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; will-change: transform; }
        .ken-burns-4 { animation: kenBurnsZoomOutB 8.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; will-change: transform; }
        .ken-burns-5 { animation: kenBurnsZoomInA 8.5s cubic-bezier(0.25, 1, 0.5, 1) forwards; will-change: transform; }

        .ken-burns-idle {
          transform: scale(1.0);
        }

        .scroll-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .scroll-reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .delay-100 { transition-delay: 100ms; }
        .delay-200 { transition-delay: 200ms; }
        .delay-300 { transition-delay: 300ms; }
        .delay-400 { transition-delay: 400ms; }
        .delay-500 { transition-delay: 500ms; }
      `}</style>

      {/* ─── FULL-BLEED CINEMATIC HERO SECTION (100VH FIT — ZERO BOTTOM GAP) ─── */}
      <section className="relative h-screen min-h-[640px] w-full flex flex-col justify-between overflow-hidden isolate">
        
        {/* ── 1. DUAL-LAYER ZERO-BLINK BACKGROUND WITH DYNAMIC SMOOTH ZOOM ── */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-black">
          {HERO_PROPERTIES.map((prop, idx) => {
            const isCurrent = idx === activeSlide;
            const isPrev = idx === prevSlide;

            let opacityStyle = 'opacity-0 z-0 pointer-events-none';
            if (isCurrent) {
              opacityStyle = 'opacity-100 z-20';
            } else if (isPrev) {
              opacityStyle = 'opacity-100 z-10';
            }

            // When current or prev, maintain active Ken Burns zoom animation so crossfade is buttery smooth
            const animClass = (isCurrent || isPrev) ? `ken-burns-${idx % 6}` : 'ken-burns-idle';

            return (
              <div 
                key={prop.id}
                className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${opacityStyle}`}
              >
                <img 
                  src={prop.image} 
                  alt={prop.title}
                  className={`w-full h-full object-cover object-center ${animClass}`}
                  loading="eager"
                />
              </div>
            );
          })}

          {/* ── 2. SOFT NATURAL VIGNETTES WITH AMBIENT RADIAL CONTRAST GLOW ── */}
          <div className="absolute top-0 inset-x-0 h-36 z-20 bg-gradient-to-b from-black/70 via-black/25 to-transparent pointer-events-none" />
          <div className="absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.45)_0%,rgba(0,0,0,0.22)_50%,transparent_85%)] pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-44 z-20 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
        </div>

        {/* ── 3. CLEAN, BALANCED EDITORIAL CONTENT (CENTERED & PROPORTIONAL) ── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-8 relative z-30 w-full flex-1 flex flex-col justify-center items-center text-center">
          
          {/* Small, Refined Luxury Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-4 shadow-xs select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Zero Brokerage Stays</span>
          </div>
          
          {/* Master Headline (Outfit / font-display with Metallic Emerald Gradient Accent) */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.65rem] font-black tracking-tight leading-[1.08] mb-4 text-center select-none max-w-3xl drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
            <span className="text-white">
              Discover &amp; Book
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-100 to-white">
              Premium PG Living.
            </span>
          </h1>
          
          {/* Subheadline: Clean, Punchy 6-Word Value Prop */}
          <p className="text-sm sm:text-base text-white/95 font-medium max-w-md mx-auto leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] mb-7">
            Verified luxury stays with zero brokerage.
          </p>
          
          {/* ── 4. COMPACT FLOATING SEARCH CAPSULE ── */}
          <div className="w-full max-w-xl bg-white/95 backdrop-blur-2xl p-1.5 sm:p-2 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.45)] border border-white/80 mb-5 transition-all hover:shadow-[0_25px_60px_rgba(0,0,0,0.55)]">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="flex items-center gap-2.5 pl-4 sm:pl-5 flex-1 min-w-0">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search locality (e.g. Koramangala, HSR, Indiranagar)..." 
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  className="w-full bg-transparent border-none text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 sm:py-3 bg-slate-950 hover:bg-emerald-600 active:bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0 cursor-pointer group"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Explore</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>
          </div>

          {/* Quick Category Chips */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: 'All Stays' },
              { id: 'boys', label: 'Boys PG' },
              { id: 'girls', label: 'Girls PG' },
              { id: 'coliving', label: 'Co-Living' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  const params = new URLSearchParams();
                  if (heroSearch.trim()) params.set('search', heroSearch.trim());
                  if (cat.id !== 'all') params.set('type', cat.id);
                  navigate(`/listings${params.toString() ? `?${params.toString()}` : ''}`);
                }}
                className={`px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-white text-slate-950 font-black shadow-md'
                    : 'bg-black/35 text-white/85 hover:bg-black/55 hover:text-white border border-white/20 backdrop-blur-md'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>

        {/* ── 5. SUBTLE BOTTOM CONTROLS & ROOM INFO (PERFECTLY ALIGNED) ── */}
        <div className="w-full relative z-30 pb-6 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Active Room Caption */}
            <button
              type="button"
              onClick={() => navigate(`/listings?search=${encodeURIComponent(currentProperty.title)}`)}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-black/35 backdrop-blur-md border border-white/20 text-white hover:bg-black/55 transition-all cursor-pointer text-left text-xs font-bold"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-xs text-white/95">{currentProperty.title}</span>
              <span className="text-white/60">·</span>
              <span className="text-emerald-300 font-black">₹{currentProperty.price.toLocaleString()}</span>
              <ArrowRight className="w-3.5 h-3.5 text-white/60 shrink-0" />
            </button>

            {/* Slide Progress Bars */}
            <div className="flex items-center gap-2">
              {HERO_PROPERTIES.map((_, idx) => {
                const isCurrent = idx === activeSlide;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => changeSlide(idx)}
                    className="relative h-1 rounded-full transition-all duration-300 cursor-pointer overflow-hidden"
                    style={{ width: isCurrent ? '36px' : '12px' }}
                    aria-label={`Slide ${idx + 1}`}
                  >
                    <div className={`absolute inset-0 rounded-full transition-colors duration-300 ${isCurrent ? 'bg-white' : 'bg-white/30 hover:bg-white/60'}`} />
                  </button>
                );
              })}
            </div>

            {/* Next / Previous Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevSlide}
                className="w-8 h-8 rounded-full bg-black/35 hover:bg-black/60 text-white flex items-center justify-center transition-all border border-white/20 backdrop-blur-md cursor-pointer active:scale-90"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <button
                type="button"
                onClick={handleNextSlide}
                className="w-8 h-8 rounded-full bg-black/35 hover:bg-black/60 text-white flex items-center justify-center transition-all border border-white/20 backdrop-blur-md cursor-pointer active:scale-90"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </section>

      {/* ─── CURATED CATEGORIES SECTION (ELEVATED EMERALD LUXURY ARCHITECTURAL CARDS) ─── */}
      <section className="w-full bg-[#f8fafc] py-20 sm:py-24 border-b border-slate-200/70 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header with Refined Emerald & White Brand Harmony */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 scroll-reveal">
            <div>
              <div className="inline-flex items-center gap-2 text-emerald-800 bg-emerald-50 text-[11px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full border border-emerald-200/80 shadow-xs mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span>Curated Living Collections</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                Explore by <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800">Lifestyle &amp; Preference</span>
              </h2>
              <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-xl font-normal leading-relaxed">
                Discover verified boys' hostels, safe women's sanctuaries, and modern community co-living residences.
              </p>
            </div>

            <Link 
              to="/listings"
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors shrink-0 group"
            >
              <span>View all properties</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Clean 4-Column Architectural Cards Grid with Ambient Glow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
            {[
              {
                title: "Boys Hostels & PGs",
                subtitle: "Nutritious meals, high-speed WiFi, gym & daily housekeeping.",
                badge: "Boys Living • 140+ Stays",
                priceLabel: "Starting from",
                price: "₹7,500",
                period: "/mo",
                features: ["Chef Meals", "High-speed WiFi", "Zero Brokerage"],
                image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=900",
                link: "/listings?type=boys",
                action: "Explore"
              },
              {
                title: "Girls Hostels & PGs",
                subtitle: "Biometric entry, 24/7 security & dedicated female wardens.",
                badge: "Girls Living • 110+ Stays",
                priceLabel: "Starting from",
                price: "₹8,200",
                period: "/mo",
                features: ["Biometric Gate", "24/7 Security", "Curated Food"],
                image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=900",
                link: "/listings?type=girls",
                action: "Explore"
              },
              {
                title: "Modern Co-Living",
                subtitle: "Community lounges, ergonomic work desks & curated social events.",
                badge: "Co-Living • 95+ Hubs",
                priceLabel: "Starting from",
                price: "₹11,000",
                period: "/mo",
                features: ["Work Desks", "Gaming Lounge", "Social Events"],
                image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=900",
                link: "/listings?type=both",
                action: "Explore"
              },
              {
                title: "Prime Tech Corridors",
                subtitle: "Instant map discovery near major tech parks & metro stations.",
                badge: "Live Radar • 350+ Stays",
                priceLabel: "Browse by",
                price: "Live Map",
                period: "",
                features: ["Near Tech Parks", "Live Radar", "Metro Access"],
                image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=900",
                link: "/listings",
                action: "Open Map"
              }
            ].map((cat, idx) => (
              <Link
                key={idx}
                to={cat.link}
                className={`scroll-reveal delay-${(idx + 1) * 100} group bg-white rounded-3xl p-3.5 sm:p-4 border border-slate-200/80 hover:border-emerald-500/50 shadow-xs hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden relative isolate`}
              >
                {/* Subtle Ambient Hover Glow */}
                <div className="absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-bl from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div>
                  {/* Photo Container with Single Clean Top Badge */}
                  <div className="relative h-52 sm:h-56 w-full rounded-2xl overflow-hidden bg-slate-100 mb-4 isolate shadow-2xs">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    
                    {/* Single Clean Floating Status Badge - Zero Collision */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-md text-slate-800 shadow-sm border border-white/80">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {cat.badge}
                      </span>
                    </div>
                  </div>

                  {/* Card Typography */}
                  <div className="px-1">
                    <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1 line-clamp-2 font-normal">
                      {cat.subtitle}
                    </p>

                    {/* Clean Minimalist Amenity Chips */}
                    <div className="flex items-center gap-1.5 mt-3.5 flex-wrap">
                      {cat.features.map((feat, fIdx) => (
                        <span
                          key={fIdx}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clean Bottom Action Row - Zero Overlap Guaranteed */}
                <div className="px-1 pt-3.5 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {cat.priceLabel}
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
                        {cat.price}
                      </span>
                      {cat.period && (
                        <span className="text-xs text-slate-400 font-medium">{cat.period}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 group-hover:text-emerald-600 transition-colors">
                    <span>{cat.action}</span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-700 flex items-center justify-center transition-all duration-300 shadow-2xs group-hover:shadow-md group-hover:shadow-emerald-600/30">
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ─── 24/7 DEDICATED SUPPORT ─── */}
      <section className="w-full bg-[#f8fafc] py-20 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
            
            <div className="flex-1 w-full max-w-xl lg:max-w-none scroll-reveal delay-200">
              {/* ── Mobile-Only Header: Live Status & Layout Variation Switch ── */}
              <div className="sm:hidden flex items-center justify-between gap-2 mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800">24/7 Concierge</span>
                </div>

                {/* Mobile Variation Switcher */}
                <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-200/90 border border-slate-300/80 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setMobileSupportMode('grid')}
                    className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
                      mobileSupportMode === 'grid'
                        ? 'bg-white text-slate-900 shadow-xs font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ⊞ 2×2 Tiles
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileSupportMode('list')}
                    className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
                      mobileSupportMode === 'list'
                        ? 'bg-white text-slate-900 shadow-xs font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ☰ List Hub
                  </button>
                </div>
              </div>

              {/* ── Mobile Variation 1: 2x2 Interactive Luxury Tiles (Compact & High-Density) ── */}
              {mobileSupportMode === 'grid' && (
                <div className="grid grid-cols-2 gap-2.5 sm:hidden">
                  {[
                    { icon: Phone, label: 'Resident Helpline', desc: '1234567890', actionText: 'Call Now', color: 'text-amber-600', badgeBg: 'bg-amber-500/10 text-amber-700 border-amber-200', gradient: 'from-amber-400 to-amber-600', shadow: 'shadow-amber-500/20', tag: 'Direct', href: 'tel:1234567890' },
                    { icon: MessageSquare, label: 'WhatsApp Concierge', desc: 'Direct fast chat', actionText: 'Chat Now', color: 'text-emerald-600', badgeBg: 'bg-emerald-500/10 text-emerald-700 border-emerald-200', gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20', tag: '< 2 min', href: 'https://wa.me/1234567890' },
                    { icon: Mail, label: 'Email Desk', desc: 'support@staynest.com', actionText: 'Send Email', color: 'text-cyan-600', badgeBg: 'bg-cyan-500/10 text-cyan-700 border-cyan-200', gradient: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/20', tag: 'Official', href: 'mailto:support@staynest.com' },
                    { icon: HelpCircle, label: 'Help & Policies', desc: 'Instant refund FAQ', actionText: 'View FAQs', color: 'text-indigo-600', badgeBg: 'bg-indigo-500/10 text-indigo-700 border-indigo-200', gradient: 'from-indigo-500 to-purple-600', shadow: 'shadow-indigo-500/20', tag: 'Guides', href: '/refund-request' },
                  ].map((f, idx) => (
                    <a 
                      key={idx} 
                      href={f.href} 
                      className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.98] flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2.5">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${f.gradient} text-white flex items-center justify-center shadow-md ${f.shadow} shrink-0 group-hover:scale-105 transition-transform`}>
                            <f.icon className="w-4.5 h-4.5" />
                          </div>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${f.badgeBg}`}>
                            {f.tag}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 text-xs tracking-tight truncate group-hover:text-emerald-700 transition-colors">
                          {f.label}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                          {f.desc}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-700 group-hover:text-emerald-700">
                        <span>{f.actionText}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {/* ── Mobile Variation 2: Executive Concierge Hub (Horizontal Unified List) ── */}
              {mobileSupportMode === 'list' && (
                <div className="sm:hidden bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100">
                  {[
                    { icon: Phone, label: 'Resident Helpline', desc: '1234567890', sub: '24/7 Toll-free resident line', actionText: 'Call', color: 'text-amber-600', badgeBg: 'bg-amber-50 text-amber-800 border-amber-200', gradient: 'from-amber-400 to-amber-600', shadow: 'shadow-amber-500/20', href: 'tel:1234567890' },
                    { icon: MessageSquare, label: 'WhatsApp Concierge', desc: 'Direct fast response', sub: 'Average reply under 2 mins', actionText: 'Chat', color: 'text-emerald-600', badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200', gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20', href: 'https://wa.me/1234567890' },
                    { icon: Mail, label: 'Email Desk', desc: 'support@staynest.com', sub: 'Official concierge inquiries', actionText: 'Email', color: 'text-cyan-600', badgeBg: 'bg-cyan-50 text-cyan-800 border-cyan-200', gradient: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/20', href: 'mailto:support@staynest.com' },
                    { icon: HelpCircle, label: 'Help Center & Policies', desc: 'Instant refund guides', sub: 'Policies, deposits & FAQ', actionText: 'Guides', color: 'text-indigo-600', badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200', gradient: 'from-indigo-500 to-purple-600', shadow: 'shadow-indigo-500/20', href: '/refund-request' },
                  ].map((f, idx) => (
                    <a 
                      key={idx} 
                      href={f.href} 
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors active:bg-slate-100 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} text-white flex items-center justify-center shadow-md ${f.shadow} shrink-0 group-hover:scale-105 transition-transform`}>
                          <f.icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-xs tracking-tight group-hover:text-emerald-700 transition-colors truncate">
                            {f.label}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                            {f.desc} • {f.sub}
                          </p>
                        </div>
                      </div>

                      <span className={`shrink-0 inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl border ${f.badgeBg} group-hover:shadow-xs transition-all`}>
                        {f.actionText}
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </a>
                  ))}
                </div>
              )}

              {/* ── Desktop View (Preserved Classic 2-Column Grid) ── */}
              <div className="hidden sm:grid sm:grid-cols-2 gap-3.5">
                {[
                  { icon: Phone, label: 'Resident Helpline', desc: '1234567890', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', href: 'tel:1234567890' },
                  { icon: MessageSquare, label: 'WhatsApp Concierge', desc: 'Direct fast response', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200', href: 'https://wa.me/1234567890' },
                  { icon: Mail, label: 'Email Desk', desc: 'support@staynest.com', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', href: 'mailto:support@staynest.com' },
                  { icon: HelpCircle, label: 'Help Center & Policies', desc: 'Instant refund guides', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', href: '/refund-request' },
                ].map((f, idx) => (
                  <a key={idx} href={f.href} className={`scroll-reveal delay-${(idx + 1) * 100} rounded-2xl p-5 border ${f.bg} hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group block bg-white`}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-xs border border-slate-100 mb-3 group-hover:scale-110 transition-transform">
                      <f.icon className={`w-5 h-5 ${f.color}`} />
                    </div>
                    <p className="font-black text-slate-900 text-sm tracking-tight">{f.label}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{f.desc}</p>
                  </a>
                ))}
              </div>
            </div>

            <div className="flex-1 text-center lg:text-left scroll-reveal">
              <span className="inline-block bg-slate-200 text-slate-800 text-[10px] font-black px-3 py-1.5 rounded-md mb-4 uppercase tracking-widest border border-slate-300">
                24/7 Dedicated Assistance
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 leading-tight tracking-tight mb-4">
                Have Any Queries?<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600">
                  We're Here Around the Clock.
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                Whether you need assistance choosing a PG or tracking a deposit refund, our concierge team is always here for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <a 
                  href="tel:1234567890" 
                  className="inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-black text-white px-7 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> 
                  <span>Call Us Directly</span>
                </a>
                <Link 
                  to="/refund-request"
                  className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 px-7 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-2xs"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>Settlement Policy</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
