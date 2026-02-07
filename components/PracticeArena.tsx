import React, { useState, useEffect, useRef } from 'react';
import { Mic, ArrowLeft, Video, Eye, ShieldCheck, Activity } from 'lucide-react';
import { LevelNode, ChatMessage, SessionData, VisualMetrics } from '../types';
import { generateAIResponse } from '../services/geminiService';

interface PracticeArenaProps {
  level: LevelNode;
  onEndSession: (data: SessionData) => void;
  onBack: () => void;
}

export const PracticeArena: React.FC<PracticeArenaProps> = ({ level, onEndSession, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Real-time Metrics
  const [fillerWordCount, setFillerWordCount] = useState(0);
  const [eyeContactData, setEyeContactData] = useState<boolean[]>([]);
  const [postureWarning, setPostureWarning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const sessionStartTime = useRef(Date.now());

  // Initialize Video
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false }) // Audio captured separately via speech API
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(err => console.error("Video Error", err));

    // Initial Greeting
    setMessages([{
      id: 'init',
      sender: 'ai',
      text: `(Video Feed Active) Welcome. ${level.promptContext} Stand tall.`,
      timestamp: new Date()
    }]);

    // Mock Sentinel Analysis Loop
    const sentinelInterval = setInterval(() => {
       // Randomly mock eye contact status
       const lookingAtCamera = Math.random() > 0.2;
       setEyeContactData(prev => [...prev, lookingAtCamera]);

       // Randomly mock posture warning
       if (Math.random() > 0.95) {
         setPostureWarning(true);
         setTimeout(() => setPostureWarning(false), 3000);
       }
    }, 2000);

    return () => clearInterval(sentinelInterval);
  }, [level]);

  // Speech API Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleUserSpeech(transcript);
      };
      
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      if (recognitionRef.current) {
        recognitionRef.current.start();
      } else {
        // Fallback simulation
        setTimeout(() => {
          handleUserSpeech("I believe that, um, our strategy is effectively sound.");
          setIsListening(false);
        }, 2000);
      }
    }
  };

  const handleUserSpeech = async (text: string) => {
    const fillers = (text.match(/\b(um|uh|like)\b/gi) || []).length;
    setFillerWordCount(prev => prev + fillers);

    const newUserMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, newUserMsg]);
    setIsProcessing(true);

    const aiText = await generateAIResponse(messages, text, level);
    
    const newAiMsg: ChatMessage = { id: (Date.now()+1).toString(), sender: 'ai', text: aiText, timestamp: new Date() };
    setMessages(prev => [...prev, newAiMsg]);
    setIsProcessing(false);
  };

  const finishSession = () => {
    // Calculate final metrics
    const trueEyeContact = eyeContactData.filter(Boolean).length;
    const eyeScore = Math.round((trueEyeContact / Math.max(eyeContactData.length, 1)) * 100);
    
    const visuals: VisualMetrics = {
      eyeContactScore: eyeScore,
      postureScore: 85, // Mock average
      sentiment: 'Confident',
      eyeContactTimeline: eyeContactData
    };

    onEndSession({
      level,
      messages,
      fillerWordsCount: fillerWordCount,
      paceRating: 'Perfect', // Simplified for demo
      visuals
    });
  };

  return (
    <div className="h-screen bg-black flex flex-col md:flex-row relative overflow-hidden">
      
      {/* 1. Main Video Feed (Full Screen BG or Left Panel) */}
      <div className="flex-1 relative h-1/2 md:h-full bg-slate-900">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        
        {/* Sentinel Overlays */}
        <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg border border-cyan-500/30 text-cyan-400 text-xs font-mono">
          <ShieldCheck size={14} /> SENTINEL_AI :: ACTIVE
        </div>

        {postureWarning && (
          <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 bg-red-500/80 text-white px-4 py-2 rounded-full font-bold animate-bounce flex items-center gap-2">
             <Activity size={18} /> Fix Posture
          </div>
        )}

        {/* Face Box (Static Mock for Sentinel feel) */}
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border border-dashed border-white/20 rounded-xl pointer-events-none opacity-50">
           <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
           <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
           <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
           <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>
        </div>
      </div>

      {/* 2. Interaction Panel (Right) */}
      <div className="flex-1 md:max-w-md bg-slate-900 border-l border-slate-800 flex flex-col h-1/2 md:h-full relative z-20">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/90 backdrop-blur">
          <button onClick={onBack} className="text-slate-400 hover:text-white"><ArrowLeft size={24} /></button>
          <span className="font-bold text-slate-200">{level.title}</span>
          <button onClick={finishSession} className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-lg border border-red-500/50">END</button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-base ${msg.sender === 'user' ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-300 rounded-tl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isProcessing && <div className="text-slate-500 text-sm animate-pulse px-4">Coach is analyzing...</div>}
        </div>

        {/* Voice Control */}
        <div className="p-6 bg-slate-800/50 border-t border-slate-800 flex flex-col items-center justify-center relative">
          {/* Visualizer */}
          {isListening && (
             <div className="absolute top-0 w-full flex justify-center -mt-6">
                <div className="bg-slate-900 border border-slate-700 rounded-full px-4 py-1.5 flex gap-1 shadow-lg">
                   {[1,2,3,4,5].map(i => <div key={i} className="visualizer-bar h-4 w-1 bg-cyan-400"></div>)}
                </div>
             </div>
          )}

          <button 
            onClick={toggleListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl ${isListening ? 'bg-red-500 scale-110 shadow-red-500/50' : 'bg-brand-600 hover:bg-brand-500 shadow-brand-500/30'}`}
          >
            <Mic size={32} className="text-white" />
          </button>
          <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{isListening ? 'Listening' : 'Tap to Speak'}</p>
        </div>
      </div>
    </div>
  );
};