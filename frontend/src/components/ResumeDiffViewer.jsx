import { useState } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import { Columns, Eye, Copy, Check } from 'lucide-react';

export default function ResumeDiffViewer({ originalText, optimizedText }) {
  const [copied, setCopied] = useState(false);
  const [splitView, setSplitView] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-slate-100">
            <Columns className="text-indigo-400" size={20} />
            AI Resume Optimization Diff
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Visual side-by-side comparison highlighting key structural and keyword enhancements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSplitView(!splitView)}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Eye size={14} />
            {splitView ? 'Unified View' : 'Split View'}
          </button>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1.5"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Optimized'}
          </button>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-800 text-xs font-mono">
        <ReactDiffViewer
          oldValue={originalText || "No original text recorded."}
          newValue={optimizedText || "No optimized text generated."}
          splitView={splitView}
          compareMethod={DiffMethod.WORDS}
          useDarkTheme={true}
          styles={{
            variables: {
              dark: {
                diffViewerBackground: '#020617',
                addedBackground: '#022c22',
                addedColor: '#4ade80',
                removedBackground: '#450a0a',
                removedColor: '#f87171',
                wordAdded: '#15803d',
                wordRemoved: '#991b1b',
              },
            },
          }}
        />
      </div>
    </div>
  );
}