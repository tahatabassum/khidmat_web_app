import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#FAFAF5] dark:bg-[#0F172A] border-t border-outline-variant/30 dark:border-slate-800 py-6 mt-auto">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant dark:text-slate-400">
        <p className="font-semibold text-center md:text-left">
          Made with ❤️ and ☕ for DYLP Hackathon
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="mailto:tahatabassum9@gmail.com"
            className="hover:text-primary dark:hover:text-primary-fixed transition-colors font-medium"
          >
            tahatabassum9@gmail.com
          </a>
          <span className="hidden md:inline text-gray-300 dark:text-slate-700">|</span>
          <a
            href="mailto:mabdullahramday08@gmail.com"
            className="hover:text-primary dark:hover:text-primary-fixed transition-colors font-medium"
          >
            mabdullahramday08@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
};
