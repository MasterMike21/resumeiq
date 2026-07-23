import React from 'react';

export default function BlindScreeningToggle({ isBlindMode, onToggle }) {
  return (
    <div className="flex items-center gap-3 bg-slate-200 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 w-fit">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
        🕶️ Recruiter Mode (Blind Audit)
      </span>
      <button
        onClick={() => onToggle(!isBlindMode)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          isBlindMode ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isBlindMode ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}