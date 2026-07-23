import { useMemo } from 'react';
import { Crosshair, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function BenchmarkGapAnalysis({ userProfile, latestScan }) {
  const targetRole = userProfile?.targetRole || 'Software Engineer';
  const targetSkills = useMemo(() => {
    return (userProfile?.skills || '')
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);
  }, [userProfile?.skills]);

  const detectedSkills = useMemo(() => {
    const raw = latestScan?.skills || latestScan?.detectedSkills || [];
    return Array.isArray(raw) ? raw.map(s => String(s).trim().toLowerCase()) : [];
  }, [latestScan]);

  const matchedSkills = targetSkills.filter(skill => 
    detectedSkills.some(ds => ds.includes(skill) || skill.includes(ds))
  );
  const missingSkills = targetSkills.filter(skill => !matchedSkills.includes(skill));

  const roleMatchScore = targetSkills.length > 0 
    ? Math.round((matchedSkills.length / targetSkills.length) * 100) 
    : (latestScan?.atsScore || 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-white">
            <Crosshair className="text-indigo-400" size={20} />
            Target Role Benchmark Analysis
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-matching resume extractions against target role: <span className="text-indigo-300 font-medium">{targetRole}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Target Match Score:</span>
          <span className={`text-xl font-extrabold ${
            roleMatchScore >= 75 ? 'text-emerald-400' : roleMatchScore >= 50 ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {roleMatchScore}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <CheckCircle2 size={16} />
            Matched Stack Core ({matchedSkills.length}/{targetSkills.length})
          </div>
          {matchedSkills.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No exact skill matches detected yet.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {matchedSkills.map((skill, idx) => (
                <span key={idx} className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs px-2.5 py-1 rounded-lg capitalize">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
            <AlertTriangle size={16} />
            Benchmark Gaps ({missingSkills.length})
          </div>
          {missingSkills.length === 0 ? (
            <p className="text-xs text-emerald-400 font-medium">✨ All target skills identified in resume!</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {missingSkills.map((skill, idx) => (
                <span key={idx} className="bg-rose-950/80 border border-rose-800 text-rose-300 text-xs px-2.5 py-1 rounded-lg capitalize">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}