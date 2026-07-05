import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, AlertTriangle, Briefcase, Award, Printer } from 'lucide-react';

export default function Result() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/resume/report/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReport(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) return <div className="text-center mt-20 text-slate-500">Compiling structural matrix layers...</div>;
  if (!report) return <div className="text-center mt-20 text-red-500">Report details processing fault payload.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 print:p-0 print:bg-white">
      <div className="flex justify-between items-center border-b border-slate-200 pb-6 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analysis Breakdown</h1>
          <p className="text-slate-500 mt-1">File Target: {report.resume?.fileName}</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 border border-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition shadow-sm">
          <Printer size={16} /> Print Report
        </button>
      </div>

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

      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><Briefcase className="text-emerald-600" size={20} /> Recommended Path Blueprints</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {report.recommendedRoles?.map((role, idx) => (
            <div key={idx} className="border border-slate-100 bg-slate-50/50 px-4 py-3 rounded-xl text-sm font-medium text-slate-800">{role}</div>
          ))}
        </div>
      </div>
    </div>
  );
}