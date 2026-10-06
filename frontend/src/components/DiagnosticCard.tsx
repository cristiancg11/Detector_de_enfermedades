/**
 * AgroScan AI - Modern Bento Diagnostic Card Component.
 *
 * Features an animated confidence gauge, severity status, pathogen badge,
 * phenotypic symptoms tags, and an interactive split-screen treatment comparator
 * with organic bio-inputs vs. chemical interventions.
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
  Download
} from 'lucide-react';
import { DiagnosticReport } from '../models/DiagnosticReport';

interface DiagnosticCardProps {
  report: DiagnosticReport;
}

export const DiagnosticCard: React.FC<DiagnosticCardProps> = ({ report }) => {
  const [activeTab, setActiveTab] = useState<'split' | 'organic' | 'chemical'>('split');
  const [copied, setCopied] = useState<boolean>(false);

  const pathogenBadge = report.getPathogenBadge();
  const confidencePercent = Math.round(report.confidenceScore * 100);

  const handleCopySummary = () => {
    const text = `[AgroScan AI Diagnostic Report]\nCrop: ${report.cropType} (${report.plotIdentifier})\nDisease: ${report.diseaseName} (${pathogenBadge.label})\nSeverity: ${report.severityLevel} | Confidence: ${report.formattedConfidence()}\nSummary: ${report.diagnosisSummary}\nDate: ${report.formattedDate()}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(report.toJSON(), null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostic_${report.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative rounded-3xl p-6 sm:p-8 bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all overflow-hidden">
      {/* Top Severity Indicator Stripe */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          report.severityLevel === 'CRITICAL'
            ? 'bg-rose-500'
            : report.severityLevel === 'MODERATE'
            ? 'bg-amber-500'
            : 'bg-emerald-500'
        }`}
      />

      {/* Header Info Banner & Metrics */}
      <div className="relative flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="flex-1">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {/* Severity Pill */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                report.severityLevel === 'CRITICAL'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : report.severityLevel === 'MODERATE'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {report.severityLevel === 'CRITICAL' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
              {report.severityLevel === 'MODERATE' && <Info className="w-3.5 h-3.5 text-amber-600" />}
              {report.severityLevel === 'LOW' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              Severity: {report.severityLevel}
            </span>

            {/* Pathogen Type Badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${pathogenBadge.badgeClass}`}
            >
              {pathogenBadge.label}
            </span>

            {/* Crop Badge */}
            <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5">
              <span>{report.getCropIcon()}</span>
              <span>{report.cropType}</span>
            </span>

            {/* Plot Identifier */}
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-600" />
              <span>{report.plotIdentifier}</span>
            </span>
          </div>

          {/* Disease Common Name */}
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{report.diseaseName}</span>
          </h3>

          {/* Scientific Taxon Name */}
          {report.scientificName && (
            <p className="text-teal-700 text-sm italic font-mono mt-1 font-semibold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              {report.scientificName}
            </p>
          )}

          {/* Diagnosis Summary Text */}
          <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed max-w-3xl">
            {report.diagnosisSummary}
          </p>
        </div>

        {/* High-Tech Confidence Gauge */}
        <div className="flex sm:flex-col items-center justify-between sm:justify-center p-4 rounded-2xl bg-slate-50 border border-slate-200 shrink-0 min-w-[160px] shadow-sm">
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* SVG Radial Gauge */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                strokeWidth="3.2"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${
                  report.confidenceScore >= 0.85
                    ? 'text-emerald-500'
                    : report.confidenceScore >= 0.70
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
              <span className="text-base font-black text-slate-900 font-mono leading-none">
                {confidencePercent}%
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                Score
              </span>
            </div>
          </div>
          <div className="text-right sm:text-center mt-0 sm:mt-2">
            <span className="text-[11px] font-black uppercase text-emerald-800 tracking-wider">
              AI Confidence
            </span>
            <p className="text-[10px] text-slate-500 font-mono">Gemini 2.5 Flash</p>
          </div>
        </div>
      </div>

      {/* Phenotypic Symptoms Tags */}
      {report.symptoms.length > 0 && (
        <div className="py-4 border-b border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Observed Phenotypic Symptoms:</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {report.symptoms.map((symptom, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-1.5 font-medium shadow-sm"
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
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Agronomic Management Pathways
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Compare bio-organic solutions vs. conventional chemical treatments
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'split'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Split-Screen
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('organic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'organic'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Organic Only
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('chemical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'chemical'
                  ? 'bg-white text-sky-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
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
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-200">
                  <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase tracking-wider">
                    <Sprout className="w-4 h-4 text-emerald-600" />
                    <span>Biological & Organic Control</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Eco-Friendly
                  </span>
                </div>

                <ul className="space-y-2.5">
                  {report.organicTreatment.length > 0 ? (
                    report.organicTreatment.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-slate-500 italic">
                      No specific biological interventions required for this pathogen phase.
                    </li>
                  )}
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-200/80 text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero chemical residue; compliant with organic highland standards.</span>
              </div>
            </div>
          )}

          {/* Chemical / Conventional Pathway */}
          {(activeTab === 'split' || activeTab === 'chemical') && (
            <div className="p-5 rounded-2xl bg-sky-50/50 border border-sky-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-sky-200">
                  <div className="flex items-center gap-2 text-sky-800 font-extrabold text-xs uppercase tracking-wider">
                    <FlaskConical className="w-4 h-4 text-sky-600" />
                    <span>Chemical & Technical Intervention</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
                    Targeted Action
                  </span>
                </div>

                <ul className="space-y-2.5">
                  {report.chemicalTreatment.length > 0 ? (
                    report.chemicalTreatment.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <ArrowRight className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-slate-500 italic">
                      No synthetic pesticide intervention mandated.
                    </li>
                  )}
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-sky-200/80 text-[11px] text-sky-800 flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-sky-600" />
                <span>Wear full PPE and strictly observe pre-harvest safety intervals.</span>
              </div>
            </div>
          )}
        </div>

        {/* Preventive Cultural Agronomy */}
        {report.preventiveMeasures.length > 0 && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cultural Agronomic Preventive Measures:</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {report.preventiveMeasures.map((prev, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{prev}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions & Metadata */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{report.formattedDate()}</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400 truncate max-w-[200px]">ID: {report.id}</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all text-xs font-bold shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 transition-all text-xs font-bold shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
