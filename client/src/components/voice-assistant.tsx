import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useSpeechRecognition, useSpeechSynthesis } from "@/lib/voice";

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isVoicePanelOpen, setIsVoicePanelOpen] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>("");
  const { toast } = useToast();
  
  const { startListening, stopListening, transcript, isSupported: speechSupported } = useSpeechRecognition();
  const { speak, cancel: cancelSpeech, isSupported: synthSupported } = useSpeechSynthesis();

  const ttsMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest('POST', '/api/text-to-speech', { text, voice: 'alloy' });
      return response.blob();
    },
    onSuccess: (audioBlob) => {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play().catch(console.error);
    },
    onError: (error) => {
      // Fallback to browser speech synthesis
      speak("Sorry, I encountered an error with the voice system. Please try again.");
      console.error("TTS error:", error);
    },
  });

  const handleVoiceToggle = () => {
    if (!speechSupported) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      startListening();
      setIsListening(true);
      setIsVoicePanelOpen(true);
    }
  };

  const handleVoiceCommand = (command: string) => {
    setLastCommand(command);
    
    // Process voice commands
    const lowerCommand = command.toLowerCase();
    let response = "";

    if (lowerCommand.includes("nutrition") || lowerCommand.includes("body scan")) {
      response = "Starting nutrition analysis. Please position yourself in front of the camera.";
      // Trigger nutrition scan
    } else if (lowerCommand.includes("acne") || lowerCommand.includes("face scan")) {
      response = "Starting acne analysis. Please position your face in front of the camera.";
      // Trigger acne scan
    } else if (lowerCommand.includes("help")) {
      response = "I can help you start nutrition scans, acne analysis, or view your scan history. What would you like to do?";
    } else if (lowerCommand.includes("history")) {
      response = "Here are your recent scans and health reports.";
    } else {
      response = "I didn't understand that command. Try saying 'start nutrition scan' or 'help' for assistance.";
    }

    // Use OpenAI TTS if available, fallback to browser synthesis
    if (synthSupported) {
      ttsMutation.mutate(response);
    } else {
      speak(response);
    }
  };

  // Handle transcript changes
  if (transcript && transcript !== lastCommand) {
    handleVoiceCommand(transcript);
  }

  return (
    <>
      {/* Floating Voice Button */}
      <div className="fixed bottom-6 right-6 z-50 float">
        <Button
          size="icon"
          className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 breathe glow ${
            isListening ? 'bg-red-500 hover:bg-red-600 pulse-animation' : 'bg-primary hover:bg-primary/90'
          }`}
          onClick={handleVoiceToggle}
          data-testid="button-voice-toggle"
        >
          {isListening ? (
            <MicOff className="text-primary-foreground w-5 h-5 voice-wave" />
          ) : (
            <Mic className="text-primary-foreground w-5 h-5 heartbeat" />
          )}
        </Button>
        
        {/* Voice Panel */}
        {isVoicePanelOpen && (
          <Card className="absolute bottom-16 right-0 w-80 shadow-xl border scale-in bounce-in hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3 slide-in-left">
                <h4 className="font-medium text-card-foreground typewriter" data-testid="voice-panel-title">Voice Assistant</h4>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsVoicePanelOpen(false)}
                  className="hover-scale"
                  data-testid="button-close-voice-panel"
                >
                  <MicOff className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-center py-6 breathe">
                <div className="flex items-center space-x-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`w-3 rounded-full transition-all duration-300 ${
                        isListening ? 'bg-primary voice-wave glow' : 'bg-muted pulse-animation'
                      }`}
                      style={{
                        height: isListening ? `${Math.random() * 20 + 10}px` : '10px',
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="text-center fade-in">
                {isListening ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-2 typewriter" data-testid="voice-status-listening">
                      {transcript || "Listening..."}
                    </p>
                    <p className="text-xs text-muted-foreground slide-in-left stagger-1">Say "nutrition scan" or "acne analysis"</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-2 bounce-in" data-testid="voice-status-ready">
                      {lastCommand || "Ready to listen"}
                    </p>
                    <p className="text-xs text-muted-foreground slide-in-right stagger-1">Click the microphone to start</p>
                  </>
                )}
              </div>
              
              {ttsMutation.isPending && (
                <div className="mt-3 flex items-center justify-center space-x-2 scale-in">
                  <Volume2 className="h-4 w-4 text-primary voice-wave glow" />
                  <span className="text-sm text-muted-foreground shimmer" data-testid="tts-status">Speaking...</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
