/**
 * AgroScan AI - Modern Bento Crop Scanner Component.
 *
 * Provides crop selection (Potato, Coffee, Corn, Tomato) with Andean altitude metadata,
 * farm plot input, drag-and-drop or camera capture, and Web Worker image optimization via OffscreenCanvas.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Camera,
  Cpu,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  Activity,
  Sparkles,
  MapPin,
  Clock,
  Gauge
} from 'lucide-react';
import { CropType, WorkerProcessRequest, WorkerProcessResponse } from '../types';
import { CropDiagnosticRequest } from '../models/CropDiagnosticRequest';

interface CropScannerProps {
  onScanRequest: (request: CropDiagnosticRequest, previewUrl: string) => void;
  isAnalyzing: boolean;
  selectedCrop: CropType;
  onCropChange: (crop: CropType) => void;
  plotIdentifier: string;
  onPlotChange: (plot: string) => void;
}

const CROP_OPTIONS: Array<{
  type: CropType;
  label: string;
  icon: string;
  variety: string;
  region: string;
  altitude: string;
  activeAccent: string;
}> = [
  {
    type: 'Potato',
    label: 'Potato',
    icon: '🥔',
    variety: 'Pastusa Suprema / Diacol Capiro',
    region: 'Túquerres & Pasto Plateau',
    altitude: '2,900m – 3,200m',
    activeAccent: 'border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.25)]',
  },
  {
    type: 'Coffee',
    label: 'Coffee',
    icon: '☕',
    variety: 'Castillo Nariño / Caturra Special',
    region: 'Sandoná & La Unión Canyons',
    altitude: '1,650m – 2,100m',
    activeAccent: 'border-teal-400/60 shadow-[0_0_20px_rgba(45,212,191,0.25)]',
  },
  {
    type: 'Corn',
    label: 'Corn',
    icon: '🌽',
    variety: 'Regional Amarillo / Choclo',
    region: 'Guáitara Canyon Basin',
    altitude: '1,800m – 2,500m',
    activeAccent: 'border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.25)]',
  },
  {
    type: 'Tomato',
    label: 'Tomato',
    icon: '🍅',
    variety: 'Chonto & Santa Cruz Highland',
    region: 'Buesaco & Chachagüí Valleys',
    altitude: '1,500m – 1,950m',
    activeAccent: 'border-rose-400/60 shadow-[0_0_20px_rgba(251,113,133,0.25)]',
  },
];

const PRESET_PLOTS = [
  'Plot A - North Furrow',
  'Plot B - Upper Terrace',
  'Lot 3 - High Shade Canopy',
  'Greenhouse 1 - Seedling Bed',
];

export const CropScanner: React.FC<CropScannerProps> = ({
  onScanRequest,
  isAnalyzing,
  selectedCrop,
  onCropChange,
  plotIdentifier,
  onPlotChange,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizedBlob, setOptimizedBlob] = useState<Blob | null>(null);
  const [workerMetrics, setWorkerMetrics] = useState<WorkerProcessResponse | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);

  // Initialize Web Worker
  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL('../workers/imageProcessor.worker.ts', import.meta.url),
        { type: 'module' }
      );

      workerRef.current.onmessage = (event: MessageEvent<WorkerProcessResponse>) => {
        setIsOptimizing(false);
        const data = event.data;

        if (data.success && data.optimizedBlob) {
          setOptimizedBlob(data.optimizedBlob);
          setWorkerMetrics(data);
          setErrorMsg(null);
        } else {
          setErrorMsg(data.error || 'Failed to optimize image via Web Worker.');
        }
      };

      workerRef.current.onerror = (err) => {
        console.error('Image processor worker error:', err);
        setIsOptimizing(false);
        setErrorMsg('Web Worker error occurred during background image processing.');
      };
    } catch (err) {
      console.error('Failed to initialize Web Worker:', err);
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Dispatch image to Web Worker
  const processImageWithWorker = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsOptimizing(true);
    setOptimizedBlob(null);
    setWorkerMetrics(null);
    setErrorMsg(null);

    if (workerRef.current) {
      const payload: WorkerProcessRequest = {
        imageFile: file,
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.85,
      };
      workerRef.current.postMessage(payload);
    } else {
      setOptimizedBlob(file);
      setIsOptimizing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageWithWorker(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageWithWorker(e.dataTransfer.files[0]);
    }
  };

  // Generate synthetic sample photo for rapid testing
  const handleLoadSample = (crop: CropType) => {
    onCropChange(crop);
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 900;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Foliage background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 900);
    bgGrad.addColorStop(0, '#042f2e');
    bgGrad.addColorStop(0.5, '#064e3b');
    bgGrad.addColorStop(1, '#022c22');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 900);

    // Leaf vein structure
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(600, 850);
    ctx.bezierCurveTo(600, 500, 580, 200, 600, 80);
    ctx.stroke();

    // Lateral veins
    ctx.lineWidth = 6;
    for (let y = 200; y < 800; y += 100) {
      ctx.beginPath();
      ctx.moveTo(600, y);
      ctx.lineTo(350, y - 60);
      ctx.moveTo(600, y);
      ctx.lineTo(850, y - 60);
      ctx.stroke();
    }

    // Pathological necrotic fungal spot simulation
    const lesionGrad = ctx.createRadialGradient(480, 380, 20, 480, 380, 160);
    lesionGrad.addColorStop(0, '#1c1917');
    lesionGrad.addColorStop(0.4, '#451a03');
    lesionGrad.addColorStop(0.7, '#78350f');
    lesionGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = lesionGrad;
    ctx.beginPath();
    ctx.arc(480, 380, 160, 0, Math.PI * 2);
    ctx.fill();

    // Concentric rings of Late Blight / Rust
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(480, 380, 90, 0, Math.PI * 2);
    ctx.stroke();

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `sample_${crop.toLowerCase()}_leaf.jpg`, {
        type: 'image/jpeg',
      });
      processImageWithWorker(file);
    }, 'image/jpeg', 0.92);
  };

  const handleStartAnalysis = () => {
    if (!optimizedBlob) {
      setErrorMsg('Please select or capture a crop photograph first.');
      return;
    }

    const request = new CropDiagnosticRequest({
      imageBlob: optimizedBlob,
      cropType: selectedCrop,
      plotIdentifier: plotIdentifier.trim() || 'Plot A - General Terrace',
    });

    onScanRequest(request, previewUrl || '');
  };

  return (
    <div className="relative rounded-3xl p-6 sm:p-8 bg-slate-900/80 border border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden">
      {/* Decorative Gradient Shimmer */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 opacity-80" />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              High-Tech Crop Scanning Zone
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Off-main-thread image processing & Gemini 2.5 Flash Phytopathological Vision
          </p>
        </div>

        {/* Rapid Sample Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fast Test:</span>
          </span>
          {CROP_OPTIONS.map((c) => (
            <button
              key={c.type}
              type="button"
              onClick={() => handleLoadSample(c.type)}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-300 text-xs font-semibold transition-all flex items-center gap-1 active:scale-95"
            >
              <span>{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Crop Selector Grid */}
      <div className="mb-8">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          1. Select Target Andean Crop
        </label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {CROP_OPTIONS.map((c) => {
            const isSelected = selectedCrop === c.type;
            return (
              <button
                key={c.type}
                type="button"
                onClick={() => onCropChange(c.type)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 relative flex flex-col justify-between ${
                  isSelected
                    ? `bg-slate-950/90 border-emerald-400/60 shadow-[0_0_25px_rgba(16,185,129,0.2)]`
                    : 'bg-slate-950/40 border-white/10 hover:border-white/20 hover:bg-slate-950/60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl sm:text-3xl">{c.icon}</span>
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                    {c.label}
                  </h4>
                  <p className="text-xs text-emerald-400 font-medium truncate mt-0.5">
                    {c.variety}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 truncate flex items-center gap-1">
                    <Activity className="w-2.5 h-2.5 text-slate-500" />
                    <span>{c.region}</span>
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Plot / Lot Identifier Designation */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="plot-input" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            2. Designate Farm Plot / Lot Identifier
          </label>
          <span className="text-[11px] text-slate-400 font-mono">Persisted in MongoDB Atlas</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="plot-input"
              type="text"
              value={plotIdentifier}
              onChange={(e) => onPlotChange(e.target.value)}
              placeholder="e.g., Plot A - North Furrow, Lot 4, Greenhouse 2..."
              className="w-full bg-slate-950/80 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 items-center">
            {PRESET_PLOTS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onPlotChange(preset)}
                className={`text-xs px-3 py-2 rounded-xl border transition-all ${
                  plotIdentifier === preset
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                    : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Image Upload / Capture Area */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          3. Upload or Capture Plant Photo
        </label>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-8 cursor-pointer transition-all text-center flex flex-col items-center justify-center min-h-[220px] overflow-hidden ${
            dragActive
              ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
              : previewUrl
              ? 'border-slate-700 bg-slate-950/70'
              : 'border-white/10 bg-slate-950/50 hover:border-emerald-500/40 hover:bg-slate-900/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {previewUrl ? (
            <div className="relative w-full flex flex-col items-center">
              <div className="relative max-h-64 rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                <img
                  src={previewUrl}
                  alt="Crop preview"
                  className="max-h-64 object-contain rounded-2xl"
                />

                {/* Animated Scanning Laser Overlay */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-emerald-500/15 pointer-events-none flex flex-col justify-between">
                    <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan shadow-[0_0_15px_#34d399]" />
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-emerald-400 text-emerald-400 text-xs font-black shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Gemini 2.5 Flash Vision Diagnostic Running...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-400" /> Replace Photo
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-white font-bold text-base mb-1">
                Drag and drop crop photo or click to browse
              </p>
              <p className="text-slate-400 text-xs mb-4">
                Supports High-Res Mobile Photos (JPEG, PNG, WebP)
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-medium">
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>Camera or Device Gallery</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Real-Time Web Worker OffscreenCanvas Indicator */}
      {isOptimizing && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 animate-pulse">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Cpu className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <p className="text-xs font-black text-emerald-400">
              Downscaling photo on Web Worker thread...
            </p>
            <p className="text-[11px] text-slate-400">
              OffscreenCanvas optimization active. Zero UI blocking or frame drops.
            </p>
          </div>
        </div>
      )}

      {/* Real-Time Worker Performance Metrics Pill */}
      {workerMetrics && !isOptimizing && (
        <div className="mb-6 p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Worker Compression Complete</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px] flex-wrap">
            <span className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-slate-500" />
              <span>{workerMetrics.optimizedWidth}x{workerMetrics.optimizedHeight}px</span>
            </span>
            <span className="text-slate-700">|</span>
            <span>
              Size: {Math.round((workerMetrics.originalSizeBytes || 0) / 1024)} KB →{' '}
              <strong className="text-emerald-400 font-bold">
                {Math.round((workerMetrics.optimizedSizeBytes || 0) / 1024)} KB
              </strong>{' '}
              (-{workerMetrics.compressionRatioPercent}%)
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-teal-400 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Speed: {workerMetrics.durationMs}ms</span>
            </span>
          </div>
        </div>
      )}

      {/* Error banner */}
      {errorMsg && (
        <div className="mb-6 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action Button */}
      <button
        type="button"
        disabled={isAnalyzing || isOptimizing || !optimizedBlob}
        onClick={handleStartAnalysis}
        className={`w-full py-4 px-6 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-3 shadow-xl ${
          isAnalyzing || isOptimizing || !optimizedBlob
            ? 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-white/5'
            : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] active:scale-[0.99]'
        }`}
      >
        {isAnalyzing ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
            <span>Analyzing Foliage Symptoms with Gemini 2.5 Flash...</span>
          </>
        ) : isOptimizing ? (
          <>
            <Cpu className="w-5 h-5 animate-spin text-slate-950" />
            <span>Downscaling on Worker Thread...</span>
          </>
        ) : (
          <>
            <Layers className="w-5 h-5 text-slate-950" />
            <span>Run Plant Health Diagnostic with Gemini 2.5 Flash</span>
          </>
        )}
      </button>
    </div>
  );
};
