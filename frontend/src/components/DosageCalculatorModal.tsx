/**
 * AgroScan AI - Glassmorphic Dosage Calculator Modal Component.
 *
 * Configures field parameters (plot area, backpack sprayer capacity, application method)
 * and dispatches AI agronomic dosage calibration & Andean weather window analysis.
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
}

export const DosageCalculatorModal: React.FC<DosageCalculatorModalProps> = ({
  isOpen,
  onClose,
  diagnosticId,
  cropType,
  diseaseName,
  onCalculate,
}) => {
  const [plotAreaM2, setPlotAreaM2] = useState<number>(2500);
  const [sprayerCapacity, setSprayerCapacity] = useState<number>(20);
  const [applicationMethod, setApplicationMethod] = useState<string>('Manual 20L Backpack');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [prescription, setPrescription] = useState<DosagePrescription | null>(null);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Glassmorphic Modal Dialog Box */}
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-emerald-500/30 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 z-10 my-auto transition-all overflow-hidden">
        {/* Ambient Emerald & Cyan Glow */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/60">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-tight">
                  Backpack Sprayer AI Dosage Calculator
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold uppercase">
                  20L Standard
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {cropType} • <strong className="text-slate-200">{diseaseName}</strong>
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

        {/* Input Parameters Form */}
        <form onSubmit={handleCompute} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Plot Area */}
            <div>
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
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                {(plotAreaM2 / 10000).toFixed(2)} Hectares
              </span>
            </div>

            {/* Backpack Tank Capacity */}
            <div>
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
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Standard Andean 20L backpack
              </span>
            </div>

            {/* Application Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-teal-400" />
                <span>Sprayer Rig</span>
              </label>
              <div className="relative">
                <select
                  value={applicationMethod}
                  onChange={(e) => setApplicationMethod(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none pr-8 cursor-pointer"
                >
                  <option value="Manual 20L Backpack">Manual 20L Backpack</option>
                  <option value="Motorized Mist Blower">Motorized Mist Blower</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Cone nozzle calibration
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

        {/* Loading Indicator Animation */}
        {isLoading && (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-3 animate-pulse">
            <CloudRain className="w-6 h-6 text-emerald-400 animate-bounce" />
            <p className="text-xs text-emerald-300 font-medium">
              Simulating Andean altitude barometric pressure, foliar wash-off rate, and 20L backpack tank requirements...
            </p>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
