import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Volume2, Sparkles } from "lucide-react";
import { useSpeechRecognition, useSpeechSynthesis, processVoiceCommand } from "@/lib/voice";

export default function VoiceAssistant() {
  const { isListening, transcript, startListening, stopListening, isSupported, setTranscript } = useSpeechRecognition();
  const { speak } = useSpeechSynthesis();
  const [showStatus, setShowStatus] = useState(false);
  const [lastSpeech, setLastSpeech] = useState("");

  // 1. 🚀 Welcome Message: Screen click par trigger
  useEffect(() => {
    const welcomeMessage = "Welcome to Health Scan AI. Main aapka personal health coach hoon. Scan shuru karne ke liye body ya face scanner par click karein.";
    const handleInitialSpeak = () => {
      speak(welcomeMessage);
      document.removeEventListener('mousedown', handleInitialSpeak);
    };
    document.addEventListener('mousedown', handleInitialSpeak);
    return () => document.removeEventListener('mousedown', handleInitialSpeak);
  }, [speak]);

  // 2. ⚡ Automatic Report Speaker (Home.tsx se signal milte hi)
  useEffect(() => {
    const handleScanSpeech = (event: any) => {
      const message = event.detail.message;
      if (message) {
        setLastSpeech(message);
        speak(message);
        setShowStatus(true);
        
        // Timer ko 40 seconds rakha hai taki poora "Thank You" tak ka script cover ho sake
        const timer = setTimeout(() => setShowStatus(false), 40000); 
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener("scanComplete", handleScanSpeech);
    return () => window.removeEventListener("scanComplete", handleScanSpeech);
  }, [speak]);

  // 3. 🎙️ Manual Voice Commands Handling
  useEffect(() => {
    if (transcript) {
      const result = processVoiceCommand(transcript);
      speak(result.response);
      setShowStatus(true);
      
      if (result.action === 'view_history') {
        window.location.hash = "history";
      }

      // Command process hote hi transcript clear kar do (Writing hide karne ke liye)
      setTimeout(() => setTranscript(""), 300);
      const timer = setTimeout(() => setShowStatus(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [transcript, speak, setTranscript]);

  if (!isSupported) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      {/* 🎙️ Animated Mic Button */}
      <Button
        size="icon"
        className={`w-16 h-16 rounded-full shadow-3xl transition-all duration-500 border-2 ${
          isListening 
            ? 'bg-rose-600 border-rose-400 animate-pulse scale-110' 
            : 'bg-slate-900 border-white/10 hover:border-rose-500/50 hover:scale-110'
        }`}
        onClick={isListening ? stopListening : startListening}
      >
        {isListening ? (
          <MicOff className="text-white w-7 h-7" />
        ) : (
          <Mic className="text-white w-7 h-7" />
        )}
      </Button>

      {/* 💬 Glassmorphism AI Feedback Card */}
      {(isListening || showStatus) && (
        <Card className="absolute bottom-24 right-0 w-80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 bg-slate-950/90 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-500">
          <CardContent className="p-7">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {isListening ? "Listening..." : "AI Health Coach"}
                </span>
              </div>
              <Sparkles className="w-4 h-4 text-rose-500 opacity-50" />
            </div>
            
            {/* 🛑 Transcript text removed for clean look during speech */}
            <div className="space-y-4">
               {isListening ? (
                 <p className="text-sm font-bold text-slate-100 italic">"Listening to you..."</p>
               ) : (
                 <div className="flex items-center gap-3 text-rose-400">
                    <div className="p-2 bg-rose-500/10 rounded-xl">
                      <Volume2 className="w-5 h-5 animate-bounce" />
                    </div>
                    <span className="text-xs font-black italic tracking-tight uppercase">Assistant is speaking...</span>
                 </div>
               )}
            </div>

            {!isListening && showStatus && (
              <div className="mt-6 pt-4 border-t border-white/5">
                <p className="text-[9px] font-medium text-slate-500 uppercase tracking-widest leading-relaxed">
                  Analyzing markers, preparing diet plan, and checking precautions...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}