/**
 * AgroScan AI - Glassmorphic Dosage Calculator Modal Component.
 *
 * Configures field parameters (plot area, backpack sprayer capacity, application method)
 * and displays comprehensive AI calibration metrics, Bento tiles, weather rain wash-off meter,
 * untreated economic loss risk bar, and mandatory PPE security chips.
 */

import React, { useState } from 'react';
import {
  X,
  Calculator,
  Layers,
  Sparkles,
  CloudRain,
  Sprout,
  AlertCircle,
  Shield,
  Gauge,
  CheckCircle2,
  ChevronDown,
  Droplets,
  FlaskConical,
  Clock,
  ShieldAlert,
  Glasses,
  Footprints,
  Wind,
  Hand,
  Check,
  FileSpreadsheet,
} from 'lucide-react';
import {
  DosageCalculationRequest,
  DosagePrescription,
} from '../models/DosagePrescription';

interface DosageCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnosticId: string;
  cropType: string;
  diseaseName: string;
  onCalculate?: (request: DosageCalculationRequest) => Promise<DosagePrescription>;
  initialPrescription?: DosagePrescription | null;
}

export const DosageCalculatorModal: React.FC<DosageCalculatorModalProps> = ({
  isOpen,
  onClose,
  diagnosticId,
  cropType,
  diseaseName,
  onCalculate,
  initialPrescription = null,
}) => {
  const [plotAreaM2, setPlotAreaM2] = useState<number>(2500);
  const [sprayerCapacity, setSprayerCapacity] = useState<number>(20);
  const [applicationMethod, setApplicationMethod] = useState<string>('Manual 20L Backpack');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [prescription, setPrescription] = useState<DosagePrescription | null>(initialPrescription);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCompute = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const requestPayload: DosageCalculationRequest = {
      diagnostic_id: diagnosticId,
      crop_type: cropType,
      disease_name: diseaseName,
      plot_area_m2: Number(plotAreaM2) || 2500,
      sprayer_capacity_liters: Number(sprayerCapacity) || 20,
      application_method: applicationMethod,
    };

    try {
      if (onCalculate) {
        const result = await onCalculate(requestPayload);
        setPrescription(result);
      } else {
        // Resilient local agronomic calculation fallback
        const result = DosagePrescription.calculateLocal(requestPayload);
        setPrescription(result);
      }
    } catch (err: any) {
      console.warn('Dosage calculation notice:', err);
      // Fallback to local calibration on server timeout or error
      const fallbackResult = DosagePrescription.calculateLocal(requestPayload);
      setPrescription(fallbackResult);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPrescription = () => {
    if (!prescription) return;
    const text = `[AgroScan AI Field Dosage Prescription]\nCrop: ${prescription.cropType} | Disease: ${prescription.diseaseName}\nPlot Area: ${prescription.plotAreaM2} m² (${(prescription.plotAreaM2 / 10000).toFixed(2)} ha)\nTanks Needed: ${prescription.getTanksRounded()} x 20L Backpacks (Total Water: ${prescription.totalWaterLiters} L)\nTarget Product: ${prescription.productName}\nDosage per Tank: ${prescription.dosePerTankGramsOrCc} g/cc per 20L | Total: ${prescription.totalProductGramsOrKg}\nWeather Window: ${prescription.getRainWarning().label} (${prescription.hoursBeforeRain}h to rain)\nUntreated Economic Loss: ${prescription.economicLossPercentage}%\nCalculated: ${new Date(prescription.calculatedAt).toLocaleString()}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const riskClasses = prescription?.getRiskColor();
  const rainInfo = prescription?.getRainWarning();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Glassmorphic Modal Dialog Box */}
      <div className="relative w-full max-w-3xl bg-slate-900/95 border border-emerald-500/30 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 z-10 my-auto transition-all overflow-hidden max-h-[90vh] flex flex-col">
        {/* Ambient Emerald & Cyan Glow */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between pb-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/60">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-tight">
                  AI Backpack Sprayer Dosage Calculator
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold uppercase">
                  20L Standard
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Target: <strong className="text-slate-200">{cropType}</strong> • Disease: <strong className="text-emerald-300">{diseaseName}</strong>
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto pr-1 space-y-6 mt-6 flex-1 custom-scrollbar">
          {/* Input Parameters Form */}
          <form onSubmit={handleCompute} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Plot Area */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Plot Area (m²) *</span>
                </label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  required
                  value={plotAreaM2}
                  onChange={(e) => setPlotAreaM2(Number(e.target.value))}
                  placeholder="2500"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                />
                <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                  {(plotAreaM2 / 10000).toFixed(2)} Hectares (Ha)
                </span>
              </div>

              {/* Backpack Tank Capacity */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-sky-400" />
                  <span>Tank Capacity (L)</span>
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={sprayerCapacity}
                  onChange={(e) => setSprayerCapacity(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Standard 20L manual sprayer
                </span>
              </div>

              {/* Application Method */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-teal-400" />
                  <span>Spraying Rig</span>
                </label>
                <div className="relative">
                  <select
                    value={applicationMethod}
                    onChange={(e) => setApplicationMethod(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all appearance-none pr-8 cursor-pointer"
                  >
                    <option value="Manual 20L Backpack">Manual 20L Backpack</option>
                    <option value="Motorized Mist Blower">Motorized Mist Blower</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Hollow cone nozzle
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-xs transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Calculating precise chemical dilution and Andean weather risk...</span>
                </span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Compute AI Field Dosage & Weather Window</span>
                </>
              )}
            </button>
          </form>

          {/* Loading Animation Card */}
          {isLoading && (
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-3 animate-pulse">
              <CloudRain className="w-6 h-6 text-emerald-400 animate-bounce" />
              <p className="text-xs text-emerald-300 font-medium">
                Calculating precise chemical dilution and Andean weather risk...
              </p>
            </div>
          )}

          {/* Error Notification */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3 RESULTS CARD VIEW: BENTO METRICS & RISK WIDGETS   */}
          {/* ========================================================= */}
          {prescription && (
            <div className="space-y-4 pt-2 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Calibrated Field Prescription</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Target Area: {prescription.plotAreaM2.toLocaleString()} m²
                </span>
              </div>

              {/* BENTO GRID: Metrics 1 & 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bento Metric 1: 20L Backpack Tanks Needed */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-lg flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Gauge className="w-4 h-4 text-emerald-400" />
                        <span>Backpack Sprayer Tanks</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                        20L / Tank
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-4xl font-black text-white font-mono">
                        {prescription.getTanksRounded()}
                      </span>
                      <span className="text-sm font-bold text-emerald-400">
                        Full 20L Tanks Needed
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Droplets className="w-3.5 h-3.5 text-sky-400" />
                      <span>Total Water Volume:</span>
                    </span>
                    <strong className="text-white text-sm">
                      {prescription.totalWaterLiters} Liters
                    </strong>
                  </div>
                </div>

                {/* Bento Metric 2: Recommended Dosage Per Tank */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-lg flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-28 h-28 bg-sky-500/10 rounded-full blur-xl pointer-events-none" />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FlaskConical className="w-4 h-4 text-sky-400" />
                        <span>Dosage per 20L Tank</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-mono font-bold border border-sky-500/30">
                        Concentration
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-4xl font-black text-white font-mono">
                        {prescription.dosePerTankGramsOrCc}
                      </span>
                      <span className="text-sm font-bold text-sky-400">
                        grams or cc / Tank
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-slate-300 truncate max-w-[170px]" title={prescription.productName}>
                      {prescription.productName}
                    </span>
                    <span className="font-mono text-emerald-400 font-bold shrink-0">
                      Total: {prescription.totalProductGramsOrKg}
                    </span>
                  </div>
                </div>
              </div>

              {/* Weather Risk Widget: Rain Safety Margin Meter */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-lg relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-5 h-5 text-sky-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Andean Weather & Rain Wash-Off Window
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Must apply at least 4 hours before expected rainfall to avoid chemical wash-off
                      </p>
                    </div>
                  </div>

                  {rainInfo && (
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border shrink-0 ${rainInfo.badgeClass}`}>
                      {rainInfo.label}
                    </span>
                  )}
                </div>

                {/* Rain Safety Margin Meter Gauge */}
                <div className="mt-3 bg-slate-900 rounded-xl p-3 border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      <span>Rain Forecast Window:</span>
                    </span>
                    <span className="font-bold text-sky-300">
                      {prescription.hoursBeforeRain} Hours Before Rainfall
                    </span>
                  </div>

                  {/* Meter Track */}
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-500 ${
                        prescription.hoursBeforeRain >= 4
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-rose-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (prescription.hoursBeforeRain / 8) * 100)}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-1">
                    <span>0h (Imminent Rain)</span>
                    <span className="text-amber-400 font-bold">4h Safety Threshold</span>
                    <span>8h+ (Dry Window)</span>
                  </div>
                </div>

                {rainInfo && (
                  <p className="text-xs text-slate-300 mt-2.5 leading-relaxed bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80">
                    {rainInfo.description}
                  </p>
                )}
              </div>

              {/* Economic Loss Bar */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Projected Crop Economic Loss (Untreated)
                    </span>
                  </div>
                  <span className="text-sm font-black text-rose-400 font-mono">
                    {prescription.economicLossPercentage}% Outbreak Risk
                  </span>
                </div>

                <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      riskClasses?.bar || 'bg-rose-500'
                    }`}
                    style={{ width: `${prescription.economicLossPercentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>Targeted phytosanitary control reduces loss risk to &lt; 5%</span>
                  <span className="text-rose-400 font-semibold">
                    Potential severe parcel defoliation
                  </span>
                </div>
              </div>

              {/* PPE Security Chips */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Mandatory PPE (Personal Protective Equipment):</span>
                </h5>

                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200">
                    <Hand className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Nitrile Chemical Gloves</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200">
                    <Wind className="w-3.5 h-3.5 text-sky-400" />
                    <span>Organic Vapor Respirator</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200">
                    <Glasses className="w-3.5 h-3.5 text-amber-400" />
                    <span>Splash Goggles</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200">
                    <Footprints className="w-3.5 h-3.5 text-teal-400" />
                    <span>Neoprene Rubber Boots</span>
                  </div>
                </div>

                {/* Agronomic Application Guidelines */}
                {prescription.applicationNotes.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-slate-800/80">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Field Application Guidelines:
                    </p>
                    <ul className="space-y-1">
                      {prescription.applicationNotes.map((note, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Copy / Export Action Footer */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCopyPrescription}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 border border-slate-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />}
                  <span>{copied ? 'Copied Prescription!' : 'Copy Field Prescription'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
