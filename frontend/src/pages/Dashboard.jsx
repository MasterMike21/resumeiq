import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, Plus } from 'lucide-react';

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReports(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div className="text-center mt-20 text-slate-500 dark:text-slate-400 animate-pulse">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review historical scan metrics and baseline tracking vectors.</p>
        </div>
        <Link to="/upload" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition shadow-md">
          <Plus size={18} /> New Analysis
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/50 rounded-2xl transition-colors">
          <FileText className="mx-auto text-slate-400 dark:text-slate-600 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No scanned resumes found</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6">Upload a document to generate an ATS compatibility assessment report.</p>
          <Link to="/upload" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl inline-block font-medium shadow-sm hover:bg-indigo-700">Upload Now</Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <div key={report._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md dark:hover:border-slate-700 transition flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-indigo-50 dark:bg-indigo-950/60 border border-transparent dark:border-indigo-900/50 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400"><FileText size={24} /></div>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${report.atsScore >= 75 ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-transparent dark:border-emerald-900/30' : report.atsScore >= 50 ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-transparent dark:border-amber-900/30' : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-transparent dark:border-rose-900/30'}`}>
                    {report.atsScore}%
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-full">{report.resume?.fileName}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Scanned: {new Date(report.createdAt).toLocaleDateString()}</p>
              </div>
              <Link to={`/result/${report._id}`} className="mt-6 flex items-center justify-between text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 border-t border-slate-100 dark:border-slate-800 pt-4">
                View Full Metrics Report <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}