import React, { useState } from 'react';

export default function MockInterviewModal({ questions, onClose, apiBaseUrl }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [loading, setLoading] = useState(false);

  const currentQ = questions[currentIndex];

  const handleAnswerSubmit = async () => {
    const candidateAns = answers[currentQ.id];
    if (!candidateAns?.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/interview/evaluate-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQ.question,
          evalCriteria: currentQ.evalCriteria,
          candidateAnswer: candidateAns
        })
      });
      const data = await res.json();
      setEvaluations((prev) => ({ ...prev, [currentQ.id]: data }));
    } catch (err) {
      console.error("Evaluation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">🎯 AI Mock Interviewer ({currentIndex + 1}/{questions.length})</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl font-bold">✕</button>
        </div>

        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl mb-4">
          <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded font-semibold">
            {currentQ.type} • {currentQ.focusArea}
          </span>
          <p className="mt-2 text-base font-medium">{currentQ.question}</p>
        </div>

        <textarea
          rows={4}
          value={answers[currentQ.id] || ''}
          onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
          placeholder="Type your answer using STAR method (Situation, Task, Action, Result)..."
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex justify-between items-center mt-4">
          <button 
            disabled={currentIndex === 0} 
            onClick={() => setCurrentIndex((i) => i - 1)}
            className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 disabled:opacity-50 text-sm font-medium"
          >
            Previous
          </button>

          <button 
            onClick={handleAnswerSubmit} 
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors"
          >
            {loading ? 'Evaluating...' : 'Evaluate Answer'}
          </button>

          <button 
            disabled={currentIndex === questions.length - 1} 
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 disabled:opacity-50 text-sm font-medium"
          >
            Next
          </button>
        </div>

        {evaluations[currentQ.id] && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-sm">
            <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-base">Score: {evaluations[currentQ.id].score}/100</h4>
            <p className="mt-1"><strong>Feedback:</strong> {evaluations[currentQ.id].feedback}</p>
            {evaluations[currentQ.id].missingKeyPoints?.length > 0 && (
              <p className="mt-1 text-xs text-rose-500"><strong>Missing Points:</strong> {evaluations[currentQ.id].missingKeyPoints.join(', ')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}