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

export type FarmerRole =
  | 'Smallholder Farmer'
  | 'Agronomist / Extensionist'
  | 'Cooperative Producer'
  | 'Agricultural Researcher';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  farmName: string;
  municipality: string;
  role: FarmerRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    farm_name: string;
    municipality: string;
    role: FarmerRole;
    avatar_url?: string;
    created_at: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface ChatFollowUpRequest {
  diagnostic_id: string;
  message: string;
  chat_history?: ChatMessage[];
}

export interface ChatFollowUpResponse {
  reply: string;
  suggested_followups: string[];
  timestamp: string;
}


