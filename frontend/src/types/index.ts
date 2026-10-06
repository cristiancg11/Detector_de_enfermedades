/**
 * Shared TypeScript type definitions and interfaces for AgroScan AI.
 */

export type CropType = 'Potato' | 'Coffee' | 'Corn' | 'Tomato';

export type PathogenType = 'FUNGUS' | 'BACTERIA' | 'VIRUS' | 'PEST' | 'HEALTHY';

export type SeverityLevel = 'LOW' | 'MODERATE' | 'CRITICAL';

export interface RawDiagnosticResponse {
  id: string;
  crop_type: CropType;
  plot_identifier: string;
  pathogen_type: PathogenType;
  severity_level: SeverityLevel;
  disease_name: string;
  scientific_name?: string | null;
  confidence_score: number;
  symptoms: string[];
  diagnosis_summary: string;
  organic_treatment: string[];
  chemical_treatment: string[];
  preventive_measures: string[];
  created_at: string;
  image_url?: string;
}

export interface WorkerProcessRequest {
  imageFile: File | Blob;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface WorkerProcessResponse {
  success: boolean;
  optimizedBlob?: Blob;
  previewUrl?: string;
  originalWidth?: number;
  originalHeight?: number;
  optimizedWidth?: number;
  optimizedHeight?: number;
  originalSizeBytes?: number;
  optimizedSizeBytes?: number;
  compressionRatioPercent?: number;
  durationMs?: number;
  error?: string;
}

export interface PlotSummaryInfo {
  plotIdentifier: string;
  reportCount: number;
  lastAnalysisDate: Date;
  dominantSeverity: SeverityLevel;
  cropsAnalyzed: CropType[];
}
