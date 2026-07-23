import { useEffect, useState } from 'react';
import { useParams } from 'react';
import axios from 'axios';
import { CheckCircle, AlertTriangle, Briefcase, Award, Printer, UserX, Sparkles, Compass } from 'lucide-react';

export default function Result() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Feature 1 State (Mock Interviewer)
  const [isInterviewOpen, setIsInterviewOpen] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [answers, setAnswers] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [evaluatingQId, setEvaluatingQId] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Feature 2 State (Career Pivot Matrix)
  const [pivotData, setPivotData] = useState(null);
  const [loadingPivot, setLoadingPivot] = useState(false);

  // Feature 3 State (Blind Screening Anonymizer)
  const [isBlindMode, setIsBlindMode] = useState(false);
  const [anonymizedText, setAnonymizedText] = useState('');
  const [loadingAnonymize, setLoadingAnonymize] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/resume/report/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReport(res.data);

        // Fetch Career Pivot Matrix automatically if resume text exists
        const resumeText = res.data?.resume?.parsedText || res.data?.resumeText || '';
        if (resumeText) {
          fetchPivotData(resumeText);
        }
      } catch (err) {
        console.error("Error fetching report:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  // Handler for Feature 3: Toggle Anonymizer
  const handleToggleAnonymizer = async () => {
    const nextState = !isBlindMode;
    setIsBlindMode(nextState);

    if (nextState && !anonymizedText) {
      setLoadingAnonymize(true);
      try {
        const resumeText = report?.resume?.parsedText || report?.resumeText || '';
        const res = await axios.post(`${API_URL}/api/anonymize`, { resumeText });
        setAnonymizedText(res.data?.anonymizedText || '');
      } catch (err) {
        console.error("Anonymize failed:", err);
      } finally {
        setLoadingAnonymize(false);
      }
    }
  };

  // Handler for Feature 2: Fetch Career Pivot Data
  const fetchPivotData = async (resumeText) => {
    setLoadingPivot(true);
    try {
      const res = await axios.post(`${API_URL}/api/career/pivot-matrix`, { resumeText });
      setPivotData(res.data);
    } catch (err) {
      console.error("Pivot Matrix failed:", err);
    } finally {
      setLoadingPivot(false);
    }
  };

  // Handler for Feature 1: Generate AI Mock Interview Questions
  const handleStartInterview = async () => {
    setGeneratingQuestions(true);
    try {
      const resumeText = report?.resume?.parsedText || report?.resumeText || '';
      const jobDescription = report?.jobDescription || 'Software Engineering Role';
      
      const res = await axios.post(`${API_URL}/api/interview/generate-questions`, {
        resumeText,
        jobDescription
      });

      setInterviewQuestions(res.data?.questions || []);
      setCurrentQIndex(0);
      setIsInterviewOpen(true);
    } catch (err) {
      console.error("Failed to generate questions:", err);
    } finally {
      setGeneratingQuestions(false);
    }
  };

  // Handler for Feature 1: Evaluate Individual Answer
  const handleEvaluateAnswer = async (qId, question, evalCriteria) => {
    const candidateAnswer = answers[qId];
    if (!candidateAnswer?.trim()) return;

    setEvaluatingQId(qId);
    try {
      const res = await axios.post(`${API_URL}/api/interview/evaluate-answer`, {
        question,
        evalCriteria,
        candidateAnswer
      });
      setEvaluations(prev => ({ ...prev, [qId]: res.data }));
    } catch (err) {
      console.error("Answer evaluation failed:", err);
    } finally {
      setEvaluatingQId(null);
    }
  };

  if (loading) return <div className="text-center mt-20 text-slate-500 font-medium">Compiling structural matrix layers...</div>;
  if (!report) return <div className="text-center mt-20 text-red-500 font-medium">Report details processing fault payload.</div>;

  const currentQ = interviewQuestions[currentQIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 print:p-0 print:bg-white">
      
      {/* Header Bar with Print and Recruiter Mode Toggle */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-200 pb-6 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analysis Breakdown</h1>
          <p className="text-slate-500 mt-1">File Target: {report.resume?.fileName || 'Uploaded Resume'}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Feature 3: Anonymizer Toggle Button */}
          <button
            onClick={handleToggleAnonymizer}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
              isBlindMode 
                ? 'bg-slate-900 text-emerald-400 border-slate-900' 
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <UserX size={15} />
            {isBlindMode ? 'Blind Audit: ACTIVE' : 'Recruiter Blind Mode'}
          </button>

          {/* Print Button */}
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 border border-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition shadow-sm"
          >
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      {/* Feature 3 Banner View (Shows when Blind Audit Mode is enabled) */}
      {isBlindMode && (
        <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <UserX size={16} />
            <span>Recruiter Blind Screening (Anonymized View)</span>
          </div>
          <p className="text-xs text-slate-400">
            Personal identifiers (Email, Phone, Links, Specific Institutions) have been stripped server-side using NLP regex rules.
          </p>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 max-h-40 overflow-y-auto mt-2">
            {loadingAnonymize ? "Scrubbing identifiers..." : (anonymizedText || "No raw text available for sanitization.")}
          </div>
        </div>
      )}

      {/* Score and Breakdown Allocation Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-8 rounded-2xl flex flex-col items-center justify-center shadow-sm text-center">
          <div className={`text-5xl font-extrabold px-6 py-4 rounded-full mb-3 ${report.atsScore >= 75 ? 'bg-emerald-50 text-emerald-700' : report.atsScore >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
            {report.atsScore}%
          </div>
          <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Overall ATS Score</span>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm md:col-span-2 space-y-3">
          <h3 className="font-bold text-slate-800 text-lg mb-2">Category Score Allocations</h3>
          {Object.entries(report.breakdown || {}).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-sm font-medium">
                <span className="capitalize text-slate-600">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-slate-900">{value} pts</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(value / 25) * 100}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Targets & Identified Skill Deficiencies */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><Award className="text-indigo-600" size={20} /> Optimization Targets</h3>
          <ul className="space-y-2.5">
            {report.suggestions?.map((item, idx) => (
              <li key={idx} className="flex gap-2.5 text-sm text-slate-600 items-start"><CheckCircle className="text-indigo-500 shrink-0 mt-0.5" size={16} /> {item}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><AlertTriangle className="text-amber-500" size={20} /> Identified Skill Deficiencies</h3>
          <div className="flex flex-wrap gap-2">
            {report.skillGap?.map((skill, idx) => (
              <span key={idx} className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1 rounded-lg text-xs font-semibold">{skill}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Path Blueprints */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><Briefcase className="text-emerald-600" size={20} /> Recommended Path Blueprints</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {report.recommendedRoles?.map((role, idx) => (
            <div key={idx} className="border border-slate-100 bg-slate-50/50 px-4 py-3 rounded-xl text-sm font-medium text-slate-800">{role}</div>
          ))}
        </div>
      </div>

      {/* FEATURE 1 BANNER: AI Mock Interviewer Launcher */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-wrap justify-between items-center gap-4 border border-indigo-900/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <Sparkles size={18} />
            <span>Interactive Placement Module</span>
          </div>
          <h3 className="text-xl font-bold">Dynamic AI Mock Interviewer</h3>
          <p className="text-xs text-slate-300 max-w-lg">
            Convert detected skill deficiencies and resume projects into a tailored 5-question mock interview session with real-time scoring.
          </p>
        </div>
        <button
          onClick={handleStartInterview}
          disabled={generatingQuestions}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-md disabled:opacity-50"
        >
          {generatingQuestions ? "Building Questions..." : "Launch Mock Interview"}
        </button>
      </div>

      {/* FEATURE 2 SECTION: Transferable Skill & Career Pivot Matrix */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Compass className="text-blue-600" size={20} /> Transferable Skill & Career Pivot Matrix
          </h3>
          <span className="text-xs text-slate-400">Semantic Alignment</span>
        </div>

        {loadingPivot ? (
          <div className="text-xs text-slate-400 py-4 text-center">Calculating semantic cross-track alignment...</div>
        ) : pivotData?.tracks ? (
          <div className="grid md:grid-cols-3 gap-4">
            {pivotData.tracks.map((track, idx) => (
              <div key={idx} className="border border-slate-200 bg-slate-50/50 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm text-slate-800">{track.role}</h4>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    track.compatibilityScore >= 75 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {track.compatibilityScore}% Match
                  </span>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Transferable Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {track.matchingSkills?.map((sk, i) => (
                      <span key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] px-2 py-0.5 rounded font-medium">
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Priority Gaps</p>
                  <div className="flex flex-wrap gap-1">
                    {track.missingHighPrioritySkills?.map((sk, i) => (
                      <span key={i} className="bg-rose-50 text-rose-700 border border-rose-200 text-[11px] px-2 py-0.5 rounded font-medium">
                        + {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 py-2">No cross-track pivot matrix available for this session.</div>
        )}
      </div>

      {/* FEATURE 1 MODAL: AI Mock Interview Session */}
      {isInterviewOpen && currentQ && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white text-slate-900 p-6 rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl space-y-5">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                  Q{currentQIndex + 1} of {interviewQuestions.length}
                </span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {currentQ.type} • {currentQ.focusArea}
                </span>
              </div>
              <button 
                onClick={() => setIsInterviewOpen(false)} 
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-sm font-semibold text-slate-800">{currentQ.question}</p>
            </div>

            <textarea
              rows={4}
              value={answers[currentQ.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
              placeholder="Structure your answer using the STAR method (Situation, Task, Action, Result)..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
            />

            <div className="flex justify-between items-center">
              <button
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex((i) => i - 1)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-40"
              >
                Previous
              </button>

              <button
                onClick={() => handleEvaluateAnswer(currentQ.id, currentQ.question, currentQ.evalCriteria)}
                disabled={evaluatingQId === currentQ.id || !answers[currentQ.id]?.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition disabled:opacity-50"
              >
                {evaluatingQId === currentQ.id ? 'Evaluating...' : 'Submit & Score Answer'}
              </button>

              <button
                disabled={currentQIndex === interviewQuestions.length - 1}
                onClick={() => setCurrentQIndex((i) => i + 1)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-40"
              >
                Next
              </button>
            </div>

            {/* Evaluation Result Feedback */}
            {evaluations[currentQ.id] && (
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-800 text-sm">Score: {evaluations[currentQ.id].score}/100</span>
                </div>
                <p className="text-slate-700"><strong>Feedback:</strong> {evaluations[currentQ.id].feedback}</p>
                {evaluations[currentQ.id].missingKeyPoints?.length > 0 && (
                  <p className="text-rose-600"><strong>Key Points Omitted:</strong> {evaluations[currentQ.id].missingKeyPoints.join(', ')}</p>
                )}
                {evaluations[currentQ.id].improvedAnswerSnippet && (
                  <p className="text-slate-600 italic"><strong>Model Approach:</strong> "{evaluations[currentQ.id].improvedAnswerSnippet}"</p>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}