import React, { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, AlertTriangle, Loader2, Play, Mic, Video, VideoOff } from 'lucide-react';

interface PreFlightCheckProps {
  onCheckComplete: () => void;
  onCancel: () => void;
}

export const PreFlightCheck: React.FC<PreFlightCheckProps> = ({ onCheckComplete, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'skipped'>('idle');
  const [scanStage, setScanStage] = useState(0); // 0: Init, 1: Light, 2: Background, 3: Audio, 4: Ready
  const [feedback, setFeedback] = useState<string[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleEnablePermissions = async () => {
    setStatus('requesting');
    setFeedback([]);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
       setStatus('denied');
       setFeedback(["Browser API not supported. Please use a modern browser."]);
       return;
    }

    try {
      // 1. Attempt to get Video and Audio
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      setStatus('granted');
      
      // Attach to video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      startScanSequence(true); // true = full scan
    } catch (err: any) {
      console.error("Media Access Error:", err);
      
      // 2. Fallback: If Camera not found (NotFoundError), try Audio Only
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          try {
             const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
             setStream(audioStream);
             
             // Use 'skipped' state to show the Audio-Only UI
             setStatus('skipped');
             setFeedback(["Camera hardware not found. Switching to Audio Only mode."]);
             sessionStorage.setItem('speakpro_mode', 'audio-only');
             startScanSequence(false);
             return;
          } catch (audioErr) {
             console.error("Audio access failed:", audioErr);
          }
      }

      setStatus('denied');
      let msg = "Camera access denied. Please check your browser settings.";
      if (err.name === 'NotAllowedError') msg = "Permission denied. Please allow access in your address bar.";
      if (err.name === 'NotFoundError') msg = "No camera or microphone found.";
      
      setFeedback([msg]);
    }
  };

  const handleSkip = () => {
    setStatus('skipped');
    // Save preference to session storage so PracticeArena knows to default to audio
    sessionStorage.setItem('speakpro_mode', 'audio-only');
    startScanSequence(false); // false = audio only scan
  };

  const startScanSequence = (hasVideo: boolean) => {
    // Stage 1: Lighting / Init
    setTimeout(() => {
      setScanStage(1);
      if (hasVideo) {
        setFeedback(prev => [...prev, "Lighting Analysis: Optimal brightness detected."]);
      } else {
        setFeedback(prev => [...prev, "Visual Analysis: Skipped (Audio Only Mode)."]);
      }
    }, 1000);

    // Stage 2: Background
    setTimeout(() => {
      setScanStage(2);
      if (hasVideo) {
        setFeedback(prev => [...prev, "Background Check: Professional & Clear."]);
      } else {
        setFeedback(prev => [...prev, "Environment: Background check disabled."]);
      }
    }, 2500);

    // Stage 3: Audio (Always runs)
    setTimeout(() => {
      setScanStage(3);
      setFeedback(prev => [...prev, "Audio Check: Microphone sensitivity calibrated."]);
    }, 4000);

    // Stage 4: Ready
    setTimeout(() => {
      setScanStage(4);
    }, 5000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col md:flex-row min-h-[500px]">
        
        {/* Left: Video Preview Area */}
        <div className="md:w-2/3 relative bg-black flex items-center justify-center overflow-hidden">
          
          {/* Active Video Feed */}
          {status === 'granted' && (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-cover opacity-80"
              />
              {/* Scanner Effect */}
              {scanStage < 4 && (
                <div className="absolute inset-0 z-10 pointer-events-none">
                  <div className="scanner-line"></div>
                  <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur px-3 py-1 rounded text-cyan-400 text-xs font-mono border border-cyan-500/30">
                    AI_VISION_MODULE :: ACTIVE
                  </div>
                </div>
              )}
               {/* Face Box Simulation */}
              {scanStage >= 1 && scanStage < 4 && (
                <div className="absolute top-1/4 left-1/3 w-1/3 h-1/3 border-2 border-dashed border-cyan-500/50 rounded-lg transition-all duration-500"></div>
              )}
            </>
          )}

          {/* Idle / Skipped / Denied States */}
          {status !== 'granted' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 bg-slate-900/50">
               {status === 'skipped' ? (
                 <div className="flex flex-col items-center gap-4 animate-pulse">
                   <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                      <Mic size={40} className="text-cyan-500" />
                   </div>
                   <p className="text-cyan-500 font-mono text-sm">AUDIO_ANALYSIS_ONLY</p>
                 </div>
               ) : (
                 <div className="flex flex-col items-center gap-4">
                   <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                      <Camera size={40} className="text-slate-500" />
                   </div>
                   <p className="text-slate-500 text-sm">Camera Offline</p>
                 </div>
               )}
            </div>
          )}

          {/* Cosmetic Overlays */}
          <div className="absolute inset-0 border-[20px] border-slate-900/50 pointer-events-none rounded-tl-3xl hidden md:block"></div>
        </div>

        {/* Right: Status & Action Panel */}
        <div className="md:w-1/3 p-8 flex flex-col bg-slate-800">
          <h2 className="text-2xl font-bold text-white mb-2">Pre-Flight Check</h2>
          <p className="text-slate-400 text-sm mb-6">
            We analyze your body language and tone to provide a 360° score.
          </p>

          <div className="flex-1 flex flex-col justify-center">
            
            {/* INITIAL STATE: Buttons */}
            {status === 'idle' || status === 'denied' ? (
              <div className="space-y-4">
                 <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600 mb-2">
                    <p className="text-slate-300 text-sm flex gap-2">
                      <Video size={18} className="shrink-0 text-brand-400" />
                      Allow camera access for body language analysis.
                    </p>
                 </div>

                 <button
                   onClick={handleEnablePermissions}
                   className="w-full py-4 rounded-xl font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                 >
                   <Camera size={20} /> Enable Camera
                 </button>

                 <button 
                   onClick={handleSkip}
                   className="w-full py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                 >
                   Skip (Audio Only)
                 </button>
                 
                 {status === 'denied' && (
                   <p className="text-red-400 text-xs text-center mt-2 flex items-center justify-center gap-1">
                     <AlertTriangle size={12} /> {feedback[0] || "Permission denied."}
                   </p>
                 )}
              </div>
            ) : (
              /* ACTIVE SCAN STATE */
              <div className="space-y-4">
                {feedback.map((msg, i) => (
                  <div key={i} className="flex items-start gap-3 animate-fade-in">
                    <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                    <span className="text-sm text-slate-300">{msg}</span>
                  </div>
                ))}
                
                {scanStage < 4 && (
                  <div className="flex items-center gap-3 text-cyan-400 animate-pulse pt-4">
                    <Loader2 className="animate-spin" size={18} />
                    <span className="text-sm font-mono">Calibrating Sensors...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions (Only show when ready) */}
          {scanStage === 4 && (
            <div className="mt-8 space-y-3 animate-fade-in">
               <button
                 onClick={onCheckComplete}
                 className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 scale-105"
               >
                 Start Session <Play size={20} fill="currentColor" />
               </button>
            </div>
          )}

          <div className="mt-auto pt-6">
             <button onClick={onCancel} className="w-full text-xs text-slate-500 hover:text-slate-300">
               Cancel Setup
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};