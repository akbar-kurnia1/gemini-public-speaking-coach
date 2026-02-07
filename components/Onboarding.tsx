import React from 'react';
import { Shield, Briefcase, Zap, CheckCircle2 } from 'lucide-react';
import { Difficulty } from '../types';

interface OnboardingProps {
  onComplete: (difficulty: Difficulty) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Choose Your Path</h1>
          <p className="text-slate-500 text-lg">Select a difficulty to tailor your daily speaking journey.</p>
        </div>

        <div className="grid gap-4">
          {/* Beginner */}
          <button 
            onClick={() => onComplete(Difficulty.BEGINNER)}
            className="group relative bg-white p-6 rounded-2xl border-2 border-slate-100 hover:border-emerald-500 transition-all duration-200 text-left hover:shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                <Shield size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Foundation</h3>
                <p className="text-slate-500 text-sm mt-1">Daily conversations, Introductions, Small Talk.</p>
              </div>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500">
                <CheckCircle2 size={24} />
              </div>
            </div>
          </button>

          {/* Intermediate */}
          <button 
            onClick={() => onComplete(Difficulty.INTERMEDIATE)}
            className="group relative bg-white p-6 rounded-2xl border-2 border-slate-100 hover:border-brand-500 transition-all duration-200 text-left hover:shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-brand-100 text-brand-600 rounded-xl group-hover:scale-110 transition-transform">
                <Briefcase size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Professional</h3>
                <p className="text-slate-500 text-sm mt-1">Job Interviews, Meetings, Presentations.</p>
              </div>
               <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-brand-500">
                <CheckCircle2 size={24} />
              </div>
            </div>
          </button>

          {/* Pro */}
          <button 
            onClick={() => onComplete(Difficulty.PRO)}
            className="group relative bg-white p-6 rounded-2xl border-2 border-slate-100 hover:border-accent-500 transition-all duration-200 text-left hover:shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-accent-100 text-accent-600 rounded-xl group-hover:scale-110 transition-transform">
                <Zap size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Mastery</h3>
                <p className="text-slate-500 text-sm mt-1">Debates, Crisis Management, Keynotes.</p>
              </div>
               <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-accent-500">
                <CheckCircle2 size={24} />
              </div>
            </div>
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Note: Changing this path later will reset your streak.
        </p>
      </div>
    </div>
  );
};