/**
 * AgroScan AI - Plot History Drawer Component.
 *
 * Sliding sidebar panel that displays persistent phytosanitary records
 * grouped by agricultural plot / lot from localStorage.
 */

import React, { useState } from 'react';
import {
  X,
  History,
  FolderTree,
  Trash2,
  Download,
  MapPin,
  FileText
} from 'lucide-react';
import { DiagnosticReport } from '../models/DiagnosticReport';
import { FarmPlotHistoryManager } from '../models/FarmPlotHistoryManager';

interface PlotHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReport: (report: DiagnosticReport) => void;
  onReportsUpdated: () => void;
}

export const PlotHistoryDrawer: React.FC<PlotHistoryDrawerProps> = ({
  isOpen,
  onClose,
  onSelectReport,
  onReportsUpdated,
}) => {
  const [selectedPlotFilter, setSelectedPlotFilter] = useState<string | null>(null);

  const groupedReports = FarmPlotHistoryManager.getReportsGroupedByPlot();
  const plotSummaries = FarmPlotHistoryManager.getPlotSummaries();
  const allReports = FarmPlotHistoryManager.getAllReports();

  const handleExportJSON = () => {
    const jsonString = FarmPlotHistoryManager.exportHistoryJSON();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agroscan_history_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteReport = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this diagnostic record from history?')) {
      FarmPlotHistoryManager.deleteReport(id);
      onReportsUpdated();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all plot history from local storage? This action cannot be undone.')) {
      FarmPlotHistoryManager.clearHistory();
      onReportsUpdated();
    }
  };

  if (!isOpen) return null;

  const displayReports = selectedPlotFilter
    ? groupedReports[selectedPlotFilter] || []
    : allReports;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Plot Analysis History
                </h3>
                <p className="text-xs text-slate-400">
                  {allReports.length} total records across {plotSummaries.length} plots
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Plot Filters Bar */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5 text-emerald-400" />
                Filter by Lot / Plot:
              </span>
              {selectedPlotFilter && (
                <button
                  type="button"
                  onClick={() => setSelectedPlotFilter(null)}
                  className="text-[11px] text-emerald-400 hover:underline"
                >
                  Show All Plots
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <button
                type="button"
                onClick={() => setSelectedPlotFilter(null)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedPlotFilter === null
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All ({allReports.length})
              </button>
              {plotSummaries.map((summary) => (
                <button
                  key={summary.plotIdentifier}
                  type="button"
                  onClick={() => setSelectedPlotFilter(summary.plotIdentifier)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedPlotFilter === summary.plotIdentifier
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{summary.plotIdentifier}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-900/40 text-[10px]">
                    {summary.reportCount}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Reports List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {displayReports.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-500 mb-3">
                  <FileText className="w-8 h-8" />
                </div>
                <p className="text-sm font-semibold text-slate-300">No diagnostic history yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Run your first crop leaf analysis to persist logs by farm plot.
                </p>
              </div>
            ) : (
              displayReports.map((report) => {
                const styles = report.getSeverityStyles();
                return (
                  <div
                    key={report.id}
                    onClick={() => {
                      onSelectReport(report);
                      onClose();
                    }}
                    className="p-4 rounded-2xl bg-slate-950/60 hover:bg-slate-800/50 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{report.getCropIcon()}</span>
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                            {report.diseaseName}
                          </h4>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-400" />
                            {report.plotIdentifier}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}
                        >
                          {report.severityLevel}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteReport(e, report.id)}
                          title="Delete diagnostic record"
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                      {report.getSummarySnippet(120)}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60 font-mono">
                      <span>Conf: {report.formattedConfidence()}</span>
                      <span>{report.formattedDate()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={allReports.length === 0}
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              disabled={allReports.length === 0}
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 hover:text-rose-300 border border-rose-900/40 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
