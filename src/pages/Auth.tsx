import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  ArrowRight, 
  Loader, 
  Briefcase, 
  BookOpen,
  Map,
  Camera
} from 'lucide-react';
import { MapSelector } from '../components/MapSelector';
import { PAKISTAN_CITIES, type LocationCoords } from '../utils/location';

export const Auth: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path or default to home '/'
  const from = (location.state as any)?.from?.pathname || '/';

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // General Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Lahore');
  const [role, setRole] = useState<'customer' | 'provider'>('customer');
  const [coordinates, setCoordinates] = useState<LocationCoords>({ lat: 31.5204, lng: 74.3587 });

  // Provider specific Form Fields
  const [category, setCategory] = useState('Electrician');
  const [basePrice, setBasePrice] = useState('');
  const [bio, setBio] = useState('');

  // Photo Upload States
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.type || '';
      const isImg = fileType.startsWith('image/') || /\.(jpe?g|png|webp|heic)$/i.test(file.name);
      if (!isImg) {
        setError('Please select a valid image file (JPG, PNG, WEBP, HEIC).');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('Image file size should be less than 2MB.');
        return;
      }
      setPhotoFile(file);
      setError(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const PakistaniCities = Object.keys(PAKISTAN_CITIES);

  const specialties = [
    "Electrician", "Plumber", "Carpenter", "Painter", "AC Technician",
    "House Cleaner", "Appliance Repair", "Mechanic", "Gardener", "Movers & Packers",
    "Pest Control", "CCTV Technician", "Welder", "Mason", "Handyman",
    "Photographer", "Videographer", "Event Decorator", "DJ", "Caterer", "Waiter/Server"
  ];

  // Set default coordinates when city changes
  useEffect(() => {
    const coords = PAKISTAN_CITIES[city];
    if (coords) setCoordinates(coords);
  }, [city]);

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (!name.trim()) throw new Error('Please enter your full name.');
        if (!phone.trim()) throw new Error('Please enter your phone number.');
        if (phone.length < 9) throw new Error('Please enter a valid phone number.');
        
        const cleanPhone = phone.startsWith('0') ? phone.slice(1) : phone;
        const formattedPhone = `+92${cleanPhone}`;

        let providerDetails = undefined;
        if (role === 'provider') {
          if (!basePrice.trim() || isNaN(Number(basePrice)) || Number(basePrice) <= 0) {
            throw new Error('Please enter a valid hourly base rate in PKR.');
          }
          if (!bio.trim() || bio.length < 10) {
            throw new Error('Please enter a professional bio (minimum 10 characters).');
          }
          providerDetails = { category, bio, basePrice: Number(basePrice) };
        }
        
        await signUp(email, password, name, formattedPhone, city, role, coordinates, providerDetails, photoFile || undefined);
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      let friendlyMessage = err.message || 'An error occurred during authentication.';
      if (err.message?.includes('auth/user-not-found') || err.message?.includes('auth/wrong-password') || err.message?.includes('auth/invalid-credential')) {
        friendlyMessage = 'Invalid email or password. Please try again.';
      } else if (err.message?.includes('auth/email-already-in-use')) {
        friendlyMessage = 'This email address is already in use by another account.';
      } else if (err.message?.includes('auth/weak-password')) {
        friendlyMessage = 'Password should be at least 6 characters long.';
      } else if (err.message?.includes('auth/invalid-email')) {
        friendlyMessage = 'Please enter a valid email address.';
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-[#006e2f] focus:ring-2 focus:ring-[#006e2f]/20 transition-all text-sm";
  const labelClass = "block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide";

  return (
    <div
      style={{ minHeight: '100vh', width: '100%', overflowY: 'auto', background: 'transparent' }}
      className="bg-[#FAFAF5] dark:bg-[#0F172A] relative"
    >
      {/* Subtle background pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 mosaic-pattern opacity-[0.04]" />
        <div
          className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[800px] h-64 rounded-full blur-[100px] opacity-10"
          style={{ background: '#006e2f' }}
        />
      </div>

      {/* Page content — standard block centering, no flex shrink issues */}
      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '40px 16px 60px' }} className="relative z-10">

        {/* ── Brand Header ── */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-slate-700 px-6 py-3 rounded-2xl shadow-soft mb-4"
          >
            <span style={{ fontSize: '22px', fontWeight: 700, color: '#006e2f', letterSpacing: '-0.5px' }}>
              Khidmat
            </span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#934b1b', marginTop: '-8px' }}>
              خدمت
            </span>
          </div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#101f16', lineHeight: '1.5', marginTop: '12px' }}
            className="dark:text-slate-200"
          >
            Professional &amp; localized service providers<br className="hidden sm:block" /> at your doorstep.
          </p>
        </div>

        {/* ── Auth Card ── */}
        <div
          style={{ width: '100%', borderRadius: '20px', overflow: 'hidden' }}
          className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-slate-700 shadow-soft"
        >
          <div style={{ padding: '28px 28px 32px' }}>

            {/* Card heading */}
            <h2 style={{ fontSize: '22px', fontWeight: 700, textAlign: 'center', marginBottom: '4px' }}
              className="text-gray-900 dark:text-white"
            >
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p style={{ fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}
              className="text-gray-500 dark:text-slate-400"
            >
              {isLogin
                ? 'Login with your credentials to search and book services.'
                : 'Sign up to register as a client or provide home services across Pakistan.'}
            </p>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* ── Role switcher (signup only) ── */}
              {!isLogin && (
                <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-lg transition-all ${
                      role === 'customer'
                        ? 'bg-white dark:bg-slate-900 text-[#006e2f] dark:text-[#6bff8f] shadow-sm'
                        : 'text-gray-500 dark:text-slate-400'
                    }`}
                  >
                    Hire Services (Client)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('provider')}
                    className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-lg transition-all ${
                      role === 'provider'
                        ? 'bg-white dark:bg-slate-900 text-[#006e2f] dark:text-[#6bff8f] shadow-sm'
                        : 'text-gray-500 dark:text-slate-400'
                    }`}
                  >
                    Provide Services (Worker)
                  </button>
                </div>
              )}

              {/* ── Signup-only fields ── */}
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="signup-fields"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                  >
                    {/* Profile Photo Upload Field */}
                    <div className="flex flex-col items-center justify-center py-2">
                      <label className="relative cursor-pointer group flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center overflow-hidden hover:border-[#006e2f] transition-all bg-gray-50 dark:bg-slate-800">
                          {photoPreview ? (
                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <Camera className="w-8 h-8 text-gray-400 group-hover:text-[#006e2f] transition-colors" />
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 mt-2 hover:text-[#006e2f] dark:hover:text-[#6bff8f] transition-colors">
                          {photoPreview ? 'Change Profile Photo' : 'Upload Profile Photo (Optional)'}
                        </span>
                      </label>
                    </div>

                    {/* Name */}
                    <div>
                      <label className={labelClass} htmlFor="name">Full Name</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-gray-400 dark:text-slate-500">
                          <User className="w-4 h-4" />
                        </span>
                        <input
                          type="text" id="name" value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={inputClass} placeholder="e.g. Muhammad Bilal"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className={labelClass} htmlFor="phone">Phone Number</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-gray-400 dark:text-slate-500 flex items-center gap-1 text-sm">
                          <Phone className="w-4 h-4" />
                          <span className="border-r border-gray-300 dark:border-slate-600 pr-2">+92</span>
                        </span>
                        <input
                          type="tel" id="phone" value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-24 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-[#006e2f] focus:ring-2 focus:ring-[#006e2f]/20 transition-all text-sm"
                          placeholder="3001234567" maxLength={10}
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div>
                      <label className={labelClass} htmlFor="city">City of Residence</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-gray-400 dark:text-slate-500">
                          <MapPin className="w-4 h-4" />
                        </span>
                        <select
                          id="city" value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className={inputClass + " appearance-none"}
                        >
                          {PakistaniCities.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <span className="absolute right-4 pointer-events-none text-gray-400 text-xs">▼</span>
                      </div>
                    </div>

                    {/* Map pin */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className={labelClass} style={{ marginBottom: 0 }}>Pin Exact Location</label>
                        <span className="text-[10px] text-[#006e2f] dark:text-[#6bff8f] font-semibold flex items-center gap-1">
                          <Map className="w-3 h-3" /> Drag marker to your location
                        </span>
                      </div>
                      <MapSelector value={coordinates} onChange={setCoordinates} city={city} />
                    </div>

                    {/* Provider-only fields */}
                    {role === 'provider' && (
                      <motion.div
                        key="provider-fields"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                        className="border-t border-gray-100 dark:border-slate-700 pt-4"
                      >
                        <h3 className="text-sm font-semibold text-[#006e2f] dark:text-[#6bff8f] flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4" /> Service &amp; Business Information
                        </h3>

                        {/* Category */}
                        <div>
                          <label className={labelClass} htmlFor="category">Service Specialty</label>
                          <div className="relative flex items-center">
                            <span className="absolute left-4 text-gray-400 dark:text-slate-500">
                              <Briefcase className="w-4 h-4" />
                            </span>
                            <select
                              id="category" value={category}
                              onChange={(e) => setCategory(e.target.value)}
                              className={inputClass + " appearance-none"}
                            >
                              {specialties.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                              ))}
                            </select>
                            <span className="absolute right-4 pointer-events-none text-gray-400 text-xs">▼</span>
                          </div>
                        </div>

                        {/* Base price */}
                        <div>
                          <label className={labelClass} htmlFor="basePrice">Base Hourly Rate (PKR)</label>
                          <div className="relative flex items-center">
                            <span className="absolute left-4 text-gray-400 dark:text-slate-500 font-semibold text-xs">Rs.</span>
                            <input
                              type="number" id="basePrice" value={basePrice}
                              onChange={(e) => setBasePrice(e.target.value)}
                              className={inputClass} placeholder="e.g. 800" min="1"
                            />
                          </div>
                        </div>

                        {/* Bio */}
                        <div>
                          <label className={labelClass} htmlFor="bio">Professional Bio</label>
                          <div className="relative flex">
                            <span className="absolute left-4 top-3 text-gray-400 dark:text-slate-500">
                              <BookOpen className="w-4 h-4" />
                            </span>
                            <textarea
                              id="bio" value={bio}
                              onChange={(e) => setBio(e.target.value)}
                              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-[#006e2f] focus:ring-2 focus:ring-[#006e2f]/20 transition-all text-sm min-h-[90px] resize-none"
                              placeholder="Describe your skills, years of experience, and why customers should hire you..."
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Email ── */}
              <div>
                <label className={labelClass} htmlFor="email">Email Address</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-gray-400 dark:text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email" id="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass} placeholder="name@example.com" required
                  />
                </div>
              </div>

              {/* ── Password ── */}
              <div>
                <label className={labelClass} htmlFor="password">Password</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-gray-400 dark:text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password" id="password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass} placeholder="••••••••" required minLength={6}
                  />
                </div>
              </div>

              {/* ── Submit ── */}
              <button
                type="submit"
                disabled={loading}
                style={{ marginTop: '8px' }}
                className="w-full bg-[#006e2f] hover:bg-[#005a27] active:scale-[0.98] text-white font-semibold py-4 rounded-xl shadow-soft transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? 'Login to Account' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle mode */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={handleToggleMode}
                className="text-[#006e2f] dark:text-[#6bff8f] hover:underline text-sm font-semibold transition-colors"
              >
                {isLogin
                  ? "Don't have an account? Sign Up"
                  : "Already have an account? Login"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
