import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  queryCollectionDocs, 
  writeDocument, 
  submitProviderReview,
  sendChatMessage 
} from '../firebase';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Star, 
  AlertCircle,
  Sparkles,
  Info,
  DollarSign,
  User
} from 'lucide-react';

interface Booking {
  id?: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  providerId: string;
  providerName: string;
  providerCategory: string;
  date: string;
  timeSlot: string;
  address: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalPrice: number;
  distanceKm: number;
  customerRating?: number;
  reviewedAt?: string;
}

export const MyBookings: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  
  // Rating states
  const [ratingBookingId, setRatingBookingId] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchBookingsList = async () => {
    if (!user || !userProfile) return;

    try {
      setLoading(true);
      
      // Determine query filter based on user's active role
      const fieldName = userProfile.role === 'provider' ? 'providerId' : 'customerId';
      const data = (await queryCollectionDocs('bookings', fieldName, '==', user.uid)) as Booking[];
      
      // Sort bookings by date descending
      const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));
      setBookings(sorted);
    } catch (err) {
      console.error("Failed to query bookings list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsList();
  }, [user, userProfile]);

  const handleUpdateStatus = async (booking: Booking, newStatus: 'confirmed' | 'completed' | 'cancelled') => {
    try {
      const updatedBooking = { ...booking, status: newStatus };
      await writeDocument('bookings', booking.bookingId, updatedBooking);
      
      // Inject system notifications into the chat
      const statusTexts = {
        confirmed: "Worker accepted the booking request and has marked it as CONFIRMED.",
        completed: "Worker completed the task successfully. Booking is marked as COMPLETED.",
        cancelled: `Booking was cancelled by the ${userProfile?.role === 'provider' ? 'worker' : 'customer'}.`
      };
      
      await sendChatMessage(
        booking.bookingId,
        'system',
        'System Notification',
        JSON.stringify({
          text: statusTexts[newStatus],
          isSystemEvent: true,
          eventStatus: newStatus
        })
      );

      // Refresh list
      await fetchBookingsList();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleRatingSubmit = async (booking: Booking) => {
    if (selectedRating < 1 || selectedRating > 5) return;
    
    try {
      setSubmittingRating(true);
      await submitProviderReview(booking.bookingId, booking.providerId, selectedRating);
      
      setRatingBookingId(null);
      setSelectedRating(5);
      
      // Refresh list
      await fetchBookingsList();
    } catch (err) {
      console.error("Failed to submit rating:", err);
    } finally {
      setSubmittingRating(false);
    }
  };

  // Filter logic
  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      case 'pending':
      default:
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="pt-24 pb-28 md:pb-12 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
      
      {/* Header title block */}
      <div className="mb-lg">
        <h1 className="font-headline-lg text-headline-lg text-on-background dark:text-white">My Bookings</h1>
        <p className="text-on-surface-variant dark:text-[#94A3B8] font-label-md text-label-md">
          {userProfile?.role === 'provider' 
            ? "Manage jobs assigned to you by customers" 
            : "Track your requested home service calls"}
        </p>
      </div>

      {/* Tabs list pills */}
      <div className="flex border-b border-outline-variant/30 dark:border-slate-800 gap-md mb-lg overflow-x-auto pb-sm shrink-0">
        {(['all', 'pending', 'confirmed', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`font-label-md text-label-md capitalize py-2 px-4 rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab 
                ? 'bg-primary text-on-primary font-bold shadow-soft' 
                : 'text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab === 'all' ? 'All Bookings' : tab}
          </button>
        ))}
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="space-y-md">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface-container-lowest dark:bg-[#1E293B] border border-outline-variant/30 rounded-xl p-md h-32 animate-pulse flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="w-1/3 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="w-16 h-5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
              </div>
              <div className="w-2/3 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="w-1/4 h-8 bg-slate-200 dark:bg-slate-700 rounded mt-sm"></div>
            </div>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        /* Dynamic Empty States */
        <div className="text-center max-w-md mx-auto py-16 space-y-md">
          <AlertCircle className="w-12 h-12 text-on-surface-variant/40 mx-auto" />
          <h2 className="text-lg font-bold text-on-surface dark:text-white">No Bookings Found</h2>
          <p className="text-on-surface-variant dark:text-slate-400 text-sm">
            {activeTab === 'all' 
              ? `You don't have any bookings logged in this category yet.` 
              : `No bookings match your current "${activeTab}" filter.`}
          </p>
          {userProfile?.role !== 'provider' && activeTab === 'all' && (
            <button 
              onClick={() => navigate('/')}
              className="bg-primary text-on-primary font-semibold py-3 px-6 rounded-lg shadow-soft transition-all active:scale-95"
            >
              Request Service Now
            </button>
          )}
        </div>
      ) : (
        /* Bookings list mapping */
        <div className="space-y-md">
          {filteredBookings.map((b, index) => {
            const isCompleted = b.status === 'completed';
            const isPending = b.status === 'pending';
            const isConfirmed = b.status === 'confirmed';
            
            const clientView = userProfile?.role !== 'provider';
            const displayTitle = clientView ? b.providerCategory : "Incoming Job Request";
            const displayName = clientView ? b.providerName : b.customerName;

            return (
              <motion.div
                key={b.bookingId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="bg-surface-container-lowest dark:bg-[#1E293B] border border-outline-variant/30 dark:border-slate-800 rounded-xl p-md md:p-lg shadow-soft flex flex-col gap-md relative overflow-hidden"
              >
                
                {/* Header card details */}
                <div className="flex flex-wrap items-center justify-between gap-sm border-b border-outline-variant/20 dark:border-slate-800 pb-sm">
                  <div className="flex items-center gap-sm">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <div>
                      <h2 className="text-sm font-bold text-on-surface dark:text-white">{displayTitle}</h2>
                      <span className="text-[10px] text-on-surface-variant dark:text-slate-400 block mt-0.5">
                        Booking ID: <span className="font-mono">{b.bookingId.substring(0, 8)}</span>
                      </span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-[10px] font-bold capitalize tracking-wider ${getStatusClass(b.status)}`}>
                    {b.status}
                  </span>
                </div>

                {/* Details row grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-md text-xs font-semibold text-on-surface-variant dark:text-slate-300">
                  <div className="space-y-xs">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 font-bold block">Schedule Time</span>
                    <span className="flex items-center gap-1 text-on-surface dark:text-white">
                      <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      {b.date} • {b.timeSlot}
                    </span>
                  </div>

                  <div className="space-y-xs">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 font-bold block">
                      {clientView ? "Assigned Worker" : "Client Contact"}
                    </span>
                    <span className="flex items-center gap-1 text-on-surface dark:text-white capitalize">
                      <User className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      {displayName}
                    </span>
                  </div>

                  <div className="space-y-xs md:col-span-2">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 font-bold block">Job Location Address</span>
                    <span className="flex items-center gap-1 text-on-surface dark:text-white truncate">
                      <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      {b.address}
                    </span>
                  </div>
                </div>

                {/* Pricing summary */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-sm rounded-lg flex justify-between items-center text-xs font-bold px-md border border-outline-variant/10 dark:border-slate-800">
                  <span className="text-on-surface-variant dark:text-slate-400">Total Price Estimate</span>
                  <span className="text-primary dark:text-primary-fixed flex items-center gap-0.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    Rs. {b.totalPrice}
                  </span>
                </div>

                {/* Star Ratings selection overlay for Completed clients */}
                {isCompleted && clientView && (
                  <div className="border-t border-outline-variant/20 dark:border-slate-800 pt-md mt-xs">
                    {b.customerRating ? (
                      /* Display completed rating feedback */
                      <div className="bg-emerald-500/5 border border-emerald-500/10 p-md rounded-xl text-xs flex items-center justify-between">
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Service Rated
                        </span>
                        <span className="flex items-center gap-1 font-bold text-amber-500 text-sm bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-amber-500/20">
                          <Star className="w-4 h-4 fill-current" />
                          {b.customerRating.toFixed(1)} / 5.0
                        </span>
                      </div>
                    ) : (
                      /* Submission selector star form */
                      <div className="bg-amber-500/5 border border-amber-500/20 p-md rounded-xl space-y-md">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-sm">
                          <div>
                            <p className="text-xs font-bold text-on-surface dark:text-white flex items-center gap-1">
                              <Sparkles className="w-4 h-4 text-primary" />
                              Rate {b.providerName}'s Work
                            </p>
                            <p className="text-[10px] text-on-surface-variant dark:text-slate-400">
                              Your rating immediately recalculates their level tier and helps maintain high quality service standard!
                            </p>
                          </div>
                          
                          {/* Star items row */}
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(starIndex => (
                              <button
                                key={starIndex}
                                type="button"
                                onMouseEnter={() => setHoverRating(starIndex)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => {
                                  setRatingBookingId(b.bookingId);
                                  setSelectedRating(starIndex);
                                }}
                                className="w-8 h-8 flex items-center justify-center text-amber-500 active:scale-90 transition-transform"
                              >
                                <Star 
                                  className={`w-6 h-6 ${
                                    (hoverRating || selectedRating) >= starIndex 
                                      ? 'fill-current' 
                                      : 'stroke-current'
                                  }`} 
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Submit button wrapper */}
                        {ratingBookingId === b.bookingId && (
                          <div className="flex justify-end pt-xs">
                            <button
                              onClick={() => handleRatingSubmit(b)}
                              disabled={submittingRating}
                              className="bg-primary text-on-primary font-bold text-[11px] py-2 px-4 rounded-lg shadow-soft hover:brightness-105 active:scale-95 disabled:opacity-50 transition-all"
                            >
                              {submittingRating ? "Submitting..." : "Submit Review Score"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions row button layout */}
                <div className="flex flex-wrap items-center gap-2 border-t border-outline-variant/15 dark:border-slate-800/50 pt-sm mt-xs justify-between">
                  
                  {/* Info notice for cancellations */}
                  {b.status === 'cancelled' ? (
                    <span className="text-[10px] text-red-500 flex items-center gap-1 font-bold">
                      <XCircle className="w-3.5 h-3.5" /> Booking Cancelled
                    </span>
                  ) : (
                    <span className="text-[10px] text-on-surface-variant/60 dark:text-slate-500 font-bold flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      Contact details will unlock in Chat
                    </span>
                  )}

                  <div className="flex gap-2">
                    {/* Open Live Chat shortcut */}
                    {b.status !== 'cancelled' && (
                      <button
                        onClick={() => navigate(`/chat?bookingId=${b.bookingId}`)}
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-on-surface dark:text-slate-100 font-bold py-2.5 px-4 rounded-lg transition-all active:scale-[0.98] flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <span>Live Chat</span>
                      </button>
                    )}

                    {/* CLIENT ACTIONS */}
                    {clientView && isPending && (
                      <button
                        onClick={() => handleUpdateStatus(b, 'cancelled')}
                        className="bg-red-500/10 hover:bg-red-500/25 text-red-600 dark:text-red-400 border border-red-500/20 font-bold py-2.5 px-4 rounded-lg transition-all active:scale-[0.98]"
                      >
                        Cancel Booking
                      </button>
                    )}

                    {/* WORKER ACTIONS */}
                    {!clientView && isPending && (
                      <button
                        onClick={() => handleUpdateStatus(b, 'confirmed')}
                        className="bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-lg hover:brightness-105 active:scale-[0.98] transition-all shadow-soft"
                      >
                        Accept &amp; Confirm Job
                      </button>
                    )}

                    {!clientView && isConfirmed && (
                      <button
                        onClick={() => handleUpdateStatus(b, 'completed')}
                        className="bg-blue-500 text-white font-bold py-2.5 px-4 rounded-lg hover:brightness-105 active:scale-[0.98] transition-all shadow-soft"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
