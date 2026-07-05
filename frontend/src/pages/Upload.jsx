import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, FileCode } from 'lucide-react';

export default function Upload() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jdMethod, setJdMethod] = useState('text'); // 'text' or 'file'
  const [jdText, setJdText] = useState('');
  const [jdFile, setJdFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) setResumeFile(file);
  };

  const handleJdFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setJdFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!resumeFile) {
      setError('Please upload your resume document.');
      return;
    }

    if (jdMethod === 'text' && !jdText.trim()) {
      setError('Please paste the job description text.');
      return;
    }

    if (jdMethod === 'file' && !jdFile) {
      setError('Please upload a job description document.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    
    // Append the primary resume document
    formData.append('resume', resumeFile);
    
    // Append the conditional Job Description payloads dynamically
    formData.append('jdMethod', jdMethod);
    if (jdMethod === 'text') {
      formData.append('jobDescriptionText', jdText.trim());
    } else {
      formData.append('jobDescriptionFile', jdFile);
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/resume/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Navigate straight to the freshly created metric analysis page view
      navigate(`/result/${res.data.reportId || res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Deep analytical processing sequence failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">ATS Alignment Engine</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Upload your core profile assets to benchmark structural tracking vectors against organizational baselines.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 📄 SECTION 1: RESUME UPLOAD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-colors">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold">1</span>
            Upload Primary Resume
          </h2>
          
          <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${resumeFile ? 'border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/5' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500'}`}>
            <input type="file" accept=".pdf,.docx,.txt" onChange={handleResumeChange} className="hidden" />
            {resumeFile ? (
              <div className="text-center">
                <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={36} />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{resumeFile.name}</p>
                <p className="text-xs text-slate-400 mt-1">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB • Ready</p>
              </div>
            ) : (
              <div className="text-center">
                <UploadCloud className="mx-auto text-slate-400 mb-2" size={36} />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Click or drag profile resume file</p>
                <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, or TXT formats</p>
              </div>
            )}
          </label>
        </div>

        {/* 💼 SECTION 2: JOB DESCRIPTION CAPTURE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold">2</span>
              Target Job Description
            </h2>
            
            {/* Toggle Switch Tabs */}
            <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg self-start">
              <button type="button" onClick={() => setJdMethod('text')} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${jdMethod === 'text' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}>
                Copy-Paste Text
              </button>
              <button type="button" onClick={() => setJdMethod('file')} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${jdMethod === 'file' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}>
                Upload Document File
              </button>
            </div>
          </div>

          {/* Render Option A: Text area input */}
          {jdMethod === 'text' ? (
            <div>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the core corporate job responsibilities, contextual scope framework, and tech stack qualifications parameters here..."
                rows={6}
                className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-sm resize-none"
              />
            </div>
          ) : (
            /* Render Option B: Document File Drop Zone */
            <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${jdFile ? 'border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/5' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500'}`}>
              <input type="file" accept=".pdf,.docx,.txt" onChange={handleJdFileChange} className="hidden" />
              {jdFile ? (
                <div className="text-center">
                  <FileCode className="mx-auto text-emerald-500 mb-2" size={36} />
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{jdFile.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{(jdFile.size / 1024 / 1024).toFixed(2)} MB • Linked</p>
                </div>
              ) : (
                <div className="text-center">
                  <FileText className="mx-auto text-slate-400 mb-2" size={36} />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Click or drag Job Specification sheet</p>
                  <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, or TXT formats</p>
                </div>
              )}
            </label>
          )}
        </div>

        {/* SUBMISSION ACTION CAP */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl disabled:opacity-50 transition shadow-md flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Executing Core Vector Cross-Matching...
            </>
          ) : (
            'Process Alignment Matrix'
          )}
        </button>
      </form>
    </div>
  );
}