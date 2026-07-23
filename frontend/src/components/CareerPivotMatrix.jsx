import React from 'react';

export default function CareerPivotMatrix({ pivotData }) {
  if (!pivotData || !pivotData.tracks) return null;

  return (
    <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-6 mt-6 border border-slate-300 dark:border-slate-800 shadow-sm">
      <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">
        🔀 Career Pivot & Transferable Skill Matrix
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pivotData.tracks.map((track, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-blue-600 dark:text-blue-400">{track.role}</h4>
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                track.compatibilityScore >= 75 
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
              }`}>
                {track.compatibilityScore}% Match
              </span>
            </div>

            <div className="mb-3">
              <p className="text-xs text-slate-500 font-medium mb-1">Transferable Skills:</p>
              <div className="flex flex-wrap gap-1">
                {track.matchingSkills.map((sk, i) => (
                  <span key={i} className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">Priority Skill Gaps:</p>
              <div className="flex flex-wrap gap-1">
                {track.missingHighPrioritySkills.map((sk, i) => (
                  <span key={i} className="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                    + {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}