/**
 * AgroScan AI - Cyber-Agronomic Diagnostic Card Component.
 *
 * Displays visual confidence meter, severity classification, pathogen category,
 * phenotypic symptoms, and a responsive split-view of organic vs. chemical treatments
 * with bioluminescent Andean visual accents.
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
  Check,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { DiagnosticReport } from '../models/DiagnosticReport';

interface DiagnosticCardProps {
  report: DiagnosticReport;
}

export const DiagnosticCard: React.FC<DiagnosticCardProps> = ({ report }) => {
  const [activeTab, setActiveTab] = useState<'both' | 'organic' | 'chemical'>('both');
  const [copied, setCopied] = useState<boolean>(false);

  const severityStyles = report.getSeverityStyles();
  const pathogenBadge = report.getPathogenBadge();
  const confidencePercent = Math.round(report.confidenceScore * 100);

  const handleCopySummary = () => {
    const text = `[AgroScan AI Diagnostic Report]\nCrop: ${report.cropType} (${report.plotIdentifier})\nDisease: ${report.diseaseName} (${pathogenBadge.label})\nSeverity: ${report.severityLevel} | Confidence: ${report.formattedConfidence()}\nSummary: ${report.diagnosisSummary}\nDate: ${report.formattedDate()}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`relative rounded-3xl p-6 sm:p-9 shadow-2xl transition-all duration-300 overflow-hidden bg-obsidian-900/90 border backdrop-blur-2xl ${
        report.severityLevel === 'CRITICAL'
          ? 'border-neon-danger/40 shadow-[0_0_40px_rgba(255,46,99,0.12)]'
          : report.severityLevel === 'MODERATE'
          ? 'border-neon-solar/40 shadow-[0_0_40px_rgba(255,183,3,0.12)]'
          : 'border-neon-flora/40 shadow-[0_0_40px_rgba(0,245,155,0.12)]'
      }`}
    >
      {/* Top Banner & Metadata */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {/* Severity Badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                report.severityLevel === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_15px_rgba(255,46,99,0.3)]'
                  : report.severityLevel === 'MODERATE'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(255,183,3,0.3)]'
                  : 'bg-neon-flora/20 text-neon-flora border border-neon-flora/40 shadow-[0_0_15px_rgba(0,245,155,0.3)]'
              }`}
            >
              {report.severityLevel === 'CRITICAL' && <AlertTriangle className="w-3.5 h-3.5" />}
              {report.severityLevel === 'MODERATE' && <Info className="w-3.5 h-3.5" />}
              {report.severityLevel === 'LOW' && <CheckCircle2 className="w-3.5 h-3.5" />}
              Severity: {report.severityLevel}
            </span>

            {/* Pathogen Type Badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${pathogenBadge.badgeClass}`}
            >
              {pathogenBadge.label}
            </span>

            {/* Crop Badge */}
            <span className="px-3 py-1 rounded-full bg-obsidian-950 text-slate-300 border border-slate-700/80 text-xs font-bold flex items-center gap-1">
              <span>{report.getCropIcon()}</span>
              <span>{report.cropType}</span>
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{report.diseaseName}</span>
          </h3>

          {report.scientificName && (
            <p className="text-neon-sky text-sm italic font-mono mt-1 font-semibold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              {report.scientificName}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-3 font-medium">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-neon-flora" />
              Farm Plot: <strong className="text-slate-100">{report.plotIdentifier}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {report.formattedDate()}
            </span>
          </div>
        </div>

        {/* Visual Confidence Gauge Meter */}
        <div className="flex flex-col items-start md:items-end bg-obsidian-950/90 p-4 rounded-2xl border border-slate-800 shrink-0 shadow-inner">
          <div className="flex items-center justify-between w-full md:w-48 mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Diagnostic Confidence
            </span>
            <span className="text-lg font-black text-neon-flora font-mono">
              {report.formattedConfidence()}
            </span>
          </div>

          {/* Progress Bar Gauge */}
          <div className="w-full md:w-48 h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${severityStyles.progressBar}`}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>

          <span className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1 font-mono">
            <Sparkles className="w-2.5 h-2.5 text-neon-sky" />
            Gemini 2.5 Flash Structured Vision
          </span>
        </div>
      </div>

      {/* Diagnosis Technical Summary */}
      <div className="py-6 border-b border-slate-800/80">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-neon-flora" />
          Phytosanitary Diagnosis Summary
        </h4>
        <p className="text-slate-200 text-sm sm:text-base leading-relaxed bg-obsidian-950/60 p-4 rounded-2xl border border-slate-800">
          {report.diagnosisSummary}
        </p>

        {/* Symptoms checklist */}
        {report.symptoms && report.symptoms.length > 0 && (
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Identified Phenotypic Symptoms:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {report.symptoms.map((symptom, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 bg-obsidian-950/70 p-3 rounded-xl border border-slate-800 text-xs text-slate-200"
                >
                  <span className="w-2 h-2 rounded-full bg-neon-flora shadow-[0_0_8px_#00f59b] mt-1 shrink-0" />
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
            <h4 className="text-base font-extrabold text-white tracking-wide flex items-center gap-2">
              <Zap className="w-4 h-4 text-neon-flora" />
              Treatment Decision Matrix
            </h4>
            <p className="text-xs text-slate-400">
              Comparative agronomic pathways for smallholders in Nariño
            </p>
          </div>

          {/* View Mode Toggle Switcher */}
          <div className="inline-flex items-center p-1 bg-obsidian-950 rounded-xl border border-slate-800 text-xs self-start sm:self-auto shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('both')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'both'
                  ? 'bg-gradient-to-r from-neon-flora to-emerald-400 text-obsidian-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('organic')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'organic'
                  ? 'bg-gradient-to-r from-neon-flora to-emerald-400 text-obsidian-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Organic Only
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('chemical')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'chemical'
                  ? 'bg-gradient-to-r from-neon-sky to-cyan-400 text-obsidian-950 shadow-md'
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
              } bg-gradient-to-b from-neon-flora/10 via-obsidian-950 to-obsidian-950 border-neon-flora/30 shadow-[0_0_25px_rgba(0,245,155,0.08)]`}
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-neon-flora/20">
                <div className="w-10 h-10 rounded-xl bg-neon-flora/20 border border-neon-flora/40 flex items-center justify-center text-neon-flora shrink-0 shadow-[0_0_15px_rgba(0,245,155,0.2)]">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-black text-neon-flora uppercase tracking-wider flex items-center gap-2">
                    <span>Organic & Biological Pathway</span>
                    <span className="px-2 py-0.5 rounded-full bg-neon-flora/20 text-[10px] text-neon-flora font-bold lowercase border border-neon-flora/30">
                      eco-friendly
                    </span>
                  </h5>
                  <p className="text-xs text-slate-400">
                    Antagonistic fungi, botanical extracts & bio-inputs
                  </p>
                </div>
              </div>

              {report.organicTreatment && report.organicTreatment.length > 0 ? (
                <ul className="space-y-3">
                  {report.organicTreatment.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed bg-obsidian-950/80 p-3.5 rounded-xl border border-slate-800/90"
                    >
                      <CheckCircle2 className="w-4 h-4 text-neon-flora shrink-0 mt-0.5" />
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
              } bg-gradient-to-b from-neon-sky/10 via-obsidian-950 to-obsidian-950 border-neon-sky/30 shadow-[0_0_25px_rgba(0,240,255,0.08)]`}
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-neon-sky/20">
                <div className="w-10 h-10 rounded-xl bg-neon-sky/20 border border-neon-sky/40 flex items-center justify-center text-neon-sky shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-black text-neon-sky uppercase tracking-wider flex items-center gap-2">
                    <span>Chemical & Conventional Pathway</span>
                    <span className="px-2 py-0.5 rounded-full bg-neon-sky/20 text-[10px] text-neon-sky font-bold lowercase border border-neon-sky/30">
                      systemic / contact
                    </span>
                  </h5>
                  <p className="text-xs text-slate-400">
                    Active ingredients, dosage rates & safety intervals
                  </p>
                </div>
              </div>

              {report.chemicalTreatment && report.chemicalTreatment.length > 0 ? (
                <ul className="space-y-3">
                  {report.chemicalTreatment.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed bg-obsidian-950/80 p-3.5 rounded-xl border border-slate-800/90"
                    >
                      <ShieldAlert className="w-4 h-4 text-neon-sky shrink-0 mt-0.5" />
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
        <div className="pt-6 border-t border-slate-800/80">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-neon-flora" />
            Cultural Management & Field Sanitation:
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {report.preventiveMeasures.map((measure, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-obsidian-950 border border-slate-800 text-xs text-slate-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-neon-flora shrink-0" />
                <span>{measure}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Footer Action Bar */}
      <div className="mt-8 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <span className="font-mono text-[11px] text-slate-500">
          Diagnostic Session UUID: {report.id}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all font-semibold active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-neon-flora" />
                <span className="text-neon-flora">Report Copied</span>
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
