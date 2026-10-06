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
}> = [
  {
    type: 'Potato',
    label: 'Potato',
    icon: '🥔',
    variety: 'Pastusa Suprema / Diacol Capiro',
    region: 'Túquerres & Pasto Plateau',
    altitude: '2,900m – 3,200m',
  },
  {
    type: 'Coffee',
    label: 'Coffee',
    icon: '☕',
    variety: 'Castillo Nariño / Caturra Special',
    region: 'Sandoná & La Unión Canyons',
    altitude: '1,650m – 2,100m',
  },
  {
    type: 'Corn',
    label: 'Corn',
    icon: '🌽',
    variety: 'Regional Amarillo / Choclo',
    region: 'Guáitara Canyon Basin',
    altitude: '1,800m – 2,500m',
  },
  {
    type: 'Tomato',
    label: 'Tomato',
    icon: '🍅',
    variety: 'Chonto & Santa Cruz Highland',
    region: 'Buesaco & Chachagüí Valleys',
    altitude: '1,500m – 1,950m',
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
    bgGrad.addColorStop(0, '#064e3b');
    bgGrad.addColorStop(0.5, '#047857');
    bgGrad.addColorStop(1, '#022c22');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 900);

    // Leaf vein structure
    ctx.strokeStyle = '#34d399';
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
    lesionGrad.addColorStop(0.4, '#78350f');
    lesionGrad.addColorStop(0.7, '#b45309');
    lesionGrad.addColorStop(1, 'rgba(52, 211, 153, 0)');
    ctx.fillStyle = lesionGrad;
    ctx.beginPath();
    ctx.arc(480, 380, 160, 0, Math.PI * 2);
    ctx.fill();

    // Concentric rings of Late Blight / Rust
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
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
    <div className="relative rounded-3xl p-6 sm:p-8 bg-white border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all overflow-hidden">
      {/* Decorative Gradient Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-500" />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Crop Health Scanning Station
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Off-main-thread image processing & Google Gemini 2.5 Flash Vision Diagnostics
          </p>
        </div>

        {/* Rapid Sample Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fast Test:</span>
          </span>
          {CROP_OPTIONS.map((c) => (
            <button
              key={c.type}
              type="button"
              onClick={() => handleLoadSample(c.type)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-xs font-bold transition-all flex items-center gap-1 active:scale-95 shadow-sm"
            >
              <span>{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Crop Selector Grid */}
      <div className="mb-8">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
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
                    ? `bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm`
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl sm:text-3xl">{c.icon}</span>
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                    {c.label}
                  </h4>
                  <p className="text-xs text-emerald-700 font-bold truncate mt-0.5">
                    {c.variety}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 truncate flex items-center gap-1 font-medium">
                    <Activity className="w-2.5 h-2.5 text-slate-400" />
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
          <label htmlFor="plot-input" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            2. Designate Farm Plot / Lot Identifier
          </label>
          <span className="text-[11px] text-slate-500 font-medium">Persisted in MongoDB Atlas</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="plot-input"
              type="text"
              value={plotIdentifier}
              onChange={(e) => onPlotChange(e.target.value)}
              placeholder="e.g., Plot A - North Furrow, Lot 4, Greenhouse 2..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors shadow-sm"
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
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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
              ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
              : previewUrl
              ? 'border-slate-200 bg-slate-50/40'
              : 'border-slate-300 bg-slate-50/70 hover:border-emerald-400 hover:bg-emerald-50/20'
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
              <div className="relative max-h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-md group">
                <img
                  src={previewUrl}
                  alt="Crop preview"
                  className="max-h-64 object-contain rounded-2xl"
                />

                {/* Animated Scanning Laser Overlay */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none flex flex-col justify-between">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-scan" />
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-xs">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-emerald-500 text-emerald-800 text-xs font-bold shadow-lg animate-pulse">
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
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
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition-colors shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-600" /> Replace Photo
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-sm">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-slate-900 font-extrabold text-base mb-1">
                Drag and drop crop photo or click to browse
              </p>
              <p className="text-slate-500 text-xs mb-4 font-medium">
                Supports High-Res Mobile Photos (JPEG, PNG, WebP)
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-sm">
                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                <span>Camera or Device Gallery</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Real-Time Web Worker OffscreenCanvas Indicator */}
      {isOptimizing && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 animate-pulse">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <Cpu className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-900">
              Downscaling photo on Web Worker thread...
            </p>
            <p className="text-[11px] text-emerald-700">
              OffscreenCanvas optimization active. Zero UI blocking or frame drops.
            </p>
          </div>
        </div>
      )}

      {/* Real-Time Worker Performance Metrics Pill */}
      {workerMetrics && !isOptimizing && (
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Worker Compression Complete</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600 font-mono text-[11px] flex-wrap">
            <span className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-slate-400" />
              <span>{workerMetrics.optimizedWidth}x{workerMetrics.optimizedHeight}px</span>
            </span>
            <span className="text-slate-300">|</span>
            <span>
              Size: {Math.round((workerMetrics.originalSizeBytes || 0) / 1024)} KB →{' '}
              <strong className="text-emerald-700 font-bold">
                {Math.round((workerMetrics.optimizedSizeBytes || 0) / 1024)} KB
              </strong>{' '}
              (-{workerMetrics.compressionRatioPercent}%)
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-sky-700 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-600" />
              <span>Speed: {workerMetrics.durationMs}ms</span>
            </span>
          </div>
        </div>
      )}

      {/* Error banner */}
      {errorMsg && (
        <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action Button */}
      <button
        type="button"
        disabled={isAnalyzing || isOptimizing || !optimizedBlob}
        onClick={handleStartAnalysis}
        className={`w-full py-4 px-6 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-3 shadow-md ${
          isAnalyzing || isOptimizing || !optimizedBlob
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-soft active:scale-[0.99]'
        }`}
      >
        {isAnalyzing ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin text-white" />
            <span>Analyzing Foliage Symptoms with Gemini 2.5 Flash...</span>
          </>
        ) : isOptimizing ? (
          <>
            <Cpu className="w-5 h-5 animate-spin text-white" />
            <span>Downscaling on Worker Thread...</span>
          </>
        ) : (
          <>
            <Layers className="w-5 h-5 text-white" />
            <span>Run Plant Health Diagnostic with Gemini 2.5 Flash</span>
          </>
        )}
      </button>
    </div>
  );
};
