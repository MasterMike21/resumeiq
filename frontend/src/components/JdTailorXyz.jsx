import { useState } from 'react';
import axios from 'axios';
import { Sparkles, ArrowRight, Copy, Check } from 'lucide-react';

export default function JdTailorXyz({ initialBullets = [], jobDescription = '' }) {
  const [bulletsText, setBulletsText] = useState(initialBullets.join('\n'));
  const [jdText, setJdText] = useState(jobDescription);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const rawApiUrl = import.meta.env.VITE_API_URL || "https://resumeiq-backend-hyg4.onrender.com";
  const API_URL = rawApiUrl.replace(/\/api\/?$/, '');

  const handleTailor = async () => {
    const rawBullets = bulletsText.split('\n').filter(b => b.trim().length > 0);
    if (rawBullets.length === 0) return;

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/resume/tailor-xyz`, {
        bullets: rawBullets,
        jobDescription: jdText
      });
      setResults(res.data?.tailoredBullets || []);
    } catch (err) {
      console.error("XYZ Tailor Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-xl font-bold flex items-center gap-2 text-white">
          <Sparkles className="text-amber-400" size={20} />
          Google XYZ Formula Bullet Rewriter
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Rewrites weak bullet points into high-impact <span className="text-indigo-300 font-mono">"Accomplished [X], measured by [Y], by doing [Z]"</span> statements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Raw Bullet Points (One per line)</label>
          <textarea
            rows={5}
            value={bulletsText}
            onChange={(e) => setBulletsText(e.target.value)}
            placeholder="e.g. Built frontend web application using React and Node.js..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Target Job Description</label>
          <textarea
            rows={5}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste core responsibilities and keywords here..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          />
        </div>
      </div>

      <button
        onClick={handleTailor}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? "Generating Impact Metrics..." : "Transform with XYZ Formula"}
      </button>

      {results.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-sm font-bold text-slate-200">Optimized Statements</h4>
          {results.map((item, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="text-xs text-slate-400 line-through">{item.original}</div>
              <div className="flex items-start justify-between gap-3 text-xs font-medium text-emerald-400">
                <div className="flex items-start gap-2">
                  <ArrowRight size={14} className="shrink-0 mt-0.5 text-emerald-500" />
                  <span>{item.xyzVersion}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(item.xyzVersion, idx)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg shrink-0 transition"
                >
                  {copiedIdx === idx ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
              <span className="inline-block bg-indigo-950/80 text-indigo-300 border border-indigo-800 text-[10px] px-2 py-0.5 rounded font-mono">
                {item.impactIncrease || "High ATS Impact"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}