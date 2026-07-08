import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getDocument, 
  writeDocument, 
  sendChatMessage, 
  listenToChatMessages 
} from '../firebase';
import { Card, EmptyState } from '../components/SharedUI';
import { 
  ArrowLeft, 
  Send, 
  MessageSquare, 
  Clock, 
  MapPin, 
  Truck, 
  Play, 
  CheckCircle2
} from 'lucide-react';

interface Booking {
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
}

interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  isSystem?: boolean;
}

export const Chat: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Simulation states
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Fetch Booking Details
  useEffect(() => {
    if (!bookingId) {
      setError("No booking context provided for chat.");
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        const data = await getDocument('bookings', bookingId);
        if (data) {
          setBooking(data as Booking);
        } else {
          setError("Booking details not found.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch booking details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  // Listen to Chat Messages in Real-time
  useEffect(() => {
    if (!bookingId) return;

    const unsubscribe = listenToChatMessages(bookingId, (newMessages) => {
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [bookingId]);

  // Sync booking status updates in real-time
  useEffect(() => {
    if (!bookingId) return;

    // Check for status changes periodically in mock environment
    const interval = setInterval(async () => {
      try {
        const data = await getDocument('bookings', bookingId);
        if (data) {
          const freshBooking = data as Booking;
          setBooking(prev => {
            if (prev?.status !== freshBooking.status) {
              return freshBooking;
            }
            return prev;
          });
        }
      } catch (e) {
        console.error(e);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [bookingId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !bookingId) return;

    const textToSend = inputText;
    setInputText('');

    try {
      await sendChatMessage(
        bookingId,
        user.uid,
        user.email?.split('@')[0] || 'Customer',
        textToSend
      );
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // --- DEVELOPER SIMULATION HANDLERS ---
  const handleSimulateReply = async () => {
    if (!booking || isTyping) return;
    
    setIsTyping(true);
    
    // Simulate typing delay
    setTimeout(async () => {
      setIsTyping(false);
      
      const responses = [
        "Assalam-o-Alaikum! I have received your booking details. I am preparing my tools and will arrive on time.",
        "Sure, please share the exact landmarks of your address if possible.",
        "I'm on my way to your location now! I will call you when I arrive.",
        "No problem, I will carry the standard materials. Let me know if anything else is needed.",
        "Yes, the price estimate looks fine to me. See you soon!"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      try {
        await sendChatMessage(
          booking.bookingId,
          booking.providerId,
          booking.providerName,
          randomResponse
        );
      } catch (err) {
        console.error("Failed to send simulated reply:", err);
      }
    }, 2000);
  };

  const handleSimulateStatusChange = async (newStatus: 'confirmed' | 'completed') => {
    if (!booking || !bookingId) return;

    try {
      // 1. Update Booking Document
      const updatedBooking = { ...booking, status: newStatus };
      await writeDocument('bookings', bookingId, updatedBooking);
      setBooking(updatedBooking);

      // 2. Inject system message in chat
      const statusTexts = {
        confirmed: "Worker accepted the booking request and has marked it as CONFIRMED.",
        completed: "Worker completed the task successfully. Booking is marked as COMPLETED."
      };
      
      await sendChatMessage(
        bookingId,
        'system',
        'System Notification',
        JSON.stringify({
          text: statusTexts[newStatus],
          isSystemEvent: true,
          eventStatus: newStatus
        })
      );
    } catch (err) {
      console.error("Failed to update booking status:", err);
    }
  };

  if (loading) {
    return (
      <div className="pt-28 flex flex-col items-center justify-center min-h-[60vh] text-on-surface dark:text-white">
        <Clock className="w-8 h-8 animate-spin text-primary mr-2" />
        <span>Loading secure chat session...</span>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="pt-28 px-margin-mobile max-w-md mx-auto">
        <Card>
          <EmptyState
            icon={MessageSquare}
            title="Chat Context Missing"
            description={error || "No booking context was found for this discussion thread."}
            actionLabel="Back to Bookings"
            onAction={() => navigate('/bookings')}
          />
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
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
    <div className="pt-20 pb-28 md:pb-12 h-screen flex flex-col w-full bg-[#FAFAF5] dark:bg-[#0F172A]">
      
      {/* DEVELOPER LIVE SIMULATION PANEL OVERLAY - DEV ONLY */}
      {import.meta.env.DEV && (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-outline-variant/30 py-2.5 px-margin-mobile md:px-margin-desktop z-40 flex flex-wrap items-center justify-between gap-md text-xs font-semibold shadow-sm">
          <span className="text-[10px] text-primary dark:text-primary-fixed uppercase tracking-wider font-extrabold flex items-center gap-1">
            <Play className="w-3.5 h-3.5 fill-current" />
            Dev Demo Controls
          </span>
          
          <div className="flex flex-wrap gap-2">
            {/* Simulate message response */}
            <button
              onClick={handleSimulateReply}
              disabled={isTyping || booking.status === 'completed'}
              className="bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-fixed border border-primary/30 py-1.5 px-3 rounded-lg disabled:opacity-50 transition-all active:scale-95 flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Simulate Reply
            </button>

            {/* Simulate Confirmed status */}
            {booking.status === 'pending' && (
              <button
                onClick={() => handleSimulateStatusChange('confirmed')}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 py-1.5 px-3 rounded-lg transition-all active:scale-95 flex items-center gap-1"
              >
                <Truck className="w-3.5 h-3.5" />
                Accept &amp; Confirm Job
              </button>
            )}

            {/* Simulate Completed status */}
            {booking.status === 'confirmed' && (
              <button
                onClick={() => handleSimulateStatusChange('completed')}
                className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 py-1.5 px-3 rounded-lg transition-all active:scale-95 flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Complete Service
              </button>
            )}
          </div>
        </div>
      )}

      {/* CHAT CONTAINER LAYOUT */}
      <div className="flex-1 flex flex-col max-w-container-max mx-auto w-full overflow-hidden">
        
        {/* Chat header area */}
        <div className="bg-white dark:bg-slate-900 border-b border-outline-variant/30 dark:border-slate-800 p-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-md">
            <button
              onClick={() => navigate('/bookings')}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-on-surface transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            {/* Provider Initials Avatar */}
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm uppercase border border-primary/20">
              {booking.providerName[0]}
            </div>
            
            <div>
              <h2 className="font-bold text-sm text-on-surface dark:text-white leading-tight">
                {booking.providerName}
              </h2>
              <span className="text-[10px] text-on-surface-variant dark:text-slate-400 block mt-0.5">
                {booking.providerCategory} • {booking.address.split(',')[0]}
              </span>
            </div>
          </div>

          {/* Status pill badge */}
          <div className="text-right">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-[10px] font-bold capitalize tracking-wider ${getStatusBadge(booking.status)}`}>
              {booking.status}
            </span>
          </div>
        </div>

        {/* Messaging Logs block */}
        <div className="flex-1 overflow-y-auto p-md space-y-md bg-slate-50/50 dark:bg-slate-950/20">
          
          {/* Static Booking System summary bubble */}
          <div className="max-w-md mx-auto text-center bg-white dark:bg-slate-900 p-md rounded-xl border border-outline-variant/30 dark:border-slate-800 space-y-xs shadow-sm">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold block">Service Details</span>
            <p className="text-xs text-on-surface dark:text-white font-bold">{booking.providerCategory} • Rs. {booking.totalPrice}</p>
            <p className="text-[10px] text-on-surface-variant dark:text-slate-400">Scheduled for {booking.date} • {booking.timeSlot}</p>
            <p className="text-[10px] text-on-surface-variant dark:text-slate-400 flex items-center justify-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-primary" /> {booking.address}
            </p>
          </div>

          {messages.map((msg, index) => {
            // Parse system notification messages
            let isSystemMessage = false;
            let displayMsgText = msg.text;
            
            try {
              if (msg.text.startsWith('{') && msg.text.endsWith('}')) {
                const parsed = JSON.parse(msg.text);
                if (parsed.isSystemEvent) {
                  isSystemMessage = true;
                  displayMsgText = parsed.text;
                }
              }
            } catch (e) {
              // ignore
            }

            if (isSystemMessage) {
              return (
                <div key={msg.id || index} className="flex justify-center my-md">
                  <div className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-[10px] md:text-xs font-semibold py-1.5 px-4 rounded-full max-w-sm text-center">
                    {displayMsgText}
                  </div>
                </div>
              );
            }

            const isMe = msg.senderId === user?.uid;
            
            return (
              <div
                key={msg.id || index}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-md py-2.5 shadow-sm text-sm ${
                    isMe 
                      ? 'bg-primary text-on-primary rounded-tr-none' 
                      : 'bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 text-on-surface dark:text-slate-100 rounded-tl-none'
                  }`}
                >
                  {/* Sender Name only on received messages */}
                  {!isMe && (
                    <span className="text-[10px] font-bold text-primary dark:text-primary-fixed block mb-1">
                      {msg.senderName}
                    </span>
                  )}
                  <p className="leading-relaxed whitespace-pre-wrap">{displayMsgText}</p>
                  
                  {/* Timestamp */}
                  <span className={`text-[8px] block mt-1 text-right ${isMe ? 'text-white/60' : 'text-on-surface-variant/60'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing status indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 rounded-2xl rounded-tl-none px-md py-3 shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input box section */}
        <div className="bg-white dark:bg-slate-900 border-t border-outline-variant/30 dark:border-slate-800 p-md shrink-0">
          <form onSubmit={handleSendMessage} className="flex gap-sm items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-outline-variant/35 dark:border-slate-800 rounded-xl py-3.5 px-md text-sm text-on-surface dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder={booking.status === 'completed' ? 'Booking is completed. Chat locked.' : 'Type a message to negotiate details...'}
              disabled={booking.status === 'completed'}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || booking.status === 'completed'}
              className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center hover:brightness-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-soft"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
