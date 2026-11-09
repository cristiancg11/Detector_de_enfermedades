/**
 * AgroScan AI - Modern Bento Diagnostic Card Component.
 *
 * Fully defensive, null-safe phytosanitary diagnostic presentation.
 * Gracefully handles loading, empty, and error states, protecting the UI
 * from runtime null/undefined crashes during remote API evaluations.
 */

import React, { useState } from 'react';
import {
  Sprout,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  MapPin,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  ArrowRight,
  Download,
  MessageSquare,
  Calculator,
  Loader2,
  AlertOctagon,
} from 'lucide-react';
import { DiagnosticReport } from '../models/DiagnosticReport';
import { DosageCalculatorModal } from './DosageCalculatorModal';
import { VoiceNarrationButton } from './VoiceNarrationButton';

/**
 * Defensive string normalizer preventing TypeError: Cannot read properties of undefined (reading 'trim')
 */
export const safeStr = (val: unknown, fallback: string = ''): string => {
  if (typeof val === 'string') return val.trim();
  if (val === null || val === undefined) return fallback;
  return String(val).trim();
};

interface DiagnosticCardProps {
  report?: DiagnosticReport | any | null;
  isLoading?: boolean;
  error?: string | null;
  onOpenChat?: (report: any) => void;
  onOpenDosageCalculator?: (report: any) => void;
}

