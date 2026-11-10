/**
 * AgroScan AI - Bidirectional Web Speech Assistant Hook.
 *
 * Implements browser-native SpeechRecognition (STT) and SpeechSynthesis (TTS)
 * for hands-free agronomic dictation and automated diagnostic narration
 * without external audio API dependencies.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AudioSpeechManager } from '../services/AudioSpeechManager';

export interface VoiceAssistantOptions {
  preferredLang?: 'es-CO' | 'es-ES' | 'en-US' | string;
  autoSelectVoice?: boolean;
  rate?: number;
  pitch?: number;
}

export interface UseVoiceAssistantReturn {
  // Speech Recognition (Speech to Text)
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  recognitionError: string | null;
  startListening: (onResult?: (text: string) => void) => void;
  stopListening: () => void;
  clearTranscript: () => void;
  isRecognitionSupported: boolean;

  // Speech Synthesis (Text to Speech)
  isSpeaking: boolean;
  speak: (
    text: string,
    options?: {
      lang?: string;
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
    }
  ) => void;
  stopSpeaking: () => void;
  isSynthesisSupported: boolean;
  availableVoices: SpeechSynthesisVoice[];
}

/**
 * Strips markdown formatting characters (*, #, _, `, [, ], etc.)
 * to produce clean, natural-sounding acoustic narration.
 */
export const cleanMarkdownForSpeech = (text: string): string => {
  return AudioSpeechManager.getInstance().cleanText(text);
};

export const useVoiceAssistant = (
  options: VoiceAssistantOptions = {}
): UseVoiceAssistantReturn => {
  let activeLanguage = 'es';
  try {
    const langContext = useLanguage();
    if (langContext && langContext.language) {
      activeLanguage = langContext.language;
    }
  } catch {
    // If used outside LanguageProvider, default to Spanish
    activeLanguage = 'es';
  }

  const defaultLangCode =
    options.preferredLang || (activeLanguage === 'en' ? 'en-US' : 'es-CO');

  // Speech Recognition States
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  // Speech Synthesis States
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Refs for tracking active audio instances across re-renders
  const recognitionRef = useRef<any>(null);
  const onResultCallbackRef = useRef<((text: string) => void) | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isRecognitionSupported =
    typeof window !== 'undefined' &&
    Boolean(
      (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition
    );

  const isSynthesisSupported =
    typeof window !== 'undefined' && Boolean(window.speechSynthesis);

  // Load and cache voices when SpeechSynthesis is ready
  useEffect(() => {
    if (!isSynthesisSupported) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    updateVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (isSynthesisSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSynthesisSupported]);

  // Clean up recognition and synthesis on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore teardown errors
        }
      }
      if (isSynthesisSupported) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // Ignore cancel errors
        }
      }
    };
  }, [isSynthesisSupported]);

  // Start Speech Recognition
  const startListening = useCallback(
    (onResult?: (text: string) => void) => {
      if (!isRecognitionSupported) {
        setRecognitionError(
          activeLanguage === 'en'
            ? 'Voice dictation is not supported in this browser. Please use Chrome, Edge, or Safari.'
            : 'El reconocimiento de voz no es compatible con este navegador. Por favor use Chrome, Edge o Safari.'
        );
        return;
      }

      // Stop any existing instance or speech synthesis before recording
      if (isSpeaking && isSynthesisSupported) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
      }

      onResultCallbackRef.current = onResult || null;
      setRecognitionError(null);
      setInterimTranscript('');

      try {
        const SpeechRecognitionConstructor =
          (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognitionConstructor();

        recognition.lang = defaultLangCode;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setRecognitionError(null);
        };

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          let finalResult = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcriptChunk = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalResult += transcriptChunk;
            } else {
              currentInterim += transcriptChunk;
            }
          }

          if (currentInterim) {
            setInterimTranscript(currentInterim);
          }

          if (finalResult) {
            const trimmed = finalResult.trim();
            setTranscript(trimmed);
            setInterimTranscript('');
            if (onResultCallbackRef.current) {
              onResultCallbackRef.current(trimmed);
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('SpeechRecognition error notice:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setRecognitionError(
              activeLanguage === 'en'
                ? 'Microphone access denied. Please permit microphone permissions.'
                : 'Permiso de micrófono denegado. Permita el acceso en su navegador.'
            );
          } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
            setRecognitionError(`Recognition notice: ${event.error}`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        console.warn('Failed to start SpeechRecognition:', err);
        setIsListening(false);
        setRecognitionError(err?.message || 'Failed to start microphone listener');
      }
    },
    [defaultLangCode, isRecognitionSupported, isSpeaking, isSynthesisSupported, activeLanguage]
  );

  // Stop Speech Recognition
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
    setIsListening(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setRecognitionError(null);
  }, []);

  // Text to Speech
  const speak = useCallback(
    (
      text: string,
      callOptions: {
        lang?: string;
        rate?: number;
        pitch?: number;
        onStart?: () => void;
        onEnd?: () => void;
      } = {}
    ) => {
      if (!isSynthesisSupported) {
        console.warn('SpeechSynthesis is not supported in this environment');
        return;
      }

      // Stop any existing synthesis
      window.speechSynthesis.cancel();

      const cleanedText = cleanMarkdownForSpeech(text);
      if (!cleanedText) return;

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      const targetLang = callOptions.lang || defaultLangCode;
      utterance.lang = targetLang;
      utterance.rate = callOptions.rate ?? options.rate ?? 1.0;
      utterance.pitch = callOptions.pitch ?? options.pitch ?? 1.0;

      // Select optimal natural voice for the target language
      const voices =
        availableVoices.length > 0
          ? availableVoices
          : window.speechSynthesis.getVoices();

      if (voices && voices.length > 0) {
        const langPrefix = targetLang.slice(0, 2).toLowerCase();
        // Priority: Exact match -> Prefix match with natural/neural keywords -> Any prefix match
        const exactMatch = voices.find((v) => v.lang.toLowerCase() === targetLang.toLowerCase());
        const neuralMatch = voices.find(
          (v) =>
            v.lang.toLowerCase().startsWith(langPrefix) &&
            (v.name.toLowerCase().includes('natural') ||
              v.name.toLowerCase().includes('google') ||
              v.name.toLowerCase().includes('neural') ||
              v.name.toLowerCase().includes('online'))
        );
        const prefixMatch = voices.find((v) =>
          v.lang.toLowerCase().startsWith(langPrefix)
        );

        const chosenVoice = exactMatch || neuralMatch || prefixMatch;
        if (chosenVoice) {
          utterance.voice = chosenVoice;
        }
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        if (callOptions.onStart) {
          callOptions.onStart();
        }
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        activeUtteranceRef.current = null;
        if (callOptions.onEnd) {
          callOptions.onEnd();
        }
      };

      utterance.onerror = (e) => {
        // synthesis cancellation fires an 'interrupted' or 'canceled' error
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('SpeechSynthesis utterance notice:', e.error);
        }
        setIsSpeaking(false);
        activeUtteranceRef.current = null;
      };

      activeUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [availableVoices, defaultLangCode, isSynthesisSupported, options.pitch, options.rate]
  );

  const stopSpeaking = useCallback(() => {
    if (isSynthesisSupported) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    activeUtteranceRef.current = null;
  }, [isSynthesisSupported]);

  return {
    isListening,
    transcript,
    interimTranscript,
    recognitionError,
    startListening,
    stopListening,
    clearTranscript,
    isRecognitionSupported,
    isSpeaking,
    speak,
    stopSpeaking,
    isSynthesisSupported,
    availableVoices,
  };
};

export default useVoiceAssistant;
