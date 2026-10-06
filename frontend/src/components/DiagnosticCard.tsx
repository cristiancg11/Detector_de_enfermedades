/**
 * AgroScan AI - Diagnostic Card Component.
 *
 * Displays visual confidence meter, severity classification, pathogen category,
 * phenotypic symptoms, and a responsive split-view of organic vs. chemical treatments.
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  Sprout,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  MapPin,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import { DiagnosticReport } from '../models/DiagnosticReport';

interface DiagnosticCardProps {
  report: DiagnosticReport;
  onSaveBookmark?: () => void;
}

export const DiagnosticCard: React.FC<DiagnosticCardProps> = ({ report }) => {
  const [activeTab, setActiveTab] = useState<'both' | 'organic' | 'chemical'>('both');
  const [copied, setCopied] = useState<boolean>(false);

  const severityStyles = report.getSeverityStyles();
  const pathogenBadge = report.getPathogenBadge();
  const confidencePercent = Math.round(report.confidenceScore * 100);

  const handleCopySummary = () => {
    const text = `[AgroScan AI Diagnostic]\nCrop: ${report.cropType} (${report.plotIdentifier})\nDisease: ${report.diseaseName} (${pathogenBadge.label})\nSeverity: ${report.severityLevel} | Confidence: ${report.formattedConfidence()}\nSummary: ${report.diagnosisSummary}\nDate: ${report.formattedDate()}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`bg-slate-900/90 backdrop-blur-xl border rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300 relative overflow-hidden ${severityStyles.border} ${severityStyles.bgGlow}`}
    >
      {/* Top Banner & Metadata */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {/* Severity Badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${severityStyles.badge}`}
            >
              {report.severityLevel === 'CRITICAL' && <AlertTriangle className="w-3.5 h-3.5" />}
              {report.severityLevel === 'MODERATE' && <Info className="w-3.5 h-3.5" />}
              {report.severityLevel === 'LOW' && <CheckCircle2 className="w-3.5 h-3.5" />}
              Severity: {report.severityLevel}
            </span>

            {/* Pathogen Type Badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${pathogenBadge.badgeClass}`}
            >
              {pathogenBadge.label}
            </span>

            {/* Crop Badge */}
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1">
              <span>{report.getCropIcon()}</span>
              <span>{report.cropType}</span>
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{report.diseaseName}</span>
          </h3>

          {report.scientificName && (
            <p className="text-emerald-400/90 text-sm italic font-mono mt-0.5">
              {report.scientificName}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-3 font-medium">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Plot: <strong className="text-slate-200">{report.plotIdentifier}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {report.formattedDate()}
            </span>
          </div>
        </div>

        {/* Visual Confidence Gauge Meter */}
        <div className="flex flex-col items-start md:items-end bg-slate-950/70 p-4 rounded-2xl border border-slate-800 shrink-0">
          <div className="flex items-center justify-between w-full md:w-44 mb-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              AI Confidence
            </span>
            <span className="text-lg font-extrabold text-white font-mono">
              {report.formattedConfidence()}
            </span>
          </div>

          {/* Progress Bar Gauge */}
          <div className="w-full md:w-44 h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${severityStyles.progressBar}`}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>

          <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
            Gemini 2.5 Flash Vision
          </span>
        </div>
      </div>

      {/* Diagnosis Technical Summary */}
      <div className="py-6 border-b border-slate-800">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          Agronomic Diagnosis Summary
        </h4>
        <p className="text-slate-200 text-sm sm:text-base leading-relaxed bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
          {report.diagnosisSummary}
        </p>

        {/* Symptoms checklist */}
        {report.symptoms && report.symptoms.length > 0 && (
          <div className="mt-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Identified Phenotypic Symptoms:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {report.symptoms.map((symptom, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 text-xs text-slate-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{symptom}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Split-View Treatment Recommendations (Organic vs Chemical) */}
      <div className="py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h4 className="text-base font-bold text-white tracking-wide">
              Phytosanitary Treatment Protocol
            </h4>
            <p className="text-xs text-slate-400">
              Comparative decision matrix for smallholder growers in Nariño
            </p>
          </div>

          {/* View Mode Toggle Switcher */}
          <div className="inline-flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('both')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'both'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('organic')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'organic'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Organic Only
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('chemical')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'chemical'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Chemical Only
            </button>
          </div>
        </div>

        {/* Treatment Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Organic / Biological Pathway */}
          {(activeTab === 'both' || activeTab === 'organic') && (
            <div
              className={`rounded-2xl p-5 border transition-all ${
                activeTab === 'organic' ? 'lg:col-span-2' : ''
              } bg-gradient-to-b from-emerald-950/20 to-slate-950/50 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.06)]`}
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-emerald-500/20">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <span>Organic & Biological Pathway</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[10px] text-emerald-300 font-semibold lowercase">
                      eco-friendly
                    </span>
                  </h5>
                  <p className="text-xs text-slate-400">
                    Bio-inputs, antagonistic fungi & plant extracts
                  </p>
                </div>
              </div>

              {report.organicTreatment && report.organicTreatment.length > 0 ? (
                <ul className="space-y-3">
                  {report.organicTreatment.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No immediate organic intervention required. Maintain soil microbiology.
                </p>
              )}
            </div>
          )}

          {/* Chemical / Conventional Pathway */}
          {(activeTab === 'both' || activeTab === 'chemical') && (
            <div
              className={`rounded-2xl p-5 border transition-all ${
                activeTab === 'chemical' ? 'lg:col-span-2' : ''
              } bg-gradient-to-b from-cyan-950/20 to-slate-950/50 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.06)]`}
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-cyan-500/20">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <span>Chemical & Conventional Pathway</span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-[10px] text-cyan-300 font-semibold lowercase">
                      systemic / contact
                    </span>
                  </h5>
                  <p className="text-xs text-slate-400">
                    Active ingredients, dosage & safety intervals
                  </p>
                </div>
              </div>

              {report.chemicalTreatment && report.chemicalTreatment.length > 0 ? (
                <ul className="space-y-3">
                  {report.chemicalTreatment.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80"
                    >
                      <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No chemical pesticide application recommended for current stage.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preventive Agronomic Cultural Practices */}
      {report.preventiveMeasures && report.preventiveMeasures.length > 0 && (
        <div className="pt-6 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Preventive Cultural Practices & Farm Sanitation:
          </h4>
          <div className="flex flex-wrap gap-2">
            {report.preventiveMeasures.map((measure, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>{measure}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Footer Action Bar */}
      <div className="mt-8 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <span className="font-mono text-[11px] text-slate-500">
          Session ID: {report.id}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
