/**
 * AgroScan AI - Audio Speech Manager (Web Audio & Speech API).
 *
 * Implements an Object-Oriented Singleton pattern encapsulating Web Speech Recognition (STT)
 * and Speech Synthesis (TTS). Provides asynchronous promise-based speech capture,
 * natural acoustic narration, voice selection, and lifecycle cancellation.
 */

export interface SpeechListenOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  timeoutMs?: number;
  onInterimResult?: (interimText: string) => void;
}

export interface SpeechNarrateOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export class AudioSpeechManager {
  private static instance: AudioSpeechManager | null = null;

  private recognitionInstance: any = null;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isListeningActive: boolean = false;
  private isSpeakingActive: boolean = false;

  private constructor() {
    this.initVoices();
  }

  /**
   * Singleton accessor.
   */
  public static getInstance(): AudioSpeechManager {
    if (!AudioSpeechManager.instance) {
      AudioSpeechManager.instance = new AudioSpeechManager();
    }
    return AudioSpeechManager.instance;
  }

  /**
   * Checks browser support for Web Speech Recognition.
   */
  public isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  /**
   * Checks browser support for Web Speech Synthesis.
   */
  public isSynthesisSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  }

  /**
   * Caches available browser speech synthesis voices.
   */
  private initVoices(): void {
    if (this.isSynthesisSupported()) {
      const loadVoices = () => {
        this.voices = window.speechSynthesis.getVoices();
      };
      loadVoices();
      if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }

  /**
   * Returns list of loaded SpeechSynthesisVoice objects.
   */
  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && this.isSynthesisSupported()) {
      this.voices = window.speechSynthesis.getVoices();
    }
    return this.voices;
  }

  /**
   * Resolves the most appropriate voice for a given language code.
   */
  public resolveVoice(langCode: string): SpeechSynthesisVoice | undefined {
    const voices = this.getAvailableVoices();
    const cleanCode = langCode.toLowerCase().replace('_', '-');

    // 1. Exact match (e.g., 'es-CO' or 'es-ES')
    let match = voices.find((v) => v.lang.toLowerCase().replace('_', '-') === cleanCode);
    if (match) return match;

    // 2. Prefix match (e.g., 'es')
    const primary = cleanCode.split('-')[0];
    match = voices.find((v) => v.lang.toLowerCase().startsWith(primary));
    if (match) return match;

    return voices[0];
  }

  /**
   * Strips markdown formatting to produce clean acoustic narration.
   */
  public cleanText(text: string): string {
    if (!text) return '';
    return text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[#*_~>]/g, ' ')
      .replace(/^\s*[-+*]\s+/gm, ' ')
      .replace(/^\s*\d+\.\s+/gm, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Listens for user spoken input and resolves with the transcribed text.
   */
  public async listen(options: SpeechListenOptions = {}): Promise<string> {
    if (!this.isRecognitionSupported()) {
      throw new Error('SpeechRecognition API is not supported in this browser.');
    }

    // Cancel existing listening if running
    this.stopListening();

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    this.recognitionInstance = recognition;

    recognition.lang = options.lang || 'es-CO';
    recognition.continuous = options.continuous ?? false;
    recognition.interimResults = options.interimResults ?? true;
    recognition.maxAlternatives = 1;

    return new Promise<string>((resolve, reject) => {
      let finalTranscript = '';
      const timeoutMs = options.timeoutMs ?? 15000;
      const timeoutTimer = setTimeout(() => {
        this.stopListening();
        if (finalTranscript.trim()) {
          resolve(finalTranscript.trim());
        } else {
          reject(new Error('Listening session timed out.'));
        }
      }, timeoutMs);

      this.isListeningActive = true;

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript + ' ';
          } else {
            interim += item[0].transcript;
          }
        }
        if (options.onInterimResult && interim) {
          options.onInterimResult(interim);
        }
      };

      recognition.onerror = (event: any) => {
        clearTimeout(timeoutTimer);
        this.isListeningActive = false;
        if (event.error === 'no-speech' && finalTranscript.trim()) {
          resolve(finalTranscript.trim());
          return;
        }
        reject(new Error(event.error || 'Speech recognition encountered an error.'));
      };

      recognition.onend = () => {
        clearTimeout(timeoutTimer);
        this.isListeningActive = false;
        resolve(finalTranscript.trim());
      };

      try {
        recognition.start();
      } catch (startErr) {
        clearTimeout(timeoutTimer);
        this.isListeningActive = false;
        reject(startErr);
      }
    });
  }

  /**
   * Stops active speech recognition.
   */
  public stopListening(): void {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.abort();
      } catch {
        // Safe ignore
      }
      this.recognitionInstance = null;
    }
    this.isListeningActive = false;
  }

  /**
   * Narrates speech text asynchronously using Web SpeechSynthesis.
   */
  public async speak(text: string, options: SpeechNarrateOptions = {}): Promise<void> {
    if (!this.isSynthesisSupported()) {
      throw new Error('SpeechSynthesis API is not supported in this browser.');
    }

    this.stopSpeaking();

    const clean = this.cleanText(text);
    if (!clean) return;

    return new Promise<void>((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(clean);
      this.activeUtterance = utterance;

      const langCode = options.lang || 'es-CO';
      utterance.lang = langCode;
      utterance.rate = options.rate ?? 1.0;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = options.volume ?? 1.0;

      const voice = options.voice || this.resolveVoice(langCode);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        this.isSpeakingActive = true;
        options.onStart?.();
      };

      utterance.onend = () => {
        this.isSpeakingActive = false;
        this.activeUtterance = null;
        options.onEnd?.();
        resolve();
      };

      utterance.onerror = (event) => {
        this.isSpeakingActive = false;
        this.activeUtterance = null;
        options.onError?.(event);
        if (event.error === 'canceled' || event.error === 'interrupted') {
          resolve();
        } else {
          reject(new Error(`SpeechSynthesis error: ${event.error}`));
        }
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Cancels active acoustic narration.
   */
  public stopSpeaking(): void {
    if (this.isSynthesisSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Safe ignore
      }
    }
    this.isSpeakingActive = false;
    this.activeUtterance = null;
  }

  /**
   * Cancels both speech recognition and synthesis.
   */
  public cancel(): void {
    this.stopListening();
    this.stopSpeaking();
  }

  public get isListening(): boolean {
    return this.isListeningActive;
  }

  public get isSpeaking(): boolean {
    return this.isSpeakingActive;
  }

  public get currentUtterance(): SpeechSynthesisUtterance | null {
    return this.activeUtterance;
  }
}
