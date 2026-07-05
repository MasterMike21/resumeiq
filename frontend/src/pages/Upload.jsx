import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Loader2 } from 'lucide-react';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files[0]?.type === 'application/pdf') {
      setFile(e.target.files[0]);
      setError('');
    } else {
      setError('Only PDF files are supported.');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please select a profile structural PDF.');

    const formData = new FormData();
    formData.append('resume', file);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/resume/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      navigate(`/result/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error parsing document structural metrics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-16 px-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Evaluate Structural Layout</h2>
        <p className="text-slate-500 mb-6">Upload your file structure template profile configuration in a clean raw structural layout text PDF formatting framework.</p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">{error}</div>}

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-indigo-500 transition cursor-pointer relative bg-slate-50">
            <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" disabled={loading} />
            <UploadCloud className="mx-auto text-slate-400 mb-3" size={40} />
            <p className="text-sm font-medium text-slate-700">{file ? file.name : "Click or drag your resume PDF layout profile structure configuration file here"}</p>
            <p className="text-xs text-slate-400 mt-1">Accepts only strict direct .pdf extension format layers</p>
          </div>

          <button type="submit" disabled={loading || !file} className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition disabled:bg-slate-300 flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/10">
            {loading ? <><Loader2 className="animate-spin" size={18} /> Processing Structural Analysis...</> : "Start Evaluation"}
          </button>
        </form>
      </div>
    </div>
  );
}