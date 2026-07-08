import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getCollectionDocs } from '../firebase';
import { Card, EmptyState, Avatar } from '../components/SharedUI';
import { 
  rankProvidersWithAI, 
  estimateJobPriceWithAI, 
  type PriceEstimateResult 
} from '../utils/gemini';
import { 
  getDistanceKm, 
  estimateTravelTimeMinutes
} from '../utils/location';
import { TierBadge } from '../components/TierBadge';
import { 
  MapPin, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  ArrowLeft, 
  ChevronRight, 
  Info,
  DollarSign
} from 'lucide-react';

interface Provider {
  id?: string;
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
  available?: boolean;
  photoURL?: string;
}

export const ProviderList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userProfile } = useAuth();

  const category = searchParams.get('category') || '';
  const jobSummary = searchParams.get('q') || `Request for ${category} services.`;

  const [providers, setProviders] = useState<Provider[]>([]);
  const [rankedReasons, setRankedReasons] = useState<Record<string, string>>({});
  const [priceEstimate, setPriceEstimate] = useState<PriceEstimateResult | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCrossCity, setIsCrossCity] = useState(false);

  useEffect(() => {
    const fetchAndRankProviders = async () => {
      if (!category) {
        setError("Invalid category selection.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1. Fetch all providers and filter by category case-insensitively
        const rawProviders = (await getCollectionDocs('providers')) as Provider[];
        const allProviders = rawProviders.filter(p => 
          p.category && p.category.toLowerCase() === category.toLowerCase()
        );
        
        // Filter out offline providers (available must be true)
        const onlineProviders = allProviders.filter(p => p.available === true);
        
        if (onlineProviders.length === 0) {
          setProviders([]);
          setLoading(false);
          return;
        }

        // 2. Filter by user's city
        const userCity = userProfile?.city || 'Lahore';
        let matchedProviders = onlineProviders.filter(p => p.city.toLowerCase() === userCity.toLowerCase());
        
        // Hospitality logic: if no providers in their city, show cross-city matches with travel surcharge warnings
        if (matchedProviders.length === 0) {
          matchedProviders = onlineProviders;
          setIsCrossCity(true);
        } else {
          setIsCrossCity(false);
        }

        // 3. Calculate distance to nearest provider to feed the pricing API
        const userCoords = userProfile?.location || { lat: 31.5204, lng: 74.3587 };
        let minDistance = 2.0; // fallback standard
        if (matchedProviders.length > 0) {
          const distances = matchedProviders.map(p => 
            getDistanceKm(userCoords.lat, userCoords.lng, p.location.lat, p.location.lng)
          );
          minDistance = Math.min(...distances);
        }

        // 4. Run AI matching and pricing in parallel
        const [rankedList, priceResult] = await Promise.all([
          rankProvidersWithAI(category, userCoords, matchedProviders),
          estimateJobPriceWithAI(category, jobSummary, minDistance)
        ]);

        // Map reasons to provider UIDs
        const reasonsMap: Record<string, string> = {};
        rankedList.forEach(item => {
          reasonsMap[item.userId] = item.reason;
        });

        // 5. Re-order matched providers based on the AI ranked order
        const rankedProviders = [...matchedProviders].sort((a, b) => {
          const indexA = rankedList.findIndex(item => item.userId === a.userId);
          const indexB = rankedList.findIndex(item => item.userId === b.userId);
          
          // Put ranked items first, unranked items at the bottom
          const scoreA = indexA === -1 ? 999 : indexA;
          const scoreB = indexB === -1 ? 999 : indexB;
          return scoreA - scoreB;
        });

        setProviders(rankedProviders);
        setRankedReasons(reasonsMap);
        setPriceEstimate(priceResult);

      } catch (err) {
        console.error("Error fetching/matching providers:", err);
        setError("Failed to query match recommendations. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    if (userProfile) {
      fetchAndRankProviders();
    }
  }, [category, jobSummary, userProfile]);

  if (loading) {
    return (
      <div className="pt-28 flex flex-col items-center justify-center min-h-[60vh] text-on-surface dark:text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-md"
        />
        <span className="font-label-md text-on-surface-variant dark:text-slate-400">Finding the best matches in {userProfile?.city}...</span>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-28 md:pb-12 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
      {/* Back button header */}
      <div className="flex items-center gap-md mb-lg">
        <button 
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-background dark:text-white">Matched Workers</h1>
          <p className="text-on-surface-variant dark:text-[#94A3B8] font-label-md text-label-md">Ranked matches for "{category}"</p>
        </div>
      </div>

      {error ? (
        <div className="bg-red-100 border border-red-200 text-red-700 p-6 rounded-2xl text-center max-w-md mx-auto mb-6">
          {error}
        </div>
      ) : providers.length === 0 ? (
        <Card className="max-w-md mx-auto">
          <EmptyState
            icon={AlertCircle}
            title="No Matching Workers Found"
            description={`We currently don't have any registered providers for "${category}". Check back soon or register a provider account to test!`}
            actionLabel="Go Back Home"
            onAction={() => navigate('/')}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          
          {/* Main List Section (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-md">
            
            {/* Warning if showing providers from another city */}
            {isCrossCity && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 rounded-xl p-md text-sm flex gap-3">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Outside Local Area:</span> No direct workers found in {userProfile?.city}. Displaying nearby specialists from other cities. Travel charges will apply.
                </div>
              </div>
            )}

            {/* Provider List Cards */}
            <div className="space-y-md">
              {providers.map((p, index) => {
                const userCoords = userProfile?.location || { lat: 31.5204, lng: 74.3587 };
                const distance = getDistanceKm(userCoords.lat, userCoords.lng, p.location.lat, p.location.lng);
                const travelTime = estimateTravelTimeMinutes(distance);
                const matchReason = rankedReasons[p.userId] || `${p.name} is available in your city and highly experienced in ${p.category}.`;

                return (
                  <motion.div
                    key={p.userId}
                    onClick={() => navigate(`/provider/${p.userId}`)}
                    className="bg-surface-container-lowest dark:bg-[#1E293B] rounded-xl border border-outline-variant/30 dark:border-slate-800 p-md flex flex-col md:flex-row gap-md cursor-pointer hover:shadow-md transition-all group relative overflow-hidden"
                    whileHover={{ y: -2 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {/* Rank indicator badge */}
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-mono">
                      #{index + 1}
                    </div>

                    {/* Avatar container */}
                    <div className="flex-shrink-0 flex items-center">
                      <Avatar src={p.photoURL} name={p.name} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl shadow-inner object-cover" />
                    </div>

                    {/* Detailed info */}
                    <div className="flex-grow space-y-sm pr-6">
                      <div className="flex flex-wrap items-center gap-sm">
                        <h2 className="text-base font-bold text-on-surface dark:text-white group-hover:text-primary dark:group-hover:text-primary-fixed transition-colors">
                          {p.name}
                        </h2>
                        <TierBadge tier={p.tier} />
                      </div>

                      {/* Distance & Rate details */}
                      <div className="flex flex-wrap gap-x-md gap-y-1 text-xs text-on-surface-variant dark:text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          {distance} km ({p.city})
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          Travel: ~{travelTime} mins
                        </span>
                        <span className="flex items-center gap-1 font-bold text-primary dark:text-primary-fixed">
                          Rs. {p.basePrice} / hr
                        </span>
                      </div>

                      {/* AI Reasoning box */}
                      <div className="bg-primary/5 dark:bg-primary-fixed/5 border border-primary/10 dark:border-primary-fixed/10 p-sm rounded-lg text-xs leading-relaxed flex gap-2">
                        <Sparkles className="w-4 h-4 text-primary dark:text-primary-fixed flex-shrink-0 mt-0.5" />
                        <p className="text-on-surface-variant dark:text-slate-300 italic">
                          {matchReason}
                        </p>
                      </div>
                    </div>

                    {/* Arrow redirect shortcut */}
                    <div className="hidden md:flex items-center justify-center text-outline dark:text-slate-500 group-hover:text-primary dark:group-hover:text-primary-fixed transition-colors pr-2">
                      <ChevronRight className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Pricing Estimation Side Panel (1/3 width on desktop) */}
          <div className="space-y-md">
            {priceEstimate && (
              <div className="bg-surface-container-lowest dark:bg-[#1E293B] rounded-xl border border-outline-variant/30 dark:border-slate-800 p-lg shadow-soft space-y-md sticky top-28 backdrop-blur-sm bg-white/95 dark:bg-slate-900/95">
                <h3 className="text-base font-bold text-on-surface dark:text-white flex items-center gap-1.5 border-b border-outline-variant/20 pb-xs">
                  <DollarSign className="w-5 h-5 text-primary" />
                  AI Price Estimate
                </h3>
                
                {/* Large Range Banner */}
                <div className="bg-gradient-to-br from-primary to-emerald-700 text-white rounded-2xl p-lg text-center shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 mosaic-pattern opacity-10"></div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-white/70 block mb-xs">PKR Estimated Range</span>
                  <span className="text-2xl md:text-3xl font-black">
                    Rs. {priceEstimate.minPrice} - {priceEstimate.maxPrice}
                  </span>
                  <span className="text-[10px] text-white/80 block mt-2">Cash on Delivery • No prepayments</span>
                </div>

                {/* Explanation text */}
                <div className="space-y-sm text-xs leading-normal">
                  <p className="font-bold text-on-surface dark:text-white">How this was calculated:</p>
                  <p className="text-on-surface-variant dark:text-slate-400">
                    {priceEstimate.explanation}
                  </p>
                </div>

                {/* Secure service assurance */}
                <div className="border-t border-outline-variant/20 pt-md text-[10px] text-on-surface-variant dark:text-slate-500 leading-relaxed flex gap-2">
                  <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Final prices can be negotiated directly with your worker in the chat screen after booking.</span>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default ProviderList;