export const DiagnosticCard: React.FC<DiagnosticCardProps> = ({
  report,
  isLoading = false,
  error = null,
  onOpenChat,
  onOpenDosageCalculator,
}) => {
  const [activeTab, setActiveTab] = useState<'split' | 'organic' | 'chemical'>('split');
  const [copied, setCopied] = useState<boolean>(false);
  const [isDosageModalOpen, setIsDosageModalOpen] = useState<boolean>(false);

  // 1. Loading State Presentation
  if (isLoading) {
    return (
      <div className="rounded-3xl p-8 sm:p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Analyzing leaf tissue with Gemini AI...
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
            Applying convolutional Andean phytopathology models and retrieving organic vs. chemical pathways.
          </p>
        </div>
      </div>
    );
  }

  // 2. Error State Presentation
  if (error) {
    return (
      <div className="rounded-3xl p-6 sm:p-8 bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 shadow-sm flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">Diagnostic Service Notice</h3>
          <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">{error}</p>
          <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-2">
            Diagnostic service error: please verify backend connection at http://localhost:8000
          </p>
        </div>
      </div>
    );
  }

  // 3. Empty State Presentation
  if (!report) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center shadow-card">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-4 shadow-sm">
          <Sprout className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Ready for Andean Crop Health Diagnostic
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1">
          Select your crop, designate the farm plot or lot, and upload a leaf photo to trigger Gemini 2.5 Flash analysis with MongoDB Atlas persistence.
        </p>
      </div>
    );
  }

  // 4. Defensive Null-Safe Field Normalization
  const diagnostic = report;

  const organicTreatment: string[] =
    diagnostic?.organic_treatment || diagnostic?.organicTreatment || [];
  const chemicalTreatment: string[] =
    diagnostic?.chemical_treatment || diagnostic?.chemicalTreatment || [];
  const preventiveActions: string[] =
    diagnostic?.preventive_actions ||
    diagnostic?.preventive_measures ||
    diagnostic?.preventiveMeasures ||
    [];
  const rawConfidence: number =
    diagnostic?.confidence_score ?? diagnostic?.confidenceScore ?? 0;
  const confidenceScore = Math.max(0, Math.min(1, Number(rawConfidence) || 0));
  const confidencePercent = Math.round(confidenceScore * 100);

  const symptoms: string[] = diagnostic?.symptoms || [];
  const diseaseName: string =
    diagnostic?.disease_name || diagnostic?.diseaseName || 'Unidentified Foliar Condition';
  const scientificName: string | null =
    diagnostic?.scientific_name || diagnostic?.scientificName || null;
  const cropType: string =
    diagnostic?.crop_type || diagnostic?.cropType || 'Potato';
  const plotIdentifier: string =
    diagnostic?.plot_identifier || diagnostic?.plotIdentifier || 'Plot A';
  const severityLevel: 'LOW' | 'MODERATE' | 'CRITICAL' = (
    diagnostic?.severity_level ||
    diagnostic?.severityLevel ||
    'LOW'
  ).toUpperCase() as 'LOW' | 'MODERATE' | 'CRITICAL';
  const diagnosisSummary: string =
    diagnostic?.diagnosis_summary ||
    diagnostic?.diagnosisSummary ||
    'Phytosanitary assessment completed successfully.';
  const diagnosticId: string = diagnostic?.id || `diag-${Date.now()}`;

  // Safe Pathogen Badge Calculator
  const getSafePathogenBadge = () => {
    if (typeof diagnostic?.getPathogenBadge === 'function') {
      try {
        return diagnostic.getPathogenBadge();
      } catch {
        // Fallback below
      }
    }
    const pathogen = (diagnostic?.pathogen_type || diagnostic?.pathogenType || 'HEALTHY').toUpperCase();
    switch (pathogen) {
      case 'FUNGUS':
        return { label: 'FUNGAL PATHOGEN', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'BACTERIA':
        return { label: 'BACTERIAL INFECTION', badgeClass: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'VIRUS':
        return { label: 'VIRAL DISEASE', badgeClass: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'PEST':
        return { label: 'INSECT PEST DAMAGE', badgeClass: 'bg-orange-100 text-orange-800 border-orange-300' };
      default:
        return { label: 'HEALTHY TISSUE', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    }
  };
  const pathogenBadge = getSafePathogenBadge();

  // Safe Crop Icon
  const getCropIcon = (crop: string) => {
    switch (crop.toLowerCase()) {
      case 'potato': return '🥔';
      case 'coffee': return '☕';
      case 'corn': return '🌽';
      case 'tomato': return '🍅';
      default: return '🌱';
    }
  };

  // Safe Date Formatter
  const formattedDate = (): string => {
    if (typeof diagnostic?.formattedDate === 'function') {
      try {
        return diagnostic.formattedDate();
      } catch {
        // Fallback below
      }
    }
    const dateVal = diagnostic?.created_at || diagnostic?.createdAt;
    if (dateVal) {
      try {
        return new Date(dateVal).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      } catch {
        return new Date().toLocaleDateString();
      }
    }
    return new Date().toLocaleDateString();
  };

  const formattedConfidence = `${confidencePercent}%`;

  const handleCopySummary = () => {
    const text = `[AgroScan AI Diagnostic Report]\nCrop: ${cropType} (${plotIdentifier})\nDisease: ${diseaseName} (${pathogenBadge.label})\nSeverity: ${severityLevel} | Confidence: ${formattedConfidence}\nSummary: ${diagnosisSummary}\nDate: ${formattedDate()}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJSON = () => {
    let exportData = diagnostic;
    if (typeof diagnostic?.toJSON === 'function') {
      try {
        exportData = diagnostic.toJSON();
      } catch {
        // Fallback to raw object
      }
    }
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostic_${diagnosticId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-card hover:shadow-card-hover transition-all overflow-hidden">
      {/* Top Severity Indicator Stripe */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          severityLevel === 'CRITICAL'
            ? 'bg-rose-500'
            : severityLevel === 'MODERATE'
            ? 'bg-amber-500'
            : 'bg-emerald-500'
        }`}
      />

      {/* Header Info Banner & Metrics */}
      <div className="relative flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex-1">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {/* Severity Pill */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                severityLevel === 'CRITICAL'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : severityLevel === 'MODERATE'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              {severityLevel === 'CRITICAL' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />}
              {severityLevel === 'MODERATE' && <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
              {severityLevel === 'LOW' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
              Severity: {severityLevel}
            </span>

            {/* Pathogen Type Badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${pathogenBadge.badgeClass}`}
            >
              {pathogenBadge.label}
            </span>

            {/* Crop Badge */}
            <span className="px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5">
              <span>{getCropIcon(cropType)}</span>
              <span>{cropType}</span>
            </span>

            {/* Plot Identifier */}
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-mono font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{plotIdentifier}</span>
            </span>
          </div>

          {/* Disease Common Name & Audio Narration Widget */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{diseaseName}</span>
            </h3>
            <VoiceNarrationButton report={diagnostic} />
          </div>

          {/* Scientific Taxon Name */}
          {scientificName && (
            <p className="text-teal-700 dark:text-teal-400 text-sm italic font-mono mt-1 font-semibold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              {scientificName}
            </p>
          )}

          {/* Diagnosis Summary Text */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed max-w-3xl">
            {diagnosisSummary}
          </p>
        </div>

        {/* High-Tech Confidence Gauge */}
        <div className="flex sm:flex-col items-center justify-between sm:justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shrink-0 min-w-[160px] shadow-sm">
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* SVG Radial Gauge */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-slate-200 dark:text-slate-700"
                strokeWidth="3.2"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${
                  confidenceScore >= 0.85
                    ? 'text-emerald-500'
                    : confidenceScore >= 0.70
                    ? 'text-amber-500'
                    : 'text-rose-500'
                } transition-all duration-1000 ease-out`}
                strokeDasharray={`${confidencePercent}, 100`}
                strokeWidth="3.2"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-base font-black text-slate-900 dark:text-white font-mono leading-none">
                {confidencePercent}%
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                Score
              </span>
            </div>
          </div>
          <div className="text-right sm:text-center mt-0 sm:mt-2">
            <span className="text-[11px] font-black uppercase text-emerald-800 dark:text-emerald-300 tracking-wider">
              AI Confidence
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Gemini 2.5 Flash</p>
          </div>
        </div>
      </div>

      {/* Phenotypic Symptoms Tags */}
      {symptoms.length > 0 && (
        <div className="py-4 border-b border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Observed Phenotypic Symptoms:</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {symptoms.map((symptom, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-medium shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{symptom}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Treatment Comparison Control Tabs */}
      <div className="pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Agronomic Management Pathways
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Compare bio-organic solutions vs. conventional chemical treatments
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'split'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Split-Screen
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('organic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'organic'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Organic Only
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('chemical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'chemical'
                  ? 'bg-white dark:bg-slate-700 text-sky-800 dark:text-sky-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Chemical Only
            </button>
          </div>
        </div>

        {/* Split-Screen Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Organic / Biological Pathway */}
          {(activeTab === 'split' || activeTab === 'organic') && (
            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-200 dark:border-emerald-800/60">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs uppercase tracking-wider">
                    <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Biological & Organic Control</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                    Eco-Friendly
                  </span>
                </div>

                <ul className="space-y-2.5">
                  {(organicTreatment?.length ?? 0) > 0 ? (
                    (organicTreatment || []).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-slate-500 dark:text-slate-400 italic">
                      No specific biological interventions required for this pathogen phase.
                    </li>
                  )}
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Zero chemical residue; compliant with organic highland standards.</span>
              </div>
            </div>
          )}

          {/* Chemical / Conventional Pathway */}
          {(activeTab === 'split' || activeTab === 'chemical') && (
            <div className="p-5 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-sky-200 dark:border-sky-800/60">
                  <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300 font-extrabold text-xs uppercase tracking-wider">
                    <FlaskConical className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>Chemical & Technical Intervention</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 text-[10px] font-bold">
                    Targeted Action
                  </span>
                </div>

                <ul className="space-y-2.5">
                  {(chemicalTreatment?.length ?? 0) > 0 ? (
                    (chemicalTreatment || []).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <ArrowRight className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-slate-500 dark:text-slate-400 italic">
                      No synthetic pesticide intervention mandated.
                    </li>
                  )}
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-sky-200/80 dark:border-sky-800/60 text-[11px] text-sky-800 dark:text-sky-300 flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Wear full PPE and strictly observe pre-harvest safety intervals.</span>
              </div>
            </div>
          )}
        </div>

        {/* Preventive Cultural Agronomy */}
        {(preventiveActions?.length ?? 0) > 0 && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Cultural Agronomic Preventive Measures:</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(preventiveActions || []).map((prev, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                  <span>{prev}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions & Metadata */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <span>{formattedDate()}</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-400 dark:text-slate-500 truncate max-w-[200px]">ID: {diagnosticId}</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {/* Primary Action Button: Calculate 20L Backpack Dosage & Rain Risk */}
            <button
              type="button"
              onClick={() => {
                if (onOpenDosageCalculator) {
                  onOpenDosageCalculator(diagnostic);
                } else {
                  setIsDosageModalOpen(true);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs font-bold shadow-emerald-soft active:scale-95"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-200" />
              <span>Calculate 20L Backpack Dosage & Rain Risk</span>
            </button>

            {onOpenChat && (
              <button
                type="button"
                onClick={() => onOpenChat(diagnostic)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white transition-all text-xs font-bold shadow-sm active:scale-95"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask Agronomist Follow-up Questions</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all text-xs font-bold shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 transition-all text-xs font-bold shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
            </button>
          </div>
        </div>

        {/* Fallback Internal Dosage Calculator Modal */}
        {!onOpenDosageCalculator && (
          <DosageCalculatorModal
            isOpen={isDosageModalOpen}
            onClose={() => setIsDosageModalOpen(false)}
            diagnosticId={diagnosticId}
            cropType={cropType}
            diseaseName={diseaseName}
          />
        )}
      </div>
    </div>
  );
};
