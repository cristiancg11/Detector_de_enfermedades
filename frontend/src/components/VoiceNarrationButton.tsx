/**
 * AgroScan AI - Diagnostic Voice Narration Button Component.
 *
 * Provides instant acoustic narration of crop diagnostics, pathogen identification,
 * severity level, and agronomic management instructions using browser SpeechSynthesis.
 * Includes animated waveform indicator and auto-read toggle.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Volume2, VolumeX, Volume1, Sparkles } from 'lucide-react';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { useLanguage } from '../context/LanguageContext';

interface VoiceNarrationButtonProps {
  report: any;
  dosagePrescription?: any;
  className?: string;
  autoReadDefault?: boolean;
}

export const VoiceNarrationButton: React.FC<VoiceNarrationButtonProps> = ({
  report,
  dosagePrescription,
  className = '',
  autoReadDefault = false,
}) => {
  const { language } = useLanguage();
  const isSpanish = language !== 'en';
  const { isSpeaking, speak, stopSpeaking, isSynthesisSupported } = useVoiceAssistant();

  const [autoRead, setAutoRead] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('agroscan_auto_read');
      return stored ? JSON.parse(stored) : autoReadDefault;
    } catch {
      return autoReadDefault;
    }
  });

  const diagnosticId = report?.id;

  // Generate natural speech script from report data
  const narrationScript = useMemo(() => {
    if (!report) return '';

    const crop = report.crop_type || report.cropType || (isSpanish ? 'Cultivo' : 'Crop');
    const plot = report.plot_identifier || report.plotIdentifier || (isSpanish ? 'Lote principal' : 'Main Plot');
    const disease = report.disease_name || report.diseaseName || (isSpanish ? 'Condición foliar no identificada' : 'Unidentified foliar condition');
    const severity = (report.severity_level || report.severityLevel || 'LOW').toUpperCase();
    const rawConf = report.confidence_score ?? report.confidenceScore ?? 0.85;
    const confidence = Math.round(Number(rawConf) * 100);
    const summary = report.diagnosis_summary || report.diagnosisSummary || '';

    const organicList = report.organic_treatment || report.organicTreatment || [];
    const chemicalList = report.chemical_treatment || report.chemicalTreatment || [];

    const organicTxt = organicList.length > 0
      ? organicList.slice(0, 2).join('. ')
      : (isSpanish ? 'Monitoreo cultural preventivo' : 'Preventive cultural monitoring');

    const chemicalTxt = chemicalList.length > 0
      ? chemicalList.slice(0, 1).join('. ')
      : (isSpanish ? 'No se requiere fungicida químico sintético en esta etapa' : 'No synthetic chemical fungicide required at this phase');

    let dosageTxt = '';
    if (dosagePrescription) {
      const tanks = dosagePrescription.getTanksRounded ? dosagePrescription.getTanksRounded() : 2;
      const hoursRain = dosagePrescription.hoursBeforeRain ?? 12;
      dosageTxt = isSpanish
        ? `Se calcula una aplicación de ${tanks} tanques de bomba de espalda de veinte litros. Ventana climática de ${hoursRain} horas antes de lluvia.`
        : `Calculated backpack application requires ${tanks} twenty-liter tanks. Weather window of ${hoursRain} hours before rain.`;
    }

    if (isSpanish) {
      const severityMap: Record<string, string> = {
        CRITICAL: 'Crítica',
        MODERATE: 'Moderada',
        LOW: 'Baja',
      };
      const severityLabel = severityMap[severity] || severity;

      return `Diagnóstico fitosanitario completado para cultivo de ${crop} en ${plot}. Se detectó ${disease} con severidad ${severityLabel} y ${confidence} por ciento de certeza analítica. Dictamen: ${summary}. Manejo biológico y orgánico sugerido: ${organicTxt}. Intervención convencional: ${chemicalTxt}. ${dosageTxt} Proceda con las precauciones fitosanitarias de altura.`;
    } else {
      return `Phytosanitary assessment completed for ${crop} in ${plot}. Detected ${disease} with ${severity} severity and ${confidence} percent analytical confidence. Assessment summary: ${summary}. Suggested bio-organic control: ${organicTxt}. Conventional intervention: ${chemicalTxt}. ${dosageTxt} Follow high-altitude protective practices.`;
    }
  }, [report, dosagePrescription, isSpanish]);

  // Handle auto-read upon receiving a new diagnostic report
  useEffect(() => {
    if (autoRead && narrationScript && isSynthesisSupported) {
      const timer = setTimeout(() => {
        speak(narrationScript);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [diagnosticId]);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSynthesisSupported) return;

    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(narrationScript);
    }
  };

  const handleToggleAutoRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVal = !autoRead;
    setAutoRead(nextVal);
    try {
      localStorage.setItem('agroscan_auto_read', JSON.stringify(nextVal));
    } catch {
      // Ignore
    }
  };

  if (!isSynthesisSupported) {
    return null;
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Primary Narrate / Stop Audio Button */}
      <button
        type="button"
        onClick={handleTogglePlay}
        title={
          isSpeaking
            ? isSpanish
              ? 'Detener narración de voz'
              : 'Stop voice narration'
            : isSpanish
            ? 'Escuchar diagnóstico completo por voz'
            : 'Listen to full diagnostic voice readout'
        }
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 ${
          isSpeaking
            ? 'bg-rose-500 hover:bg-rose-600 text-white ring-4 ring-rose-500/20 animate-pulse'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-soft'
        }`}
      >
        {isSpeaking ? (
          <>
            <VolumeX className="w-4 h-4 animate-bounce" />
            <span>{isSpanish ? 'Detener Voz' : 'Stop Audio'}</span>
            {/* Visual acoustic equalizer waveform */}
            <span className="flex items-center gap-0.5 ml-1">
              <span className="w-1 h-3 bg-white rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" />
              <span className="w-1 h-4 bg-white rounded-full animate-[pulse_0.4s_ease-in-out_infinite_0.2s]" />
              <span className="w-1 h-2.5 bg-white rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.4s]" />
            </span>
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4 text-emerald-200" />
            <span>{isSpanish ? 'Escuchar Diagnóstico' : 'Read Aloud'}</span>
          </>
        )}
      </button>

      {/* Auto-read Toggle Setting Pill */}
      <button
        type="button"
        onClick={handleToggleAutoRead}
        title={
          isSpanish
            ? autoRead
              ? 'Lectura automática al diagnosticar ACTIVADA'
              : 'Lectura automática al diagnosticar DESACTIVADA'
            : autoRead
            ? 'Auto-read on diagnostic completion ENABLED'
            : 'Auto-read on diagnostic completion DISABLED'
        }
        className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors border ${
          autoRead
            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60'
            : 'bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-700 dark:hover:text-slate-200'
        }`}
      >
        <Sparkles className={`w-3 h-3 ${autoRead ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
        <span>
          {isSpanish
            ? autoRead
              ? 'Auto-voz activa'
              : 'Auto-voz desactivada'
            : autoRead
            ? 'Auto-read ON'
            : 'Auto-read OFF'}
        </span>
      </button>
    </div>
  );
};

export default VoiceNarrationButton;
