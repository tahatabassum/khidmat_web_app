import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { ProviderHome } from './ProviderHome';
import { 
  Zap, 
  Droplet, 
  Hammer, 
  Paintbrush, 
  Snowflake, 
  Sparkles, 
  Settings, 
  Car, 
  Sprout, 
  Truck, 
  Bug, 
  Eye, 
  Flame, 
  Layers, 
  Wrench, 
  Camera, 
  Video, 
  PartyPopper, 
  Music, 
  Utensils, 
  UserCheck,
  Search,
  Mic,
  ShieldCheck,
  AlertCircle,
  Heart,
  Users
} from 'lucide-react';

export interface Category {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  text: string;
}

export const CATEGORIES: Category[] = [
  { name: "Electrician", icon: Zap, color: "bg-primary-container/10", text: "text-primary dark:text-primary-fixed" },
  { name: "Plumber", icon: Droplet, color: "bg-secondary-container/10", text: "text-secondary dark:text-secondary-fixed" },
  { name: "Carpenter", icon: Hammer, color: "bg-tertiary-container/10", text: "text-tertiary dark:text-tertiary-fixed" },
  { name: "Painter", icon: Paintbrush, color: "bg-primary-container/10", text: "text-primary dark:text-primary-fixed" },
  { name: "AC Technician", icon: Snowflake, color: "bg-secondary-container/10", text: "text-secondary dark:text-secondary-fixed" },
  { name: "House Cleaner", icon: Sparkles, color: "bg-tertiary-container/10", text: "text-tertiary dark:text-tertiary-fixed" },
  { name: "Appliance Repair", icon: Settings, color: "bg-primary-container/10", text: "text-primary dark:text-primary-fixed" },
  { name: "Mechanic", icon: Car, color: "bg-secondary-container/10", text: "text-secondary dark:text-secondary-fixed" },
  { name: "Gardener", icon: Sprout, color: "bg-tertiary-container/10", text: "text-tertiary dark:text-tertiary-fixed" },
  { name: "Movers & Packers", icon: Truck, color: "bg-primary-container/10", text: "text-primary dark:text-primary-fixed" },
  { name: "Pest Control", icon: Bug, color: "bg-secondary-container/10", text: "text-secondary dark:text-secondary-fixed" },
  { name: "CCTV Technician", icon: Eye, color: "bg-tertiary-container/10", text: "text-tertiary dark:text-tertiary-fixed" },
  { name: "Welder", icon: Flame, color: "bg-primary-container/10", text: "text-primary dark:text-primary-fixed" },
  { name: "Mason", icon: Layers, color: "bg-secondary-container/10", text: "text-secondary dark:text-secondary-fixed" },
  { name: "Handyman", icon: Wrench, color: "bg-tertiary-container/10", text: "text-tertiary dark:text-tertiary-fixed" },
  { name: "Photographer", icon: Camera, color: "bg-primary-container/10", text: "text-primary dark:text-primary-fixed" },
  { name: "Videographer", icon: Video, color: "bg-secondary-container/10", text: "text-secondary dark:text-secondary-fixed" },
  { name: "Event Decorator", icon: PartyPopper, color: "bg-tertiary-container/10", text: "text-tertiary dark:text-tertiary-fixed" },
  { name: "DJ", icon: Music, color: "bg-primary-container/10", text: "text-primary dark:text-primary-fixed" },
  { name: "Caterer", icon: Utensils, color: "bg-secondary-container/10", text: "text-secondary dark:text-secondary-fixed" },
  { name: "Waiter/Server", icon: UserCheck, color: "bg-tertiary-container/10", text: "text-tertiary dark:text-tertiary-fixed" }
];

// Browser Speech Recognition instance
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const Home: React.FC = () => {
  const { userProfile } = useAuth();
  
  if (userProfile && userProfile.role === 'provider') {
    return <ProviderHome />;
  }

  return <CustomerHome />;
};

