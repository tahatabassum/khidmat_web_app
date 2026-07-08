import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocument } from '../firebase';
import { TierBadge } from '../components/TierBadge';
import { Avatar } from '../components/SharedUI';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Briefcase, 
  Calendar, 
  ShieldCheck,
  Check,
  Compass,
  UserCheck
} from 'lucide-react';

interface Provider {
  userId: string;
  name: string;
  category: string;
  city: string;
  location: { lat: number; lng: number };
  basePrice: number;
  rating: number;
  totalJobs: number;
  tier: string;
  bio: string;
  available: boolean;
  phone?: string;
  email?: string;
  photoURL?: string;
}

export const ProviderProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProviderDetail = async () => {
      if (!id) {
        setError("Invalid profile link.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const data = await getDocument('providers', id);
        if (data) {
          setProvider(data as Provider);
        } else {
          setError("Provider profile could not be found in the database.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch provider detail.");
      } finally {
        setLoading(false);
      }
    };

    fetchProviderDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-28 flex items-center justify-center min-h-[50vh] text-on-surface dark:text-white">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mr-2" />
        <span>Loading profile detail...</span>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="pt-28 px-margin-mobile text-center max-w-md mx-auto">
        <div className="bg-error-container/20 border border-error/20 p-lg rounded-xl text-error mb-lg">
          {error || "Profile not found."}
        </div>
        <button 
          onClick={() => navigate(-1)} 
          className="bg-primary text-on-primary py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-5 h-5" /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-28 md:pb-12 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
      {/* Header bar */}
      <div className="flex items-center gap-md mb-lg">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-background dark:text-white">Worker Profile</h1>
          <p className="text-on-surface-variant dark:text-[#94A3B8] font-label-md text-label-md">Professional credentials &amp; reviews</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Left column: Profile overview (1/3 width) */}
        <div className="space-y-lg">
          <div className="bg-surface-container-lowest dark:bg-[#1E293B] rounded-xl border border-outline-variant/30 dark:border-slate-800 p-lg shadow-soft text-center space-y-md">
            
            {/* Large Avatar */}
            <div className="relative w-24 h-24 mx-auto mb-4">
              <Avatar src={provider.photoURL} name={provider.name} className="w-24 h-24 shadow-md" />
              {provider.available && (
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" title="Available now"></span>
              )}
            </div>

            {/* Name and specialty */}
            <div>
              <h2 className="text-xl font-extrabold text-on-surface dark:text-white mb-xs">{provider.name}</h2>
              <p className="text-sm font-semibold text-primary dark:text-primary-fixed flex items-center justify-center gap-1.5">
                <Briefcase className="w-4 h-4" />
                {provider.category}
              </p>
            </div>

            {/* Tier Badge */}
            <div className="flex justify-center">
              <TierBadge tier={provider.tier} />
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 gap-sm border-t border-b border-outline-variant/30 dark:border-slate-700 py-md my-md text-sm font-semibold">
              <div className="text-center border-r border-outline-variant/30 dark:border-slate-700">
                <span className="text-amber-500 text-base font-bold flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 fill-current" />
                  {provider.rating.toFixed(1)}
                </span>
                <span className="text-[10px] text-on-surface-variant/70 dark:text-slate-400 font-medium block mt-0.5">Overall Rating</span>
              </div>
              <div className="text-center">
                <span className="text-on-surface dark:text-white text-base font-bold block">
                  {provider.totalJobs}
                </span>
                <span className="text-[10px] text-on-surface-variant/70 dark:text-slate-400 font-medium block mt-0.5">Completed Jobs</span>
              </div>
            </div>

            {/* Base price rate */}
            <div className="flex justify-between items-center text-sm font-medium px-md">
              <span className="text-on-surface-variant dark:text-slate-400">Base Hourly Rate</span>
              <span className="text-base font-bold text-primary dark:text-primary-fixed">Rs. {provider.basePrice} / hr</span>
            </div>

            {/* Action buttons */}
            <div className="pt-md space-y-sm">
              <button
                onClick={() => navigate(`/booking?providerId=${provider.userId}`)}
                className="w-full bg-primary text-on-primary font-headline-md text-headline-md py-3.5 rounded-xl shadow-soft hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Service Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Bio, Coordinates Map and Details (2/3 width) */}
        <div className="lg:col-span-2 space-y-lg">
          {/* About / Bio Card */}
          <div className="bg-surface-container-lowest dark:bg-[#1E293B] rounded-xl border border-outline-variant/30 dark:border-slate-800 p-lg shadow-soft space-y-md">
            <h3 className="text-base font-bold text-on-surface dark:text-white border-b border-outline-variant/20 pb-xs">
              Professional Biography
            </h3>
            <p className="text-on-surface-variant dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {provider.bio}
            </p>
          </div>

          {/* Location details card */}
          <div className="bg-surface-container-lowest dark:bg-[#1E293B] rounded-xl border border-outline-variant/30 dark:border-slate-800 p-lg shadow-soft space-y-md">
            <h3 className="text-base font-bold text-on-surface dark:text-white border-b border-outline-variant/20 pb-xs">
              Location &amp; Service Region
            </h3>
            
            <div className="flex flex-col md:flex-row gap-lg justify-between items-start md:items-center">
              <div className="space-y-sm text-sm">
                <p className="flex items-center gap-2 text-on-surface dark:text-white font-semibold">
                  <MapPin className="w-4 h-4 text-primary" />
                  Base City: <span className="text-primary dark:text-primary-fixed">{provider.city}</span>
                </p>
                <p className="flex items-center gap-2 text-on-surface-variant dark:text-slate-400">
                  <Compass className="w-4 h-4 text-primary" />
                  GPS Pin Drop: <span className="font-mono text-xs">{provider.location.lat.toFixed(5)}, {provider.location.lng.toFixed(5)}</span>
                </p>
              </div>

              {/* Geographic availability badge */}
              <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 font-bold">
                <UserCheck className="w-4 h-4" />
                Ready to travel inside {provider.city}
              </div>
            </div>

            {/* Static Schematic Coordinate visual block */}
            <div className="rounded-lg h-36 border border-dashed border-outline-variant/50 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center p-md text-center text-xs space-y-sm">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center animate-pulse">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-on-surface dark:text-white">Active Dispatch Area</p>
                <p className="text-on-surface-variant dark:text-slate-400 mt-0.5">
                  Worker is dispatched from coordinates in {provider.city} directly to your pinned location.
                </p>
              </div>
            </div>
          </div>

          {/* Verification Credentials Checkboxes */}
          <div className="bg-surface-container-lowest dark:bg-[#1E293B] rounded-xl border border-outline-variant/30 dark:border-slate-800 p-lg shadow-soft space-y-md">
            <h3 className="text-base font-bold text-on-surface dark:text-white border-b border-outline-variant/20 pb-xs flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Khidmat Security &amp; Safety Checks
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-xs font-semibold text-on-surface-variant dark:text-slate-300">
              {[
                "Government CNIC Verified",
                "Technical Background Verified",
                "Practical skill assessment passed",
                "Clean police background check",
                "Standard toolkits compliance",
                "Service quality contract signed"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;
