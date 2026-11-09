/**
 * AgroScan AI - Agronomic Chat Assistant Component.
 *
 * Provides bidirectional conversational consultations with Google Gemini 2.5 Flash,
 * featuring speech-to-text voice query dictation, text-to-speech reply narration,
 * and quick-tap agronomic follow-up prompts.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { useLanguage } from '../context/LanguageContext';
import { ApiService } from '../services/apiService';
import { AgronomicChatThread } from '../models/AgronomicChatThread';
import { DiagnosticReport } from '../models/DiagnosticReport';
import { UserProfile } from '../types';

export interface AgronomicChatProps {
  report: DiagnosticReport | any;
  currentUser?: UserProfile | null;
  onClose?: () => void;
  className?: string;
  isEmbedded?: boolean;
}

const DEFAULT_SUGGESTED_PROMPTS_ES = [
  '¿Cuántos litros o gramos por bomba de 20L debo aplicar?',
  '¿Puedo aplicar si va a llover en las próximas 6 horas?',
  '¿Este caldo orgánico es seguro durante floración?',
  '¿Qué equipo de protección personal (EPP) necesito?',
];

const DEFAULT_SUGGESTED_PROMPTS_EN = [
  'What is the exact dosage per 20L backpack sprayer?',
  'Can I apply this fungicide if rain is forecast within 6 hours?',
  'Is this organic broth safe during flowering?',
  'What personal protective equipment (PPE) is mandatory?',
];

export const AgronomicChat: React.FC<AgronomicChatProps> = ({
  report,
  currentUser,
  onClose,
  className = '',
}) => {
  const { language } = useLanguage();
  const isSpanish = language !== 'en';

  const defaultPrompts = isSpanish
    ? DEFAULT_SUGGESTED_PROMPTS_ES
    : DEFAULT_SUGGESTED_PROMPTS_EN;

  const [thread, setThread] = useState<AgronomicChatThread>(() =>
    AgronomicChatThread.loadThread(report?.id || 'default', defaultPrompts)
  );
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSpeaking,
    speak,
    stopSpeaking,
    isRecognitionSupported,
    isSynthesisSupported,
  } = useVoiceAssistant();

  // Seed initial greeting message
  useEffect(() => {
    if (report?.id) {
      const loaded = AgronomicChatThread.loadThread(report.id, defaultPrompts);
      if (loaded.messages.length === 0) {
        const greeting = isSpanish
          ? `¡Hola ${currentUser ? currentUser.fullName : 'productor andino'}! He analizado tu reporte para ${report.cropType || report.crop_type} (${report.diseaseName || report.disease_name}) en ${report.plotIdentifier || report.plot_identifier}. Puedes hacerme cualquier consulta técnica por voz o texto sobre dosificaciones de bomba de 20L, clima o manejo orgánico.`
          : `Hello ${currentUser ? currentUser.fullName : 'farmer'}! I've reviewed your diagnostic report for ${report.cropType || report.crop_type} (${report.diseaseName || report.disease_name}) in ${report.plotIdentifier || report.plot_identifier}. Feel free to ask technical questions by voice or text regarding 20L backpack dosages, weather timing, or organic treatments.`;

        loaded.addModelResponse(greeting, defaultPrompts);
      }
      setThread(loaded);
      setErrorMsg(null);
    }
  }, [report?.id, isSpanish]);

  // Handle transcribed speech insertion
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
    }
  }, [transcript]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || inputValue).trim();
    if (!messageText || isLoading) return;

    if (isListening) {
      stopListening();
    }
    if (isSpeaking) {
      stopSpeaking();
    }

    setErrorMsg(null);
    setInputValue('');

    thread.addUserMessage(messageText);
    setThread(
      new AgronomicChatThread(
        thread.diagnosticId,
        [...thread.messages],
        thread.suggestedFollowups,
        true
      )
    );
    setIsLoading(true);

    try {
      const response = await ApiService.sendAgronomicChat(
        report.id,
        messageText,
        thread.toHistoryPayload()
      );

      thread.addModelResponse(response.reply, response.suggested_followups || defaultPrompts);
      setThread(
        new AgronomicChatThread(
          thread.diagnosticId,
          [...thread.messages],
          thread.suggestedFollowups,
          true
        )
      );

      // Auto-narrate reply if voice assistant was actively used
      if (isSynthesisSupported && response.reply) {
        setSpeakingMsgIdx(thread.messages.length - 1);
        speak(response.reply, {
          onEnd: () => setSpeakingMsgIdx(null),
        });
      }
    } catch (err: any) {
      console.warn('Agronomic chat query error notice:', err);
      setErrorMsg(
        err?.message ||
          (isSpanish
            ? 'Error de conexión con el asistente agronómico. Intente nuevamente.'
            : 'Error communicating with agronomic assistant. Please retry.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((resultText) => {
        if (resultText && resultText.trim()) {
          setInputValue(resultText.trim());
          // Optional immediate submission if query is clear
          setTimeout(() => {
            handleSendMessage(resultText.trim());
          }, 300);
        }
      });
    }
  };

  const handleReadMessage = (text: string, idx: number) => {
    if (isSpeaking && speakingMsgIdx === idx) {
      stopSpeaking();
      setSpeakingMsgIdx(null);
    } else {
      setSpeakingMsgIdx(idx);
      speak(text, {
        onEnd: () => setSpeakingMsgIdx(null),
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className={`flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-card transition-colors ${className}`}
    >
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-emerald-soft">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                {isSpanish ? 'Asistente Agronómico de Voz' : 'Voice Agronomic Assistant'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {report?.cropType || report?.crop_type} • {report?.diseaseName || report?.disease_name}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Message Thread History */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 max-h-[460px] min-h-[280px]">
        {thread.messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          const isMsgSpeaking = isSpeaking && speakingMsgIdx === idx;

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-slate-800 dark:bg-slate-700 text-white'
                    : 'bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-xs'
                    : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 rounded-tl-xs border border-slate-200 dark:border-slate-700'
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>

                {/* Speaker TTS Read Aloud Icon on Bot Messages */}
                {!isUser && isSynthesisSupported && (
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <button
                      type="button"
                      onClick={() => handleReadMessage(msg.content, idx)}
                      className="inline-flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
                      title={isMsgSpeaking ? 'Detener lectura' : 'Escuchar respuesta'}
                    >
                      {isMsgSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                          <span className="text-rose-600 font-bold">
                            {isSpanish ? 'Detener' : 'Stop'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isSpanish ? 'Escuchar' : 'Listen'}</span>
                        </>
                      )}
                    </button>
                    <span className="font-mono text-[10px] text-slate-400">
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>
              {isSpanish
                ? 'Consultando Agrónomo de Extensión con Gemini 2.5 Flash...'
                : 'Consulting Extension Agronomist via Gemini 2.5 Flash...'}
            </span>
          </div>
        )}

        {/* Error notice */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Follow-up Prompts */}
      {thread.suggestedFollowups.length > 0 && !isLoading && (
        <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            {thread.suggestedFollowups.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip)}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-all shadow-xs truncate max-w-[240px]"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar with Hands-Free Dictation Button */}
      <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {/* Pulsing Recording Indicator Banner */}
        {isListening && (
          <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              <span>
                {isSpanish ? '🎙️ Escuchando tu consulta...' : '🎙️ Listening to your query...'}
              </span>
            </div>
            <button
              type="button"
              onClick={stopListening}
              className="text-[11px] underline text-rose-800 dark:text-rose-200 font-bold"
            >
              {isSpanish ? 'Listo / Enviar' : 'Done / Submit'}
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Hands-Free Voice Dictation Button */}
          {isRecognitionSupported && (
            <button
              type="button"
              onClick={handleVoiceToggle}
              title={
                isListening
                  ? isSpanish
                    ? 'Detener grabación de voz'
                    : 'Stop microphone listening'
                  : isSpanish
                  ? 'Preguntar por voz con el micrófono'
                  : 'Ask question hands-free with microphone'
              }
              className={`p-2.5 rounded-xl transition-all shadow-xs active:scale-95 shrink-0 ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-500/20 animate-bounce'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={
              isListening
                ? isSpanish
                  ? 'Habla ahora...'
                  : 'Speak now...'
                : isSpanish
                ? 'Pregunta por voz o escribe tu consulta...'
                : 'Ask by voice or type your agronomic question...'
            }
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-600 transition-colors shadow-inner"
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-emerald-soft disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shrink-0"
            title={isSpanish ? 'Enviar consulta' : 'Send query'}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgronomicChat;
