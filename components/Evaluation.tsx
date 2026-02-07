import React, { useEffect, useState } from 'react';
import { RotateCcw, ArrowRight, Flame, Video, Mic, Eye, User, BarChart } from 'lucide-react';
import { SessionData, EvaluationMetrics } from '../types';
import { generateMultimodalEvaluation } from '../services/geminiService';

interface EvaluationProps {
  data: SessionData;
  onComplete: (score: number) => void;
  onRetry: () => void;
}

export const Evaluation: React.FC<EvaluationProps> = ({ data, onComplete, onRetry }) => {
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null);
  const [activeTab, setActiveTab] = useState<'verbal' | 'visual'>('verbal');

  useEffect(() => {
    generateMultimodalEvaluation(data.messages).then(setMetrics);
  }, []);

  if (!metrics) return <div className="h-screen bg-slate-900 flex items-center justify-center"><div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div>;

  const isPerfect = metrics.score === 100;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 py-10 px-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Summary */}
        <div className="text-center mb-10">
           <h1 className="text-3xl font-bold mb-2">360° Performance Report</h1>
           <div className={`text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r ${isPerfect ? 'from-amber-300 to-orange-500' : 'from-brand-400 to-cyan-400'}`}>
             {metrics.score}
           </div>
           <p className="text-slate-400 text-sm mt-2 uppercase tracking-widest font-bold">Total Score</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8 bg-slate-800 p-1 rounded-xl w-fit mx-auto border border-slate-700">
           <button 
             onClick={() => setActiveTab('verbal')}
             className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${activeTab === 'verbal' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
           >
             <Mic size={18} /> Verbal
           </button>
           <button 
             onClick={() => setActiveTab('visual')}
             className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${activeTab === 'visual' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
           >
             <Video size={18} /> Visual
           </button>
        </div>

        {/* Content Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           
           {/* Left Col: AI Summary (Always Visible) */}
           <div className="md:col-span-1 space-y-4">
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                 <h3 className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3">Coach Sentiment</h3>
                 <p className="text-slate-300 text-sm leading-relaxed">{metrics.feedbackSummary}</p>
              </div>
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex items-center justify-between">
                 <span className="text-sm font-bold text-slate-400">Fillers</span>
                 <span className="text-xl font-bold text-white">{data.fillerWordsCount}</span>
              </div>
           </div>

           {/* Right Col: Tabbed Metrics */}
           <div className="md:col-span-2">
              
              {activeTab === 'verbal' && (
                <div className="space-y-4 animate-fade-in">
                   <h3 className="font-bold text-slate-300">Transcript Analysis</h3>
                   {metrics.mistakes.length === 0 ? (
                     <div className="p-4 bg-emerald-900/30 border border-emerald-500/30 text-emerald-300 rounded-xl text-center">
                        Perfect Grammar!
                     </div>
                   ) : (
                     metrics.mistakes.map((m, i) => (
                       <div key={i} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                          <div className="flex flex-col sm:flex-row gap-2 mb-2 text-sm">
                             <span className="text-red-400 line-through">"{m.original}"</span>
                             <ArrowRight size={14} className="text-slate-500 hidden sm:block mt-1" />
                             <span className="text-emerald-400 font-bold">"{m.correction}"</span>
                          </div>
                          <p className="text-xs text-slate-500 italic">{m.explanation}</p>
                       </div>
                     ))
                   )}
                </div>
              )}

              {activeTab === 'visual' && (
                <div className="space-y-6 animate-fade-in">
                   
                   {/* Eye Contact Heatmap Simulation */}
                   <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                      <div className="flex justify-between mb-4">
                         <div className="flex items-center gap-2 text-slate-200 font-bold"><Eye size={18} className="text-cyan-400" /> Eye Contact</div>
                         <span className="text-2xl font-bold text-cyan-400">{data.visuals.eyeContactScore}%</span>
                      </div>
                      
                      {/* Bar Graphic */}
                      <div className="h-8 w-full flex rounded-md overflow-hidden opacity-80">
                         {data.visuals.eyeContactTimeline.map((looked, i) => (
                           <div key={i} className={`flex-1 ${looked ? 'bg-cyan-500' : 'bg-slate-700'}`} title={looked ? 'Focused' : 'Looked Away'} />
                         ))}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-slate-500">
                         <span>Start</span>
                         <span>End</span>
                      </div>
                   </div>

                   {/* Posture & Sentiment */}
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 text-center">
                         <User size={24} className="mx-auto mb-2 text-purple-400" />
                         <div className="text-2xl font-bold">{data.visuals.postureScore}%</div>
                         <div className="text-xs text-slate-400 uppercase">Posture</div>
                      </div>
                      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 text-center">
                         <BarChart size={24} className="mx-auto mb-2 text-pink-400" />
                         <div className="text-lg font-bold">{data.visuals.sentiment}</div>
                         <div className="text-xs text-slate-400 uppercase">Vibe</div>
                      </div>
                   </div>
                </div>
              )}
           </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-10 flex gap-4">
           {!isPerfect && (
             <button onClick={onRetry} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-slate-300 border border-slate-600 transition-all flex justify-center gap-2">
               <RotateCcw /> Retry
             </button>
           )}
           <button onClick={() => onComplete(metrics.score)} className="flex-1 py-4 bg-brand-600 hover:bg-brand-500 rounded-xl font-bold text-white shadow-lg shadow-brand-500/20 transition-all flex justify-center gap-2">
             Continue <ArrowRight />
           </button>
        </div>

      </div>
    </div>
  );
};