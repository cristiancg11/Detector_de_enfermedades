/**
 * AgroScan AI - Farm Plot History Manager (OOP Domain Layer).
 *
 * Static persistence manager responsible for maintaining phytosanitary diagnostic logs
 * in browser localStorage, structured and indexed by agricultural plot/lot.
 */

import { DiagnosticReport } from './DiagnosticReport';
import { PlotSummaryInfo, RawDiagnosticResponse, SeverityLevel } from '../types';

export class FarmPlotHistoryManager {
  private static readonly STORAGE_KEY = 'agroscan_plot_history_v1';
  private static readonly MAX_SAVED_RECORDS = 150;

  /**
   * Retrieves all saved diagnostic reports from localStorage as DiagnosticReport instances.
   */
  public static getAllReports(): DiagnosticReport[] {
    try {
      const rawData = localStorage.getItem(this.STORAGE_KEY);
      if (!rawData) {
        return [];
      }
      const parsed: RawDiagnosticResponse[] = JSON.parse(rawData);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.map((item) => DiagnosticReport.fromJSON(item));
    } catch (error) {
      console.error('Failed to load diagnostic history from localStorage:', error);
      return [];
    }
  }

  /**
   * Saves a new diagnostic report into storage, preventing duplicates.
   */
  public static saveReport(report: DiagnosticReport): void {
    try {
      const existing = this.getAllReports();
      // Remove any existing entry with the same ID
      const filtered = existing.filter((item) => item.id !== report.id);
      // Prepend the new report (most recent first)
      const updated = [report, ...filtered].slice(0, this.MAX_SAVED_RECORDS);

      const serialized = updated.map((r) => r.toJSON());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to persist diagnostic report:', error);
    }
  }

  /**
   * Returns reports grouped by farm plot/lot identifier.
   */
  public static getReportsGroupedByPlot(): Record<string, DiagnosticReport[]> {
    const all = this.getAllReports();
    const grouped: Record<string, DiagnosticReport[]> = {};

    for (const report of all) {
      const plot = report.plotIdentifier.trim() || 'Unassigned Lot';
      if (!grouped[plot]) {
        grouped[plot] = [];
      }
      grouped[plot].push(report);
    }

    return grouped;
  }

  /**
   * Retrieves all diagnostic reports for a specific plot.
   */
  public static getReportsByPlot(plotIdentifier: string): DiagnosticReport[] {
    const normalized = plotIdentifier.trim().toLowerCase();
    return this.getAllReports().filter(
      (r) => r.plotIdentifier.trim().toLowerCase() === normalized
    );
  }

  /**
   * Summarizes plot metrics (total scans, last inspection, highest severity).
   */
  public static getPlotSummaries(): PlotSummaryInfo[] {
    const grouped = this.getReportsGroupedByPlot();
    const summaries: PlotSummaryInfo[] = [];

    for (const [plotName, reports] of Object.entries(grouped)) {
      if (reports.length === 0) continue;

      // Determine highest severity
      let dominantSeverity: SeverityLevel = 'LOW';
      if (reports.some((r) => r.severityLevel === 'CRITICAL')) {
        dominantSeverity = 'CRITICAL';
      } else if (reports.some((r) => r.severityLevel === 'MODERATE')) {
        dominantSeverity = 'MODERATE';
      }

      const uniqueCrops = Array.from(new Set(reports.map((r) => r.cropType)));
      const latestDate = reports.reduce(
        (latest, r) => (r.createdAt > latest ? r.createdAt : latest),
        reports[0].createdAt
      );

      summaries.push({
        plotIdentifier: plotName,
        reportCount: reports.length,
        lastAnalysisDate: latestDate,
        dominantSeverity,
        cropsAnalyzed: uniqueCrops,
      });
    }

    // Sort by most recently analyzed plot
    return summaries.sort(
      (a, b) => b.lastAnalysisDate.getTime() - a.lastAnalysisDate.getTime()
    );
  }

  /**
   * Deletes a specific report by UUID.
   */
  public static deleteReport(id: string): void {
    try {
      const existing = this.getAllReports();
      const updated = existing.filter((item) => item.id !== id);
      const serialized = updated.map((r) => r.toJSON());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  }

  /**
   * Clears all saved diagnostic history.
   */
  public static clearHistory(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear diagnostic history:', error);
    }
  }

  /**
   * Exports full plot history as a downloadable JSON string.
   */
  public static exportHistoryJSON(): string {
    const reports = this.getAllReports().map((r) => r.toJSON());
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        totalRecords: reports.length,
        records: reports,
      },
      null,
      2
    );
  }

  /**
   * Imports diagnostic history from external JSON string.
   */
  public static importHistoryJSON(jsonData: string): boolean {
    try {
      const parsed = JSON.parse(jsonData);
      const records: RawDiagnosticResponse[] = parsed.records || parsed;
      if (!Array.isArray(records)) {
        return false;
      }
      for (const raw of records) {
        const report = DiagnosticReport.fromJSON(raw);
        this.saveReport(report);
      }
      return true;
    } catch (error) {
      console.error('Failed to import diagnostic JSON:', error);
      return false;
    }
  }
}