const CustomerHome: React.FC = () => {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Speech states
  const [isListening, setIsListening] = useState(false);
  const [listeningError, setListeningError] = useState<string | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Auto-request location access when using the app
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: Math.round(position.coords.latitude * 10000) / 10000,
            lng: Math.round(position.coords.longitude * 10000) / 10000
          };
          try {
            await updateProfile({ location: coords });
          } catch (err) {
            console.error("Failed to sync customer location coordinates:", err);
          }
        },
        (err) => {
          console.warn("Location permission not granted by user:", err);
        }
      );
    }
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/matching?category=${encodeURIComponent(categoryName)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/matching?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const startVoiceSearch = () => {
    if (!SpeechRecognition) {
      setListeningError("Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.");
      setShowVoiceModal(true);
      return;
    }

    setListeningError(null);
    setIsListening(true);
    setShowVoiceModal(true);

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US'; // maps requests easily in English

      recognition.onstart = () => {
        console.log("Voice capturing active...");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        
        // Brief success feedback then direct transition
        setTimeout(() => {
          setIsListening(false);
          setShowVoiceModal(false);
          navigate(`/matching?q=${encodeURIComponent(transcript)}`);
        }, 1100);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech capturing error:", event.error);
        if (event.error === 'not-allowed') {
          setListeningError("Microphone permission denied. Enable microphone access in browser settings.");
        } else {
          setListeningError(`Voice capture error: ${event.error}. Please try again.`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error("Failed to start SpeechRecognition:", err);
      setListeningError("Failed to initialize speech hardware.");
      setIsListening(false);
    }
  };

  const cancelVoiceSearch = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setIsListening(false);
    setShowVoiceModal(false);
  };

  return (
    <div className="pt-24 pb-28 md:pb-12 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
      {/* Hero Section with Mosaic */}
      <section className="relative rounded-xl overflow-hidden mb-xl shadow-soft">
        <div className="absolute inset-0 mosaic-pattern opacity-10 pointer-events-none"></div>
        <div className="relative z-10 py-12 px-lg md:py-20 md:px-xl bg-gradient-to-br from-surface/80 via-surface/40 to-transparent dark:from-slate-900/90 dark:to-transparent">
          <h1 className="font-headline-xl-mobile md:font-headline-xl text-headline-xl-mobile md:text-headline-xl text-primary dark:text-primary-fixed mb-sm">
            Professional Help,<br />Right at Your Doorstep
          </h1>
          <p className="text-on-surface-variant dark:text-[#94A3B8] max-w-md font-body-md text-body-md mb-lg">
            Trusted local experts for every home need. From fixing a leak to planning your next big event.
          </p>

          {/* Universal Search Bar - Visible on BOTH Mobile and Desktop */}
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl shadow-soft rounded-xl overflow-hidden bg-white dark:bg-[#1E293B] border border-outline-variant/30 dark:border-slate-800">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline dark:text-[#64748B] flex items-center">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none py-4 pl-12 pr-12 text-on-surface dark:text-white outline-none focus:ring-0 text-sm font-medium"
              placeholder="Describe what service you need... (e.g. kitchen pipe leak)"
            />
            
            {/* Pulsing Mic icon shortcut */}
            <button
              type="button"
              onClick={startVoiceSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-primary dark:text-primary-fixed w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all"
              aria-label="Voice Search"
            >
              <Mic className="w-5 h-5" />
            </button>
          </form>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="mb-xl">
        <div className="flex justify-between items-end mb-lg">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-background dark:text-white">Explore Categories</h2>
            <p className="text-on-surface-variant dark:text-[#94A3B8] font-label-md text-label-md">Verified professionals across 21 specialties</p>
          </div>
        </div>

        {/* Bento/Asymmetric Grid Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-gutter">
          {CATEGORIES.slice(0, 12).map((cat, index) => {
            const IconComponent = cat.icon;
            return (
              <motion.button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className="flex flex-col items-center justify-center p-lg bg-surface-container-lowest dark:bg-[#1E293B] rounded-xl shadow-soft hover:shadow-md transition-all group border border-outline-variant/30 dark:border-[#334155]"
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
              >
                <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center mb-md group-hover:scale-110 transition-transform`}>
                  <IconComponent className={`w-7 h-7 ${cat.text}`} />
                </div>
                <span className="font-label-md text-label-md text-on-surface dark:text-[#F8FAFC] text-center line-clamp-1">
                  {cat.name}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* View More Categories trigger */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate('/categories')}
            className="flex items-center gap-2 border border-primary text-primary hover:bg-primary/5 dark:border-primary-container dark:text-[#6bff8f] dark:hover:bg-[#6bff8f]/10 px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-soft cursor-pointer"
          >
            View More Categories
          </button>
        </div>
      </section>

      {/* Featured Section */}
      <section className="mb-xl grid grid-cols-1 md:grid-cols-2 gap-lg">
        {/* Promotion Card */}
        <div className="relative h-64 rounded-xl overflow-hidden shadow-soft group">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
            style={{ 
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBDhhg__bp4hhR66R8MvKyB-0wLHYb_wk2dQag4Qp_y7z44dYnS2iiFzbbf38ALZlakvV2fr3e1q_ASGcLDDsjeLN25c3pUTKioP6zduIN9k-hLj454PEU8YiW84kVILZj6MSepCK3SZwMFeADrcOAub0alThLgPa9Q7EVw1jM7M0Brb6tlKhtidAgIxgv8Lg1W-DU8soXQ5cX4H-ymA7qmRbvwAd4gafh0t7u0LtjKcWt2LXkbaoTu1wrvBdOHlMOgAtNdH2nHSsyw')` 
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-lg">
            <h3 className="text-white font-headline-md text-headline-md mb-xs">Home Renovation Expo</h3>
            <p className="text-white/80 text-body-md font-body-md">Get up to 25% off on Painter &amp; Carpenter services this week.</p>
          </div>
        </div>

        {/* Verification Pitch Card */}
        <div className="bg-primary-container/10 dark:bg-primary-container/5 rounded-xl p-lg flex flex-col justify-center border border-primary/20 dark:border-primary-fixed/20">
          <div className="flex items-center gap-md mb-md">
            <div className="w-12 h-12 rounded-full bg-primary dark:bg-primary-container flex items-center justify-center text-white dark:text-on-primary-container shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-headline-md text-headline-md text-on-primary-container dark:text-primary-fixed font-bold">Verified Khidmat PROs</h3>
          </div>
          <p className="text-on-surface-variant dark:text-[#94A3B8] mb-lg font-body-md">
            Every professional undergoes a 5-step background check and skill verification process to ensure your safety and satisfaction.
          </p>
          <button 
            onClick={() => navigate('/safety')}
            className="bg-primary dark:bg-primary-container text-on-primary dark:text-on-primary-container font-label-md text-label-md py-3 px-6 rounded-lg w-fit hover:brightness-110 transition-all active:scale-95 shadow-soft"
          >
            Learn about Safety
          </button>
        </div>
      </section>

      {/* Why Choose Khidmat & Info Sections */}
      <section className="mb-xl space-y-xl">
        
        {/* Section 1: Our Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg items-center">
          <div className="space-y-md order-2 lg:order-1">
            <div className="flex items-center gap-2 text-primary dark:text-[#6bff8f] font-bold text-xs uppercase tracking-wider">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>Created with a Purpose</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-background dark:text-white font-extrabold leading-tight">
              Why We Created Khidmat
            </h2>
            <p className="text-sm text-on-surface-variant dark:text-slate-350 leading-relaxed">
              Khidmat was created for the <strong>DYLP Hackathon</strong> with a simple but powerful mission: to bridge the gap between skilled blue-collar service professionals and Pakistani households. 
            </p>
            <p className="text-sm text-on-surface-variant dark:text-slate-350 leading-relaxed">
              We realized that finding trustworthy, verified help for home maintenance shouldn't require complex phone directories or unsafe third-party suggestions. By digitizing safety rules, identity validation, and fair-pricing estimations, Khidmat protects customers from arbitrary rate hikes while guaranteeing micro-task earners a reliable pipeline of local jobs.
            </p>
          </div>
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative p-2 bg-white dark:bg-slate-800 rounded-3xl border border-outline-variant/30 dark:border-slate-700 shadow-lg max-w-sm overflow-hidden group">
              <img 
                src="/about_illustration.png" 
                alt="About Khidmat" 
                className="w-full h-auto rounded-2xl transform group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: How We Guarantee Safety & Trust */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg items-center pt-8">
          <div className="flex justify-center">
            <div className="relative p-2 bg-white dark:bg-slate-800 rounded-3xl border border-outline-variant/30 dark:border-slate-700 shadow-lg max-w-sm overflow-hidden group">
              <img 
                src="/mission_illustration.png" 
                alt="Our Safety Mission" 
                className="w-full h-auto rounded-2xl transform group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>
          <div className="space-y-md">
            <div className="flex items-center gap-2 text-primary dark:text-[#6bff8f] font-bold text-xs uppercase tracking-wider">
              <Users className="w-4 h-4 text-primary" />
              <span>A Safer Community</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-background dark:text-white font-extrabold leading-tight">
              A Direct, Safe, &amp; Smart Marketplace
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="font-bold text-xs font-mono">1</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Government CNIC Verification</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Every provider is identity-mapped with validated biometric CNIC databases for total security.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="font-bold text-xs font-mono">2</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">AI-Powered Worker Matching</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Our custom ranking system matches you with the closest, highest-rated specialists in your city.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="font-bold text-xs font-mono">3</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Fair Invoice Rate Protection</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Automated pricing limits prevent overcharging by capping travel fees based on real-time distance calculations.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VOICE LISTENING ANIMATED MODAL SHEET */}
      <AnimatePresence>
        {showVoiceModal && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#1E293B] border border-outline-variant/30 dark:border-slate-800 rounded-2xl shadow-xl max-w-sm w-full p-lg text-center space-y-lg relative overflow-hidden"
            >
              {/* Spinning compass loader overlay when active */}
              {isListening ? (
                <div className="flex flex-col items-center space-y-md py-md">
                  
                  {/* Micro pulsing container */}
                  <div className="relative w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500 shadow-inner">
                    <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" style={{ animationDuration: '1.4s' }}></span>
                    <Mic className="w-8 h-8 animate-pulse text-red-500" style={{ animationDuration: '1s' }} />
                  </div>
                  
                  <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">Listening...</h3>
                  <p className="text-xs text-on-surface-variant dark:text-slate-400 max-w-xs">
                    Please describe what job or worker you are searching for.
                  </p>

                  {/* Equalizer sound wave loop */}
                  <div className="flex items-end justify-center gap-1.5 h-12 mt-md pt-sm">
                    {[20, 48, 28, 40, 16, 32].map((height, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          height: [10, height, 10],
                        }}
                        transition={{
                          duration: 0.5 + i * 0.08,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                        className="w-1.5 bg-primary dark:bg-primary-fixed rounded-full"
                        style={{ height: 10 }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                /* VOICE CAPTURE ERROR OR MOCKED OPTIONS FOR PRESENTATIONS */
                <div className="flex flex-col items-center space-y-md">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-600 dark:text-amber-400">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface dark:text-white">Voice Search Status</h3>
                  
                  <p className="text-xs text-on-surface-variant dark:text-slate-400 leading-relaxed px-sm">
                    {listeningError || "Speech window closed. No audio was detected."}
                  </p>

                  {/* Presentation Mode helper: clickable commands that skip mic requirement */}
                  <div className="w-full bg-slate-50 dark:bg-[#0F172A] border border-outline-variant/30 dark:border-slate-800 p-md rounded-xl space-y-sm text-left">
                    <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500 dark:text-slate-400 font-bold block mb-1">
                      Demo Command Shortcut
                    </p>
                    <div className="space-y-xs">
                      {[
                        "I need an electrician for a short circuit",
                        "My kitchen pipe is leaking",
                        "Need painter for house renovation"
                      ].map(phrase => (
                        <button
                          key={phrase}
                          type="button"
                          onClick={() => {
                            setSearchQuery(phrase);
                            setShowVoiceModal(false);
                            navigate(`/matching?q=${encodeURIComponent(phrase)}`);
                          }}
                          className="w-full text-left text-xs bg-white dark:bg-slate-800 hover:border-primary border border-outline-variant/20 dark:border-[#334155] p-2.5 rounded-lg text-on-surface dark:text-slate-300 font-semibold shadow-sm transition-all"
                        >
                          "{phrase}"
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Close Button action */}
              <button 
                type="button"
                onClick={cancelVoiceSearch}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-on-surface dark:text-slate-200 text-sm font-bold py-3.5 rounded-xl transition-all active:scale-[0.98]"
              >
                Close Voice Dialog
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
