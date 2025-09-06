import { useState, useEffect, useCallback, useRef } from 'react';

// Speech Recognition Hook
export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart + ' ';
          } else {
            interimTranscript += transcriptPart;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      console.warn('Speech Recognition not supported');
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening
  };
};

// Speech Synthesis Hook
export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true);
    } else {
      console.warn('Speech Synthesis not supported');
      setIsSupported(false);
    }
  }, []);

  const speak = useCallback((text: string, options: {
    voice?: SpeechSynthesisVoice;
    rate?: number;
    pitch?: number;
    volume?: number;
  } = {}) => {
    if (!isSupported || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.voice = options.voice || null;
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const cancel = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  const getVoices = useCallback((): SpeechSynthesisVoice[] => {
    if (!isSupported) return [];
    return window.speechSynthesis.getVoices();
  }, [isSupported]);

  return {
    isSpeaking,
    isSupported,
    speak,
    cancel,
    getVoices
  };
};

// Voice Command Processing
export const processVoiceCommand = (command: string): {
  action: string;
  parameters?: Record<string, any>;
  response: string;
} => {
  const lowerCommand = command.toLowerCase().trim();

  // Start nutrition scan
  if (lowerCommand.includes('nutrition') || lowerCommand.includes('body scan')) {
    return {
      action: 'start_nutrition_scan',
      response: 'Starting nutrition analysis. Please position yourself in front of the camera for a body scan.'
    };
  }

  // Start acne scan
  if (lowerCommand.includes('acne') || lowerCommand.includes('face scan') || lowerCommand.includes('skin')) {
    return {
      action: 'start_acne_scan',
      response: 'Starting acne analysis. Please position your face clearly in front of the camera.'
    };
  }

  // View history
  if (lowerCommand.includes('history') || lowerCommand.includes('previous') || lowerCommand.includes('past')) {
    return {
      action: 'view_history',
      response: 'Here are your recent health scans and analysis results.'
    };
  }

  // Help command
  if (lowerCommand.includes('help') || lowerCommand.includes('what can you do')) {
    return {
      action: 'help',
      response: 'I can help you start nutrition scans by saying "nutrition scan", acne analysis by saying "face scan", or view your scan history by saying "show history". What would you like to do?'
    };
  }

  // Stop command
  if (lowerCommand.includes('stop') || lowerCommand.includes('cancel')) {
    return {
      action: 'stop',
      response: 'Stopping current operation.'
    };
  }

  // Default response
  return {
    action: 'unknown',
    response: 'I didn\'t understand that command. Try saying "nutrition scan", "face scan", "show history", or "help" for assistance.'
  };
};
