import React, { useState } from 'react';
import { ViewState, LevelNode, SessionData, Difficulty } from './types';
import { Login } from './components/Login';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { PreFlightCheck } from './components/PreFlightCheck';
import { PracticeArena } from './components/PracticeArena';
import { Evaluation } from './components/Evaluation';

// Mock Level Generator based on Difficulty
const generateLevels = (difficulty: Difficulty): LevelNode[] => {
  const contextMap = {
    [Difficulty.BEGINNER]: 'Focus on clear enunciation and steady eye contact.',
    [Difficulty.INTERMEDIATE]: 'Use hand gestures naturally. Maintain professional posture.',
    [Difficulty.PRO]: 'Command the room. Use silence for emphasis.',
  };

  return [
    { id: '1', day: 1, title: 'The Introduction', description: 'Introduce yourself confidently.', difficulty, isLocked: false, isCompleted: false, promptContext: `You are at a networking event. ${contextMap[difficulty]}` },
    { id: '2', day: 2, title: 'Expressing Opinion', description: 'Share your thoughts on a recent trend.', difficulty, isLocked: true, isCompleted: false, promptContext: `A colleague asks for your view on remote work. ${contextMap[difficulty]}` },
    { id: '3', day: 3, title: 'Handling Conflict', description: 'Politely disagree with someone.', difficulty, isLocked: true, isCompleted: false, promptContext: `Your manager suggests an unrealistic deadline. ${contextMap[difficulty]}` },
    { id: '4', day: 4, title: 'The Pitch', description: 'Sell an idea in 60 seconds.', difficulty, isLocked: true, isCompleted: false, promptContext: `Elevator pitch to a potential investor. ${contextMap[difficulty]}` },
    { id: '5', day: 5, title: 'Final Challenge', description: 'Address a large audience.', difficulty, isLocked: true, isCompleted: false, promptContext: `Keynote speech opening. ${contextMap[difficulty]}` },
  ];
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.LOGIN);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.BEGINNER);
  const [levels, setLevels] = useState<LevelNode[]>([]);
  const [streak, setStreak] = useState(0);
  
  const [activeLevel, setActiveLevel] = useState<LevelNode | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  const handleLogin = () => {
    setCurrentView(ViewState.ONBOARDING);
  };

  const handleOnboardingComplete = (selectedDiff: Difficulty) => {
    setDifficulty(selectedDiff);
    setLevels(generateLevels(selectedDiff));
    setCurrentView(ViewState.DASHBOARD);
  };

  const handleSelectLevel = (level: LevelNode) => {
    setActiveLevel(level);
    setCurrentView(ViewState.PREFLIGHT); // Go to Pre-Flight first
  };
  
  const handlePreFlightComplete = () => {
    setCurrentView(ViewState.PRACTICE);
  };

  const handleEndSession = (data: SessionData) => {
    setSessionData(data);
    setCurrentView(ViewState.EVALUATION);
  };

  const handleEvaluationComplete = (score: number) => {
    if (score === 100) {
      setStreak(prev => prev + 1);
    }
    
    if (score >= 80 && activeLevel) {
       setLevels(prev => {
         const idx = prev.findIndex(l => l.id === activeLevel.id);
         const newLevels = [...prev];
         newLevels[idx] = { ...newLevels[idx], isCompleted: true, score };
         if (idx + 1 < newLevels.length) {
           newLevels[idx + 1] = { ...newLevels[idx + 1], isLocked: false };
         }
         return newLevels;
       });
    }

    setSessionData(null);
    setActiveLevel(null);
    setCurrentView(ViewState.DASHBOARD);
  };

  const handleRetry = () => {
    setCurrentView(ViewState.DASHBOARD);
    setTimeout(() => {
        // Skip pre-flight on retry for speed? Or enforce it? Let's skip for UX speed.
        setCurrentView(ViewState.PRACTICE)
    }, 50);
  };

  return (
    <div className="h-full font-sans">
      {currentView === ViewState.LOGIN && (
        <Login onLogin={handleLogin} />
      )}

      {currentView === ViewState.ONBOARDING && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      {currentView === ViewState.DASHBOARD && (
        <Dashboard 
          levels={levels} 
          streak={streak} 
          difficulty={difficulty}
          onSelectLevel={handleSelectLevel} 
          onLogout={() => setCurrentView(ViewState.LOGIN)} 
        />
      )}

      {currentView === ViewState.PREFLIGHT && (
        <PreFlightCheck 
          onCheckComplete={handlePreFlightComplete}
          onCancel={() => { setActiveLevel(null); setCurrentView(ViewState.DASHBOARD); }}
        />
      )}

      {currentView === ViewState.PRACTICE && activeLevel && (
        <PracticeArena 
          level={activeLevel} 
          onEndSession={handleEndSession} 
          onBack={() => { setActiveLevel(null); setCurrentView(ViewState.DASHBOARD); }}
        />
      )}

      {currentView === ViewState.EVALUATION && sessionData && (
        <Evaluation 
          data={sessionData}
          onComplete={handleEvaluationComplete}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
};

export default App;