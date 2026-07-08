import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { queryCollectionDocs } from '../firebase';
import { MessageSquare, ChevronRight, User, Calendar, MapPin } from 'lucide-react';
import { Card, EmptyState } from '../components/SharedUI';

interface Booking {
  bookingId: string;
  customerId: string;
  customerName: string;
  providerId: string;
  providerName: string;
  providerCategory: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  address: string;
}

export const Inbox: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [conversations, setConversations] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user || !userProfile) return;

      try {
        setLoading(true);
        // Query bookings where user is involved
        const fieldName = userProfile.role === 'provider' ? 'providerId' : 'customerId';
        const data = (await queryCollectionDocs('bookings', fieldName, '==', user.uid)) as Booking[];
        
        // Sort conversations by date descending
        const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));
        setConversations(sorted);
      } catch (err) {
        console.error("Failed to fetch conversations for inbox:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user, userProfile]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-500/20';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-500/20';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border border-red-500/20';
      case 'pending':
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-500/20';
    }
  };

  if (loading) {
    return (
      <div className="pt-28 pb-28 md:pb-12 px-margin-mobile md:px-margin-desktop max-w-xl mx-auto w-full min-h-[60vh] flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-gray-500 dark:text-slate-400 font-label-md">Loading your messages...</span>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-28 md:pb-12 px-margin-mobile md:px-margin-desktop max-w-xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Chat with your service providers and customers</p>
      </div>

      {conversations.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-8 text-center">
          <EmptyState
            icon={MessageSquare}
            title="No conversations yet"
            description={
              userProfile?.role === 'provider' 
                ? "No customer has booked your services yet. Go online and wait for a match suggestion!"
                : "No conversations yet. Book a home service to start chatting with a professional provider!"
            }
            actionLabel={userProfile?.role === 'provider' ? undefined : "Find a Provider"}
            onAction={userProfile?.role === 'provider' ? undefined : () => navigate('/')}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {conversations.map((convo) => {
            const chatPartnerName = userProfile?.role === 'provider' ? convo.customerName : convo.providerName;
            
            return (
              <Card 
                key={convo.bookingId}
                className="hover:scale-[1.01] transition-all cursor-pointer border border-gray-200 dark:border-slate-800"
              >
                <div 
                  onClick={() => navigate(`/chat?bookingId=${convo.bookingId}`)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {chatPartnerName}
                        <span className={`text-[9px] px-2 py-0.5 rounded-full capitalize font-semibold ${getStatusBadgeClass(convo.status)}`}>
                          {convo.status}
                        </span>
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-slate-500 font-semibold">{convo.providerCategory}</p>
                      
                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-400 mt-1 font-semibold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {convo.date}
                        </span>
                        <span className="flex items-center gap-1 line-clamp-1 max-w-[200px]">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {convo.address}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Inbox;
