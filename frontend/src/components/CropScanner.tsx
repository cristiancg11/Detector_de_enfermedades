/**
 * AgroScan AI - Cyber-Agronomic Crop Scanner Component.
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
  Leaf,
  Activity,
  Zap
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
  colorBorder: string;
}> = [
  {
    type: 'Potato',
    label: 'Potato',
    icon: '🥔',
    variety: 'Pastusa Suprema / Diacol Capiro',
    region: 'Túquerres & Pasto',
    altitude: '2,900m – 3,200m',
    colorBorder: 'hover:border-neon-solar',
  },
  {
    type: 'Coffee',
    label: 'Coffee',
    icon: '☕',
    variety: 'Castillo Nariño / Caturra',
    region: 'Sandoná & La Unión',
    altitude: '1,650m – 2,100m',
    colorBorder: 'hover:border-neon-sky',
  },
  {
    type: 'Corn',
    label: 'Corn',
    icon: '🌽',
    variety: 'Regional Amarillo / Choclo',
    region: 'Guáitara Canyon Basin',
    altitude: '1,800m – 2,500m',
    colorBorder: 'hover:border-neon-solar',
  },
  {
    type: 'Tomato',
    label: 'Tomato',
    icon: '🍅',
    variety: 'Chonto & Santa Cruz',
    region: 'Buesaco & Chachagüí',
    altitude: '1,500m – 1,950m',
    colorBorder: 'hover:border-neon-danger',
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
  const [imageFile, setImageFile] = useState<File | null>(null);
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
    setImageFile(file);
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
    ctx.strokeStyle = '#00f59b';
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
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(600, y);
      ctx.lineTo(850, y - 60);
      ctx.stroke();
    }

    // Symptom lesions
    if (crop === 'Potato') {
      ctx.fillStyle = 'rgba(67, 34, 15, 0.9)';
      ctx.beginPath();
      ctx.ellipse(450, 380, 95, 65, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffb703';
      ctx.lineWidth = 5;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(780, 520, 110, 80, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (crop === 'Coffee') {
      ctx.fillStyle = 'rgba(234, 88, 12, 0.95)';
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(420 + i * 50, 400 + (i % 3) * 60, 28, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (crop === 'Corn') {
      ctx.fillStyle = '#030712';
      ctx.beginPath();
      ctx.ellipse(500, 450, 130, 45, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(720, 320, 90, 50, -0.3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.arc(550, 480, 70, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(550, 480, 40, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(550, 480, 15, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(`Andean Phytosanitary Sample: ${crop}`, 60, 840);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `sample_${crop.toLowerCase()}_leaf.jpg`, {
          type: 'image/jpeg',
        });
        processImageWithWorker(file);
      }
    }, 'image/jpeg', 0.95);
  };

  const handleStartAnalysis = () => {
    if (!optimizedBlob) {
      setErrorMsg('Please select or upload a crop photo to analyze.');
      return;
    }

    if (!plotIdentifier.trim()) {
      setErrorMsg('Please designate a farm plot or lot name.');
      return;
    }

    try {
      const request = new CropDiagnosticRequest({
        cropType: selectedCrop,
        plotIdentifier: plotIdentifier.trim(),
        imageBlob: optimizedBlob,
        fileName: imageFile?.name || `${selectedCrop.toLowerCase()}_sample.jpg`,
        compressionDurationMs: workerMetrics?.durationMs,
        originalSizeBytes: workerMetrics?.originalSizeBytes,
      });

      onScanRequest(request, previewUrl || '');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error preparing diagnostic request.');
    }
  };

  return (
    <div className="relative rounded-3xl p-6 sm:p-9 overflow-hidden bg-obsidian-900/90 border border-slate-700/70 shadow-2xl backdrop-blur-2xl">
      {/* Bioluminescent Background Orbs */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-neon-flora/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-neon-sky/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-flora/10 border border-neon-flora/30 text-neon-flora text-xs font-bold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5" />
            AI Phytosanitary Vision Radar
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Diagnose Andean Crop Health
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Engineered for mountain farming microclimates in Nariño (1,500m – 3,200m a.s.l.)
          </p>
        </div>

        {/* Quick Demo Sample Selector */}
        <div className="flex items-center gap-1.5 bg-obsidian-950/80 p-1.5 rounded-2xl border border-slate-800 text-xs shadow-inner">
          <span className="text-slate-400 text-[11px] font-bold px-2 flex items-center gap-1">
            <Leaf className="w-3.5 h-3.5 text-neon-flora" /> Test Samples:
          </span>
          {CROP_OPTIONS.map((c) => (
            <button
              key={`sample-${c.type}`}
              type="button"
              onClick={() => handleLoadSample(c.type)}
              title={`Load sample ${c.label} leaf`}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-neon-flora/20 hover:text-neon-flora text-slate-300 transition-all font-semibold flex items-center gap-1 active:scale-95 border border-transparent hover:border-neon-flora/30 text-xs"
            >
              <span>{c.icon}</span>
              <span className="hidden md:inline">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Crop Selector Grid */}
      <div className="mb-8">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>1. Select Target Crop</span>
          <span className="text-neon-flora text-xs font-normal lowercase">(varieties typical of Nariño)</span>
        </label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {CROP_OPTIONS.map((c) => {
            const isSelected = selectedCrop === c.type;
            return (
              <button
                key={c.type}
                type="button"
                onClick={() => onCropChange(c.type)}
                className={`relative flex flex-col items-start p-4 rounded-2xl border transition-all text-left group overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-b from-neon-flora/20 to-obsidian-950 border-neon-flora shadow-[0_0_25px_rgba(0,245,155,0.25)]'
                    : `bg-obsidian-950/70 border-slate-800/90 ${c.colorBorder} hover:bg-slate-800/40`
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-3xl filter drop-shadow">{c.icon}</span>
                  {isSelected ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-neon-flora shadow-[0_0_10px_#00f59b] animate-ping" />
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">{c.altitude}</span>
                  )}
                </div>
                <span className="text-base font-extrabold text-white tracking-wide">{c.label}</span>
                <span className="text-xs text-neon-flora font-medium line-clamp-1">{c.variety}</span>
                <span className="text-[10px] text-slate-400 mt-1 line-clamp-1 flex items-center gap-1">
                  <Activity className="w-2.5 h-2.5 text-slate-500" />
                  {c.region}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Plot / Lot Identifier Input */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="plot-input" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            2. Designate Farm Plot / Lot Identifier
          </label>
          <span className="text-xs text-slate-400">Indexed for batch history</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              id="plot-input"
              type="text"
              value={plotIdentifier}
              onChange={(e) => onPlotChange(e.target.value)}
              placeholder="e.g., Plot A - North Furrow, Lot 4, Greenhouse 2..."
              className="w-full bg-obsidian-950/80 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-neon-flora focus:ring-1 focus:ring-neon-flora transition-colors"
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
                    ? 'bg-neon-flora/20 border-neon-flora/60 text-neon-flora font-bold shadow-[0_0_15px_rgba(0,245,155,0.2)]'
                    : 'bg-obsidian-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Image Capture & Drop Area */}
      <div className="mb-8">
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
              ? 'border-neon-flora bg-neon-flora/10 scale-[1.01]'
              : previewUrl
              ? 'border-slate-700 bg-obsidian-950/60'
              : 'border-slate-800 bg-obsidian-950/50 hover:border-slate-700 hover:bg-slate-900/40'
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
              <div className="relative max-h-64 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl group">
                <img
                  src={previewUrl}
                  alt="Crop preview"
                  className="max-h-64 object-contain rounded-2xl"
                />

                {/* Animated Scanning Grid Overlay */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-neon-flora/15 pointer-events-none flex flex-col justify-between">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-neon-flora to-transparent animate-scan" />
                    <div className="absolute inset-0 flex items-center justify-center bg-obsidian-950/60 backdrop-blur-xs">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-obsidian-900 border border-neon-flora text-neon-flora text-xs font-black shadow-[0_0_20px_rgba(0,245,155,0.4)] animate-pulse">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Gemini 2.5 Flash Vision Diagnostic Running...
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
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" /> Replace Photo
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-neon-flora/10 border border-neon-flora/30 flex items-center justify-center text-neon-flora mb-4 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,245,155,0.15)]">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-white font-bold text-base mb-1">
                Drag and drop crop photo or click to browse
              </p>
              <p className="text-slate-400 text-xs mb-4">
                Supports High-Res Mobile Photos (JPEG, PNG, WebP)
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-medium">
                <Camera className="w-3.5 h-3.5 text-neon-flora" />
                <span>Camera or Device Gallery</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Real-Time Web Worker OffscreenCanvas Indicator */}
      {isOptimizing && (
        <div className="mb-6 p-4 rounded-2xl bg-neon-flora/10 border border-neon-flora/30 flex items-center gap-3 animate-pulse">
          <div className="w-9 h-9 rounded-xl bg-neon-flora/20 flex items-center justify-center text-neon-flora shrink-0">
            <Cpu className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <p className="text-xs font-black text-neon-flora">
              Optimizing photo on background thread...
            </p>
            <p className="text-[11px] text-slate-400">
              Downscaling off-main-thread with OffscreenCanvas to prevent UI lockup.
            </p>
          </div>
        </div>
      )}

      {/* Worker Performance Metrics Pill */}
      {workerMetrics && !isOptimizing && (
        <div className="mb-6 p-3.5 rounded-2xl bg-obsidian-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-neon-flora font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Web Worker Optimization Complete</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span>
              Dim: {workerMetrics.optimizedWidth}x{workerMetrics.optimizedHeight}px
            </span>
            <span className="text-slate-600">|</span>
            <span>
              Size: {Math.round((workerMetrics.originalSizeBytes || 0) / 1024)} KB →{' '}
              <strong className="text-neon-flora font-bold">
                {Math.round((workerMetrics.optimizedSizeBytes || 0) / 1024)} KB
              </strong>{' '}
              (-{workerMetrics.compressionRatioPercent}%)
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-neon-sky font-bold">Speed: {workerMetrics.durationMs}ms</span>
          </div>
        </div>
      )}

      {/* Error banner */}
      {errorMsg && (
        <div className="mb-6 p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
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
            ? 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-700/50'
            : 'bg-gradient-to-r from-neon-flora via-emerald-400 to-neon-sky hover:from-emerald-300 hover:to-cyan-400 text-obsidian-950 shadow-[0_0_30px_rgba(0,245,155,0.3)] hover:shadow-[0_0_40px_rgba(0,245,155,0.5)] active:scale-[0.99]'
        }`}
      >
        {isAnalyzing ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin text-obsidian-950" />
            <span>Analyzing Symptoms with Gemini 2.5 Flash...</span>
          </>
        ) : isOptimizing ? (
          <>
            <Cpu className="w-5 h-5 animate-spin text-obsidian-950" />
            <span>Downscaling on Worker Thread...</span>
          </>
        ) : (
          <>
            <Layers className="w-5 h-5 text-obsidian-950" />
            <span>Run Plant Health Diagnostic with Gemini 2.5 Flash</span>
          </>
        )}
      </button>
    </div>
  );
};
