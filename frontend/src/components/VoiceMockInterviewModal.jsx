import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X } from 'lucide-react';

export default function VoiceMockInterviewModal({ isOpen, onClose, question = "Tell me about a complex full-stack project you led." }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (err) => {
        console.error("Speech Recognition Error:", err);
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Try Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 p-6 rounded-2xl max-w-xl w-full shadow-2xl space-y-6">
        
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Volume2 className="text-indigo-400" size={20} />
            Voice Speech-to-Text Interviewer
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400 font-mono mb-1">CURRENT QUESTION</p>
          <p className="text-sm font-semibold text-slate-200">{question}</p>
        </div>

        <div className="flex flex-col items-center justify-center py-4 space-y-3">
          <button
            onClick={toggleListening}
            className={`p-5 rounded-full transition shadow-xl ${
              isListening ? 'bg-rose-600 animate-pulse text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isListening ? <MicOff size={28} /> : <Mic size={28} />}
          </button>
          <span className="text-xs text-slate-400">
            {isListening ? 'Listening to speech input...' : 'Click mic to record spoken answer'}
          </span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 min-h-[100px] text-xs font-mono text-slate-300">
          {transcript || <span className="text-slate-600 italic">Transcribed speech will appear here live...</span>}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            Close Session
          </button>
        </div>

      </div>
    </div>
  );
}