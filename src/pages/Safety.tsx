import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronLeft, CheckCircle2, UserCheck, PhoneCall, MapPin, Star } from 'lucide-react';
import { Card } from '../components/SharedUI';

export const Safety: React.FC = () => {
  const navigate = useNavigate();

  const safetySteps = [
    {
      title: "1. CNIC & Biometric Verification",
      icon: UserCheck,
      description: "Every service provider must submit a valid National Identity Card (CNIC) which is verified against official databases to ensure correct identity mapping."
    },
    {
      title: "2. Active Phone Verification",
      icon: PhoneCall,
      description: "Contact numbers are validated via one-time passwords (OTP) to ensure clients can always reach the assigned professional in real-time."
    },
    {
      title: "3. Address & Location Confirmation",
      icon: MapPin,
      description: "Physical addresses are collected and verified. Geolocation pinning registers their exact service dispatch coordinates on our local maps."
    },
    {
      title: "4. Background & Reference Audit",
      icon: Shield,
      description: "We review local police records clearance (character certificate) and interview reference checks for initial screening before listing."
    },
    {
      title: "5. In-App Performance Monitoring",
      icon: Star,
      description: "Ratings and feedback are monitored dynamically. Low ratings (under 4.2 stars) trigger warning notifications and system review, ensuring service standards."
    }
  ];

  return (
    <div className="pt-28 pb-28 md:pb-12 px-margin-mobile md:px-margin-desktop max-w-xl mx-auto w-full">
      {/* Header back button */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full border border-gray-200 dark:border-slate-800 flex items-center justify-center text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Safety & Verification</h1>
      </div>

      <div className="space-y-6">
        <Card className="p-6 md:p-8 bg-gradient-to-br from-primary/5 via-[#FAFAF5] to-transparent dark:from-primary/5 dark:via-slate-900">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Our 5-Step Safety Check</h2>
              <p className="text-xs font-semibold text-primary dark:text-[#6bff8f] uppercase tracking-wider">Verified Service Professionals</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
            At Khidmat, your safety and satisfaction are our top priorities. Every registered service provider undergoes a comprehensive 5-step background and validation check before they can accept bookings.
          </p>
        </Card>

        <div className="space-y-4">
          {safetySteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Card key={idx} className="p-5 md:p-6 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 text-primary flex items-center justify-center border border-gray-200 dark:border-slate-700 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {step.title}
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed mt-1">
                    {step.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
