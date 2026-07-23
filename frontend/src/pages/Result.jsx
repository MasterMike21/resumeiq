import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ResumeDiffViewer from '../components/ResumeDiffViewer';
import JdTailorXyz from '../components/JdTailorXyz';

// Safe Inline SVGs
const CheckCircleIcon = () => (
  <svg className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PrinterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
);

export default function Result() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Mock Interviewer State
  const [isInterviewOpen, setIsInterviewOpen] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [answers, setAnswers] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [evaluatingQId, setEvaluatingQId] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Career Pivot Matrix State
  const [pivotData, setPivotData] = useState(null);
  const [loadingPivot, setLoadingPivot] = useState(false);

  // Blind Screening State
  const [isBlindMode, setIsBlindMode] = useState(false);
  const [anonymizedText, setAnonymizedText] = useState('');
  const [loadingAnonymize, setLoadingAnonymize] = useState(false);

  // Clean base URL to prevent missing or duplicated /api prefixes
  const rawApiUrl = import.meta.env.VITE_API_URL || "https://resumeiq-backend-hyg4.onrender.com";
  const API_URL = rawApiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');

  const fetchPivotData = useCallback(async (resumeText) => {
    if (!resumeText) return;
    setLoadingPivot(true);
    try {
      const res = await axios.post(`${API_URL}/api/career/pivot-matrix`, { resumeText });
      setPivotData(res.data);
    } catch (err) {
      console.error("Pivot Matrix failed:", err);
    } finally {
      setLoadingPivot(false);
    }
  }, [API_URL]);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        let res;
        try {
          res = await axios.get(`${API_URL}/api/resume/result/${id}`, { headers });
        } catch {
          // Fallback route using proper /api prefix
          res = await axios.get(`${API_URL}/api/resume/report/${id}`, { headers });
        }

        const reportPayload = res.data?.report || res.data?.data || res.data;
        
        if (reportPayload) {
          reportPayload.atsScore = reportPayload.atsScore ?? reportPayload.score ?? reportPayload.overallScore ?? 0;
        }

        setReport(reportPayload);

        const resumeText = reportPayload?.resume?.parsedText || reportPayload?.parsedText || reportPayload?.resumeText || '';
        if (resumeText) {
          fetchPivotData(resumeText);
        }
      } catch (err) {
        console.error("Error fetching report:", err);
        setFetchError(err.response?.data?.message || "Failed to load report payload.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReport();
    }
  }, [id, API_URL, fetchPivotData]);

  const handleToggleAnonymizer = async () => {
    const nextState = !isBlindMode;
    setIsBlindMode(nextState);

    if (nextState && !anonymizedText) {
      setLoadingAnonymize(true);
      try {
        const resumeText = report?.resume?.parsedText || report?.parsedText || report?.resumeText || '';
        const res = await axios.post(`${API_URL}/api/anonymize`, { resumeText });
        setAnonymizedText(res.data?.anonymizedText || '');
      } catch (err) {
        console.error("Anonymize failed:", err);
      } finally {
        setLoadingAnonymize(false);
      }
    }
  };

  const handleStartInterview = async () => {
    setGeneratingQuestions(true);
    try {
      const resumeText = report?.resume?.parsedText || report?.parsedText || report?.resumeText || '';
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium text-sm">Compiling structural matrix layers...</p>
      </div>
    );
  }

  if (fetchError || !report) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
        <h3 className="text-rose-700 font-bold text-lg">Report Payload Error</h3>
        <p className="text-rose-600 text-sm">{fetchError || "Could not retrieve report data for this ID."}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-500 transition">
          Retry
        </button>
      </div>
    );
  }

  const breakdownEntries = report.breakdown ? Object.entries(report.breakdown) : [];
  const suggestions = Array.isArray(report.suggestions) ? report.suggestions : [];
  const skillGaps = Array.isArray(report.skillGap) ? report.skillGap : (Array.isArray(report.missingSkills) ? report.missingSkills : []);
  const recommendedRoles = Array.isArray(report.recommendedRoles) ? report.recommendedRoles : (Array.isArray(report.pathBlueprints) ? report.pathBlueprints : []);
  const currentQ = interviewQuestions[currentQIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 print:p-0 print:bg-white text-slate-900 dark:text-slate-100">
      
      {/* Header Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analysis Breakdown</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">File Target: {report?.fileName || report?.resume?.fileName || 'Uploaded Resume'}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleAnonymizer}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
              isBlindMode 
                ? 'bg-slate-900 text-emerald-400 border-slate-900 dark:bg-emerald-950 dark:border-emerald-800' 
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700'
            }`}
          >
            🕶️ {isBlindMode ? 'Blind Audit: ACTIVE' : 'Recruiter Blind Mode'}
          </button>

          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 border border-slate-300 dark:border-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 transition shadow-sm"
          >
            <PrinterIcon /> Print Report
          </button>
        </div>
      </div>

      {/* Recruiter Blind Mode View */}
      {isBlindMode && (
        <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <span>🕶️ Recruiter Blind Screening (Anonymized View)</span>
          </div>
          <p className="text-xs text-slate-400">Personal identifiers stripped server-side using NLP rules.</p>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 max-h-40 overflow-y-auto mt-2">
            {loadingAnonymize ? "Scrubbing identifiers..." : (anonymizedText || "No raw text available for sanitization.")}
          </div>
        </div>
      )}

      {/* Score Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl flex flex-col items-center justify-center shadow-sm text-center">
          <div className={`text-5xl font-extrabold px-6 py-4 rounded-full mb-3 ${
            (report.atsScore || 0) >= 75 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
            (report.atsScore || 0) >= 50 ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400' : 
            'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
          }`}>
            {report.atsScore ?? 0}%
          </div>
          <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Overall ATS Score</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm md:col-span-2 space-y-3">
          <h3 className="font-bold text-lg mb-2">Category Score Allocations</h3>
          {breakdownEntries.length > 0 ? breakdownEntries.map(([key, value]) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-sm font-medium">
                <span className="capitalize text-slate-600 dark:text-slate-400">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span>{value} pts</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${Math.min(100, (value / 25) * 100)}%` }}></div>
              </div>
            </div>
          )) : (
            <p className="text-xs text-slate-400">No score breakdown available.</p>
          )}
        </div>
      </div>

      {/* Optimization Targets & Skill Gaps */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">🏆 Optimization Targets</h3>
          <ul className="space-y-2.5">
            {suggestions.map((item, idx) => (
              <li key={idx} className="flex gap-2.5 text-sm text-slate-600 dark:text-slate-300 items-start">
                <CheckCircleIcon /> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">⚠️ Identified Skill Deficiencies</h3>
          <div className="flex flex-wrap gap-2">
            {skillGaps.map((skill, idx) => (
              <span key={idx} className="bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300 px-3 py-1 rounded-lg text-xs font-semibold">{skill}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Roles */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2">💼 Recommended Path Blueprints</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {recommendedRoles.map((role, idx) => (
            <div key={idx} className="border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-4 py-3 rounded-xl text-sm font-medium">{role}</div>
          ))}
        </div>
      </div>

      {/* Resume Diff Viewer */}
      <ResumeDiffViewer 
        originalText={report?.originalText || report?.parsedText} 
        optimizedText={report?.optimizedText || report?.enhancedResumeText} 
      />

      {/* XYZ Bullet Tailoring Engine */}
      <JdTailorXyz 
        initialBullets={report?.extractedBullets || suggestions} 
        jobDescription={report?.jobDescription || ''} 
      />

      {/* AI Mock Interviewer Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-wrap justify-between items-center gap-4 border border-indigo-900/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <span>✨ Interactive Placement Module</span>
          </div>
          <h3 className="text-xl font-bold">Dynamic AI Mock Interviewer</h3>
          <p className="text-xs text-slate-300 max-w-lg">
            Convert detected skill deficiencies and projects into a tailored 5-question mock interview session.
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

      {/* Career Pivot Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            🧩 Transferable Skill & Career Pivot Matrix
          </h3>
          <span className="text-xs text-slate-400">Semantic Alignment</span>
        </div>

        {loadingPivot ? (
          <div className="text-xs text-slate-400 py-4 text-center">Calculating semantic cross-track alignment...</div>
        ) : pivotData?.tracks ? (
          <div className="grid md:grid-cols-3 gap-4">
            {pivotData.tracks.map((track, idx) => (
              <div key={idx} className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm">{track.role}</h4>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    track.compatibilityScore >= 75 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' 
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                  }`}>
                    {track.compatibilityScore}% Match
                  </span>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Transferable Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {track.matchingSkills?.map((sk, i) => (
                      <span key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300 text-[11px] px-2 py-0.5 rounded font-medium">
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Priority Gaps</p>
                  <div className="flex flex-wrap gap-1">
                    {track.missingHighPrioritySkills?.map((sk, i) => (
                      <span key={i} className="bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300 text-[11px] px-2 py-0.5 rounded font-medium">
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

      {/* Mock Interview Modal */}
      {isInterviewOpen && currentQ && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-lg">
                  Q{currentQIndex + 1} of {interviewQuestions.length}
                </span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {currentQ.type} • {currentQ.focusArea}
                </span>
              </div>
              <button 
                onClick={() => setIsInterviewOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-sm font-semibold">{currentQ.question}</p>
            </div>

            <textarea
              rows={4}
              value={answers[currentQ.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
              placeholder="Structure your answer using STAR method..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
            />

            <div className="flex justify-between items-center">
              <button
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex((i) => i - 1)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 disabled:opacity-40"
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
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 disabled:opacity-40"
              >
                Next
              </button>
            </div>

            {/* Evaluation Result Feedback */}
            {evaluations[currentQ.id] && (
              <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">Score: {evaluations[currentQ.id].score}/100</span>
                </div>
                <p><strong>Feedback:</strong> {evaluations[currentQ.id].feedback}</p>
                {evaluations[currentQ.id].missingKeyPoints?.length > 0 && (
                  <p className="text-rose-600 dark:text-rose-400"><strong>Key Points Omitted:</strong> {evaluations[currentQ.id].missingKeyPoints.join(', ')}</p>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}