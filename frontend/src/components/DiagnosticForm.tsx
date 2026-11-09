/**
 * AgroScan AI - Diagnostic Form Component with Voice-Dictated Field Notes.
 *
 * Enables farmers to designate plot parameters, upload crop images, and dictate
 * hands-free acoustic field observations and foliar symptoms directly into the form.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Camera,
  Upload,
  MapPin,
  Sparkles,
  FileText,
  AlertCircle,
  CheckCircle2,
  Layers,
  Cpu,
  Trash2,
} from 'lucide-react';
import { CropType } from '../types';
import { CropDiagnosticRequest } from '../models/CropDiagnosticRequest';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { useLanguage } from '../context/LanguageContext';

export interface DiagnosticFormProps {
  onSubmit: (request: CropDiagnosticRequest, previewUrl: string, fieldNotes?: string) => void;
  isAnalyzing?: boolean;
  className?: string;
}

const CROP_OPTIONS: { type: CropType; label: string; variety: string; icon: string }[] = [
  { type: 'Potato', label: 'Papa Andina', variety: 'Pastusa Suprema / Diacol Capiro', icon: '🥔' },
  { type: 'Coffee', label: 'Café Especial', variety: 'Castillo Nariño / Caturra', icon: '☕' },
  { type: 'Corn', label: 'Maíz de Altura', variety: 'Choclo Nariñense / Capia', icon: '🌽' },
  { type: 'Tomato', label: 'Tomate de Árbol', variety: 'Chonto Andino / Larga Vida', icon: '🍅' },
];

export const DiagnosticForm: React.FC<DiagnosticFormProps> = ({
  onSubmit,
  isAnalyzing = false,
  className = '',
}) => {
  const { language } = useLanguage();
  const isSpanish = language !== 'en';

  const [selectedCrop, setSelectedCrop] = useState<CropType>('Potato');
  const [plotIdentifier, setPlotIdentifier] = useState<string>('Lote A - Ladera Alta');
  const [fieldNotes, setFieldNotes] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    clearTranscript,
    isRecognitionSupported,
    recognitionError,
  } = useVoiceAssistant();

  // Append voice transcript to field notes
  useEffect(() => {
    if (transcript) {
      setFieldNotes((prev) => {
        const separator = prev.trim() ? ' ' : '';
        return `${prev.trim()}${separator}${transcript.trim()}`;
      });
      clearTranscript();
    }
  }, [transcript, clearTranscript]);

  const handleVoiceDictationToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !previewUrl) {
      setFormError(
        isSpanish
          ? 'Por favor suba o capture una fotografía de la hoja afectada.'
          : 'Please upload or capture a photo of the affected foliage.'
      );
      return;
    }

    if (isListening) {
      stopListening();
    }

    const request = new CropDiagnosticRequest({
      imageBlob: selectedFile || new Blob(),
      cropType: selectedCrop,
      plotIdentifier: plotIdentifier.trim() || 'Plot A',
    });

    onSubmit(request, previewUrl || '', fieldNotes.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-card transition-colors space-y-6 ${className}`}
    >
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>{isSpanish ? 'Registro Fitosanitario de Campo' : 'Field Phytosanitary Registration'}</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
            {isSpanish ? 'Voz & Diagnóstico' : 'Voice & Diagnostic'}
          </span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {isSpanish
            ? 'Dicte observaciones de campo por voz y suba muestras foliares para evaluación con Gemini 2.5 Flash.'
            : 'Dictate field observations hands-free and submit foliar samples for Gemini 2.5 Flash evaluation.'}
        </p>
      </div>

      {/* 1. Crop Selection */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
          {isSpanish ? '1. Cultivo Andino' : '1. Andean Crop'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {CROP_OPTIONS.map((c) => (
            <button
              key={c.type}
              type="button"
              onClick={() => setSelectedCrop(c.type)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                selectedCrop === c.type
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900 dark:text-emerald-200 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <span className="text-2xl block mb-1">{c.icon}</span>
              <p className="text-xs font-extrabold">{c.label}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{c.variety}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Plot Identifier */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
          {isSpanish ? '2. Identificador de Lote o Parcela' : '2. Lot or Plot Identifier'}
        </label>
        <div className="relative">
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            value={plotIdentifier}
            onChange={(e) => setPlotIdentifier(e.target.value)}
            placeholder={isSpanish ? 'Ej. Lote A - Ladera Alta, Surco 3...' : 'e.g., Plot A - High Slope...'}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-colors"
          />
        </div>
      </div>

      {/* 3. Voice-Dictated Field Notes / Observaciones de Campo */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{isSpanish ? '3. Observaciones de Campo (Notas de Voz)' : '3. Field Observations (Voice Notes)'}</span>
          </label>

          {/* Microphone Dictation Trigger */}
          {isRecognitionSupported && (
            <button
              type="button"
              onClick={handleVoiceDictationToggle}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs active:scale-95 ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-500/20 animate-pulse'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>{isSpanish ? 'Detener Micrófono' : 'Stop Dictation'}</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{isSpanish ? 'Dictar por Voz' : 'Voice Dictate'}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Live Listening Pulse Banner */}
        {isListening && (
          <div className="mb-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2 animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
            <span>
              {isSpanish
                ? '🎙️ Escuchando observaciones de campo... Habla sobre manchas, clorosis o presencia de insectos.'
                : '🎙️ Listening to field observations... Describe leaf lesions, wilting, or insect spots.'}
            </span>
          </div>
        )}

        <div className="relative">
          <textarea
            rows={3}
            value={fieldNotes}
            onChange={(e) => setFieldNotes(e.target.value)}
            placeholder={
              isSpanish
                ? 'Dicte o escriba síntomas visibles (ej. manchas circulares con halo amarillo en el envés, marchitez apical)...'
                : 'Dictate or write visible symptoms (e.g., circular lesions with yellow halo on underside, apical wilting)...'
            }
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-600 transition-colors shadow-inner"
          />
          {fieldNotes && (
            <button
              type="button"
              onClick={() => setFieldNotes('')}
              className="absolute right-3 bottom-3 p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
              title={isSpanish ? 'Limpiar notas' : 'Clear notes'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4. Foliar Sample Photo Upload */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
          {isSpanish ? '4. Fotografía de la Muestra Foliar' : '4. Foliar Sample Photo'}
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-2xl p-5 border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/60 dark:bg-slate-800/40 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px]"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {previewUrl ? (
            <div className="flex items-center gap-3">
              <img
                src={previewUrl}
                alt="Selected foliage"
                className="w-20 h-20 object-cover rounded-xl border border-emerald-500 shadow-sm"
              />
              <div className="text-left text-xs">
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{isSpanish ? 'Foto cargada con éxito' : 'Photo successfully loaded'}</span>
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  {isSpanish ? 'Haga clic para cambiar la imagen' : 'Click to select a different image'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Camera className="w-7 h-7 text-emerald-600 dark:text-emerald-400 mb-1" />
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {isSpanish ? 'Subir o capturar foto con la cámara' : 'Upload or capture photo with camera'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">JPEG, PNG o WebP</p>
            </div>
          )}
        </div>
      </div>

      {formError && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isAnalyzing}
        className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-emerald-soft active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Layers className="w-4 h-4" />
        <span>
          {isAnalyzing
            ? isSpanish
              ? 'Analizando con Gemini 2.5 Flash...'
              : 'Analyzing with Gemini 2.5 Flash...'
            : isSpanish
            ? 'Enviar Diagnóstico Fitosanitario'
            : 'Submit Phytosanitary Diagnostic'}
        </span>
      </button>
    </form>
  );
};

export default DiagnosticForm;
