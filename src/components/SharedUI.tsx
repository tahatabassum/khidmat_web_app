import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-[#1E293B] rounded-2xl shadow-soft border border-gray-200 dark:border-slate-800 p-6 md:p-8 transition-all w-full ${className}`}>
      {children}
    </div>
  );
};

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`text-center max-w-md mx-auto py-12 px-6 flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary dark:text-primary-fixed flex items-center justify-center border border-primary/20">
        <Icon className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-primary hover:brightness-105 active:scale-95 text-on-primary font-semibold py-3 px-6 rounded-xl transition-all shadow-soft text-sm w-full"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

interface AvatarProps {
  src?: string;
  name: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, className = 'w-12 h-12' }) => {
  if (src && src.trim() !== '') {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover border border-gray-200 dark:border-slate-700 ${className}`}
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    );
  }

  return (
    <div className={`rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center border border-gray-200 dark:border-slate-700 select-none ${className}`}>
      <svg
        className="w-2/3 h-2/3 opacity-70"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0 1 12.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
      </svg>
    </div>
  );
};
