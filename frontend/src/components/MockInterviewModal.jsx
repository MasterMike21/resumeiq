import { useState } from 'react';
import axios from 'axios';

export default function MockInterviewModal({ isOpen, onClose, userProfile }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  if (!isOpen) return null;

  const targetRole = userProfile?.targetRole || 'Full-Stack Developer';
  const skills = userProfile?.skills || 'React, Node.js, Express, MongoDB';

  const startInterview = async () => {
    setLoading(true);
    try {
      const rawApiUrl = import.meta.env.VITE_API_URL || "https://resumeiq-backend-hyg4.onrender.com";
      const API_URL = rawApiUrl.replace(/\/api\/?$/, '');
      const token = localStorage.getItem('token');

      // Attempt to generate tailored AI questions if route exists
      const res = await axios.post(
        `${API_URL}/api/interview/generate`,
        { targetRole, skills },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.questions) {
        setQuestions(res.data.questions);
      } else {
        throw new Error("No custom questions returned");
      }
    } catch (err) {
      // Smart Fallback Questions customized to the user's saved Target Role & Tech Stack
      const primarySkill = skills.split(',')[0]?.trim() || 'your core stack';
      setQuestions([
        `Explain a complex architectural decision or feature you built using ${primarySkill}.`,
        `How do you optimize API performance and handle database bottleneck issues in a ${targetRole} pipeline?`,
        `Describe a scenario where you had to debug an intermittent production issue under high time pressure.`
      ]);
    } finally {
      setLoading(false);
      setStarted(true);
    }
  };

  const handleReset = () => {
    setStarted(false);
    setQuestions([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full text-slate-100 shadow-2xl relative">
        <button 
          onClick={handleReset} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-lg font-bold transition"
        >
          ✕
        </button>

        <div className="mb-4">
          <h3 className="text-xl font-bold tracking-tight">AI Mock Interview Session</h3>
          <p className="text-xs text-indigo-400 font-medium mt-0.5">
            Role Target: {targetRole}
          </p>
        </div>

        {!started ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto text-xl">
              🎯
            </div>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              Launch a rapid technical drill personalized to your profile target and core tech stack ({skills || 'General Software Engineering'}).
            </p>
            <button
              onClick={startInterview}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl text-xs transition shadow-lg disabled:opacity-50"
            >
              {loading ? 'Generating Scenario Questions...' : 'Start Mock Session'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Targeted Practice Questions</span>
              <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full">3 Questions</span>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {questions.map((q, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-xs text-slate-200 leading-relaxed">
                  <span className="text-indigo-400 font-bold mr-1.5">Q{idx + 1}.</span> {q}
                </div>
              ))}
            </div>

            <button
              onClick={handleReset}
              className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2.5 rounded-xl text-xs transition"
            >
              Complete Practice Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}