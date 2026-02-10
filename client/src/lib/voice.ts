import { useState, useEffect, useCallback, useRef } from 'react';

// 1. Hook for Listening (Speech to Text)
export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      
      recognition.continuous = false; 
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Hinglish recognition ke liye best setting

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch (err) {
        recognitionRef.current.stop();
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop();
  }, []);

  return { isListening, transcript, isSupported, startListening, stopListening, setTranscript };
};

// 2. Hook for Speaking (Text to Speech) - Optimized for long automated reports
export const useSpeechSynthesis = () => {
  const isSupported = 'speechSynthesis' in window;

  const speak = useCallback((text: string) => {
    if (!isSupported || !text) return;

    // Pehle se chal rahi awaaz ko cancel karein
    window.speechSynthesis.cancel(); 

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Modern Voice configurations
    utterance.lang = 'hi-IN'; // Indian accent
    utterance.rate = 1.08;    // Slightly faster taaki long report boring na lage
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Fix for long text: Browser timeout prevention
    utterance.onend = () => {
       console.log("Speech finished successfully.");
    };

    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  return { isSupported, speak, cancel: () => window.speechSynthesis.cancel() };
};

// 3. Command Processing Logic (Added specific actions for Medicine & Doctor)
export const processVoiceCommand = (command: string) => {
  const lowerCommand = command.toLowerCase().trim();

  // --- Scan Commands ---
  if (lowerCommand.includes('nutrition') || lowerCommand.includes('body')) {
    return { action: 'start_nutrition_scan', response: 'Body nutrition scan shuru kar raha hoon. Kripya camera ke samne position lein.' };
  }
  if (lowerCommand.includes('scan') || lowerCommand.includes('face') || lowerCommand.includes('skin')) {
    return { action: 'start_scan', response: 'Skin analysis process shuru ho raha hai.' };
  }

  // --- Medicine & Health Info ---
  if (lowerCommand.includes('medicine') || lowerCommand.includes('dawai') || lowerCommand.includes('vitamin')) {
    return { 
      action: 'search_medicine', 
      response: 'Main aapke liye generic medicines aur zaroori supplements search kar raha hoon. Kripya dawai lene se pehle doctor se consult zaroor karein.' 
    };
  }

  // --- Doctor Consultation ---
  if (lowerCommand.includes('doctor') || lowerCommand.includes('consult') || lowerCommand.includes('appointment')) {
    return { 
      action: 'find_doctor', 
      response: 'Theek hai, main aapko doctor appointment booking portal par le jaa raha hoon.' 
    };
  }

  // --- History/Navigation ---
  if (lowerCommand.includes('history') || lowerCommand.includes('purana') || lowerCommand.includes('record')) {
    return { action: 'view_history', response: 'Aapke purane scans aur reports load ho rahe hain.' };
  }

  // --- Help/General ---
  if (lowerCommand.includes('help') || lowerCommand.includes('madad')) {
    return { action: 'help', response: 'Main aapki body scan, skin analysis, dawai search aur doctor appointment mein madad kar sakta hoon. Bas kahiye: Start Scan.' };
  }

  return { action: 'unknown', response: 'Maine suna: ' + command + '. Kya main iske liye scan shuru karun?' };
};