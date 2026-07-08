import React from 'react';
import { Award, Sparkles, Trophy } from 'lucide-react';

interface TierBadgeProps {
  tier: string;
  className?: string;
  showIcon?: boolean;
}

export const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  className = '',
  showIcon = true
}) => {
  const normalizedTier = tier.trim().toLowerCase();

  let badgeStyles = '';
  let IconComponent = Award;

  switch (normalizedTier) {
    case 'platinum':
      badgeStyles = 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-none shadow-md font-extrabold tracking-wide uppercase animate-pulse';
      IconComponent = Sparkles;
      break;
    case 'gold':
      badgeStyles = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 dark:border-amber-500/20 font-bold';
      IconComponent = Trophy;
      break;
    case 'silver':
      badgeStyles = 'bg-slate-300/20 text-slate-700 dark:text-slate-300 border-slate-300/30 dark:border-slate-300/20 font-semibold';
      IconComponent = Award;
      break;
    case 'bronze':
    default:
      badgeStyles = 'bg-[#CD7F32]/10 text-[#CD7F32] dark:text-[#E0A96D] border-[#CD7F32]/30 dark:border-[#CD7F32]/20 font-medium';
      IconComponent = Award;
      break;
  }

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] md:text-xs leading-none transition-all duration-300 hover:scale-105 select-none ${badgeStyles} ${className}`}
    >
      {showIcon && <IconComponent className="w-3.5 h-3.5" />}
      <span>{tier}</span>
    </span>
  );
};

export default TierBadge;
