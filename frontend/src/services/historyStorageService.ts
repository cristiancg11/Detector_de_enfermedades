/**
 * AgroScan AI - Consultation History Storage Service.
 *
 * Persists every completed diagnosis automatically to both local cache (localStorage)
 * and the FastAPI / MongoDB Atlas backend when authenticated.
 * Enables instant retrieval, re-loading into the diagnostic viewer, and reactive UI updates.
 */

import { AuthSession } from '../models/AuthSession';
import { ApiService, API_BASE_URL } from './apiService';
import { FarmPlotHistoryManager } from '../models/FarmPlotHistoryManager';

export interface SavedConsultation {
  id: string;
  crop: string;
  diseaseName: string;
  scientificName: string;
  severity: string;
  confidence: number;
  timestamp: number;
  formattedDate: string;
  plotName: string;
  imageUrl?: string;
  report: any;
}

const STORAGE_KEY = 'agroscan_history_cache';
const MAX_HISTORY_ITEMS = 50;

export class HistoryStorageService {
  /**
   * Reads consultation history from localStorage with automatic fallback to FarmPlotHistoryManager.
   */
  public static getConsultationHistory(): SavedConsultation[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to parse agroscan_history_cache:', err);
    }

    // Hydrate from existing FarmPlotHistoryManager reports if cache is empty
    try {
      const reports = FarmPlotHistoryManager.getAllReports();
      if (reports && reports.length > 0) {
        const converted: SavedConsultation[] = reports.map((r: any) => ({
          id: r.id || `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          crop: r.cropType || r.crop_type || 'Cultivo',
          diseaseName: r.diseaseName || r.disease_name || 'Patología Foliar',
          scientificName: r.scientificName || r.scientific_name || 'Phytophthora infestans',
          severity: r.severityLevel || r.severity_level || 'MODERATE',
          confidence: Number(r.confidenceScore || r.confidence_score || 0.9),
          timestamp: r.timestamp ? new Date(r.timestamp).getTime() : Date.now(),
          formattedDate: new Date(r.timestamp || Date.now()).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          plotName: r.plotIdentifier || r.plot_identifier || 'Lote Principal',
          imageUrl: r.imageUrl || r.image_url,
          report: typeof r.toJSON === 'function' ? r.toJSON() : r,
        }));
        this.writeLocalCache(converted);
        return converted;
      }
    } catch (err) {
      console.warn('Fallback hydration from FarmPlotHistoryManager failed:', err);
    }

    return [];
  }

  /**
   * Persists a newly completed diagnosis locally and dispatches to the backend.
   */
  public static async saveConsultation(
    report: any,
    cropType?: string,
    plotIdentifier?: string,
    imageUrl?: string
  ): Promise<SavedConsultation> {
    const rawData = typeof report?.toJSON === 'function' ? report.toJSON() : report;

    const id =
      rawData?.id ||
      rawData?._id ||
      report?.id ||
      `diag-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const crop =
      cropType ||
      rawData?.crop_type ||
      rawData?.cropType ||
      report?.cropType ||
      report?.crop_type ||
      'Cultivo';

    const diseaseName =
      rawData?.disease_name ||
      rawData?.diseaseName ||
      report?.diseaseName ||
      report?.disease_name ||
      'Tizón Tardío (Gota)';

    const scientificName =
      rawData?.scientific_name ||
      rawData?.scientificName ||
      report?.scientificName ||
      report?.scientific_name ||
      'Phytophthora infestans';

    const severity =
      rawData?.severity_level ||
      rawData?.severityLevel ||
      rawData?.severity ||
      report?.severityLevel ||
      'MODERATE';

    const confidence = Number(
      rawData?.confidence_score ??
      rawData?.confidenceScore ??
      rawData?.confidence ??
      report?.confidenceScore ??
      0.9
    );

    const plotName =
      plotIdentifier ||
      rawData?.plot_identifier ||
      rawData?.plotIdentifier ||
      report?.plotIdentifier ||
      'Lote Principal';

    const itemImg = imageUrl || rawData?.image_url || rawData?.imageUrl || report?.imageUrl;

    const timestamp = Date.now();
    const formattedDate = new Date(timestamp).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newItem: SavedConsultation = {
      id,
      crop,
      diseaseName,
      scientificName,
      severity: String(severity).toUpperCase(),
      confidence,
      timestamp,
      formattedDate,
      plotName,
      imageUrl: itemImg,
      report: rawData,
    };

    // 1. Update local cache (newest first, max items limit)
    const existing = this.getConsultationHistory();
    const filtered = existing.filter((item) => item.id !== id);
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    this.writeLocalCache(updated);

    // 2. Also keep FarmPlotHistoryManager synchronized
    try {
      if (typeof FarmPlotHistoryManager?.saveReport === 'function') {
        FarmPlotHistoryManager.saveReport(report);
      }
    } catch {
      // Ignored
    }

    // 3. Dispatch global event for reactive UI components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('agroscan-history-updated', {
          detail: { newConsultation: newItem, total: updated.length },
        })
      );
    }

    // 4. Asynchronously notify backend if user is authenticated
    if (AuthSession.isAuthenticated()) {
      this.syncWithBackend(newItem).catch((err) => {
        console.warn('[HistoryStorage] Remote sync skipped or failed:', err?.message);
      });
    }

    return newItem;
  }

  /**
   * Deletes a consultation by ID.
   */
  public static deleteConsultation(id: string): void {
    const list = this.getConsultationHistory();
    const updated = list.filter((item) => item.id !== id);
    this.writeLocalCache(updated);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('agroscan-history-updated', {
          detail: { removedId: id, total: updated.length },
        })
      );
    }
  }

  /**
   * Clears all stored consultation history.
   */
  public static clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear history cache:', err);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('agroscan-history-updated', {
          detail: { cleared: true, total: 0 },
        })
      );
    }
  }

  /**
   * Submits diagnosis payload to backend history endpoint when authenticated.
   */
  private static async syncWithBackend(item: SavedConsultation): Promise<void> {
    try {
      await ApiService.authFetch(
        `${API_BASE_URL}/history`,
        {
          method: 'POST',
          body: JSON.stringify({
            id: item.id,
            crop_type: item.crop,
            disease_name: item.diseaseName,
            scientific_name: item.scientificName,
            severity_level: item.severity,
            confidence_score: item.confidence,
            plot_identifier: item.plotName,
            image_url: item.imageUrl,
            timestamp: new Date(item.timestamp).toISOString(),
            raw_report: item.report,
          }),
        },
        true
      );
    } catch {
      // Non-blocking fallback
    }
  }

  /**
   * Writes the array to localStorage safely.
   */
  private static writeLocalCache(items: SavedConsultation[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn('Failed to write to localStorage:', err);
    }
  }
}

export default HistoryStorageService;

