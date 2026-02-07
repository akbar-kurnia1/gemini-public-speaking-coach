import React from 'react';
import { Flame, Lock, Star, Mic, Video } from 'lucide-react';
import { LevelNode, Difficulty } from '../types';

interface DashboardProps {
  levels: LevelNode[];
  streak: number;
  difficulty: Difficulty;
  onSelectLevel: (level: LevelNode) => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ levels, streak, difficulty, onSelectLevel, onLogout }) => {
  
  // Helper to calculate winding path positions
  // We'll oscillate the x-position
  const getPosition = (index: number) => {
    const y = index * 120 + 80; // Vertical spacing
    const x = index % 2 === 0 ? 30 : 70; // 30% left, 70% right
    return { x, y };
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1e293b,transparent)] opacity-50 pointer-events-none" />

      {/* Gamified Header */}
      <header className="bg-slate-800/80 backdrop-blur border-b border-slate-700 sticky top-0 z-40 shadow-lg">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`
              w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-lg
              ${difficulty === Difficulty.BEGINNER ? 'bg-emerald-500' : ''}
              ${difficulty === Difficulty.INTERMEDIATE ? 'bg-brand-500' : ''}
              ${difficulty === Difficulty.PRO ? 'bg-purple-600' : ''}
            `}>
              {difficulty[0]}
            </div>
            <span className="font-bold text-slate-100 tracking-tight">SpeakPro</span>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600">
              <Flame 
                className={`${streak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-slate-500'}`} 
                size={18} 
              />
              <span className={`font-bold text-sm ${streak > 0 ? 'text-orange-400' : 'text-slate-500'}`}>
                {streak} Day Streak
              </span>
            </div>
            <button onClick={onLogout} className="text-xs font-medium text-slate-400 hover:text-white transition-colors">
              EXIT
            </button>
          </div>
        </div>
      </header>

      {/* Winding Road Path */}
      <main className="flex-1 max-w-md mx-auto w-full relative z-10 pb-24">
        
        {/* SVG Connector Line */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ minHeight: levels.length * 150 }}>
          <path
            d={`M ${getPosition(0).x}% ${getPosition(0).y} 
               ${levels.map((_, i) => {
                 if(i === 0) return '';
                 const prev = getPosition(i-1);
                 const curr = getPosition(i);
                 return `C ${prev.x}% ${prev.y + 60}, ${curr.x}% ${curr.y - 60}, ${curr.x}% ${curr.y}`;
               }).join(' ')}`}
            fill="none"
            stroke="#334155"
            strokeWidth="4"
            strokeDasharray="8 4"
            strokeLinecap="round"
          />
        </svg>

        {levels.map((level, index) => {
          const pos = getPosition(index);
          const isUnlocked = !level.isLocked;
          const isCompleted = level.isCompleted;

          return (
            <div 
              key={level.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pos.x}%`, top: pos.y }}
            >
              <button
                onClick={() => isUnlocked && onSelectLevel(level)}
                disabled={!isUnlocked}
                className={`
                  w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-2xl transition-all duration-300 relative group z-20
                  ${isCompleted 
                    ? 'bg-amber-400 border-amber-500 text-white shadow-amber-500/20' 
                    : !isUnlocked
                      ? 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed'
                      : 'bg-brand-600 border-cyan-400 text-white hover:scale-110 hover:shadow-cyan-400/40 cursor-pointer ring-4 ring-brand-900'
                  }
                `}
              >
                {isCompleted ? (
                  <Star size={32} fill="white" />
                ) : !isUnlocked ? (
                  <Lock size={24} />
                ) : (
                  <Video size={32} className="text-white animate-pulse" />
                )}

                {/* Level Label */}
                <div className={`
                  absolute top-full mt-4 bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl shadow-xl whitespace-nowrap z-30
                  ${!isUnlocked ? 'opacity-50 grayscale' : 'opacity-100'}
                `}>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-0.5">Day {level.day}</span>
                    <span className="text-sm font-bold text-white">{level.title}</span>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </main>
    </div>
  );
};