/**
 * AgroScan AI - Modern Plot History Drawer Component.
 *
 * Sliding sidebar panel that displays persistent phytosanitary records
 * grouped by agricultural plot / lot from MongoDB Atlas and localStorage with search filtering.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  Trash2,
  Download,
  MapPin,
  FileText,
  Search,
  Database
} from 'lucide-react';
import { DiagnosticReport } from '../models/DiagnosticReport';
import { FarmPlotHistoryManager } from '../models/FarmPlotHistoryManager';
import { ApiService } from '../services/apiService';

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cloudSyncing, setCloudSyncing] = useState<boolean>(false);

  const groupedReports = FarmPlotHistoryManager.getReportsGroupedByPlot();
  const plotSummaries = FarmPlotHistoryManager.getPlotSummaries();
  const allReports = FarmPlotHistoryManager.getAllReports();

  // Attempt to sync from MongoDB Atlas when opened
  useEffect(() => {
    if (isOpen) {
      setCloudSyncing(true);
      ApiService.getHistory()
        .then((res) => {
          if (res.items && res.items.length > 0) {
            for (const item of res.items) {
              FarmPlotHistoryManager.saveReport(item);
            }
            onReportsUpdated();
          }
        })
        .finally(() => setCloudSyncing(false));
    }
  }, [isOpen]);

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

  const baseReports = selectedPlotFilter
    ? groupedReports[selectedPlotFilter] || []
    : allReports;

  const displayReports = searchQuery.trim()
    ? baseReports.filter(
        (r) =>
          r.diseaseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.plotIdentifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.cropType.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : baseReports;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Translucent Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-slate-950/95 border-l border-white/10 shadow-2xl flex flex-col backdrop-blur-2xl">
          {/* Drawer Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 p-0.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
                  <History className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
                  <span>Farm Plots & History</span>
                  {cloudSyncing && (
                    <span className="text-[10px] text-teal-400 font-mono animate-pulse flex items-center gap-1">
                      <Database className="w-3 h-3" /> Syncing...
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  {allReports.length} records persisted across monitored lots
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Actions Bar */}
          <div className="p-4 border-b border-white/10 bg-slate-900/40 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by disease, plot, or crop..."
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportJSON}
                  disabled={allReports.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold disabled:opacity-40 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-teal-400" />
                  <span>Export JSON</span>
                </button>
              </div>

              {allReports.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          {/* Plot Summary Filter Pills */}
          {plotSummaries.length > 0 && (
            <div className="px-4 py-3 border-b border-white/10 bg-slate-950/60 overflow-x-auto">
              <div className="flex items-center gap-2 min-w-max">
                <button
                  type="button"
                  onClick={() => setSelectedPlotFilter(null)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    selectedPlotFilter === null
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Plots ({allReports.length})
                </button>

                {plotSummaries.map((summary) => (
                  <button
                    key={summary.plotIdentifier}
                    type="button"
                    onClick={() =>
                      setSelectedPlotFilter(
                        selectedPlotFilter === summary.plotIdentifier
                          ? null
                          : summary.plotIdentifier
                      )
                    }
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                      selectedPlotFilter === summary.plotIdentifier
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{summary.plotIdentifier}</span>
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center text-slate-300 font-mono">
                      {summary.reportCount}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Report Item Cards */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {displayReports.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <FileText className="w-12 h-12 mb-3 text-slate-600" />
                <p className="text-sm font-semibold text-slate-400">No diagnostic reports found</p>
                <p className="text-xs text-slate-500 mt-1">
                  Run a crop diagnostic to record analysis in persistent memory.
                </p>
              </div>
            ) : (
              displayReports.map((report) => {
                const pathogenBadge = report.getPathogenBadge();
                return (
                  <div
                    key={report.id}
                    onClick={() => {
                      onSelectReport(report);
                      onClose();
                    }}
                    className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 hover:border-emerald-500/40 hover:bg-slate-900 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{report.getCropIcon()}</span>
                        <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {report.diseaseName}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteReport(e, report.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="Delete report"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-2 flex-wrap text-[11px]">
                      <span className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-white/10">
                        {report.cropType}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${pathogenBadge.badgeClass}`}>
                        {pathogenBadge.label}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          report.severityLevel === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300'
                            : report.severityLevel === 'MODERATE'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {report.severityLevel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                      <span className="flex items-center gap-1 font-mono text-slate-400">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span className="truncate max-w-[140px]">{report.plotIdentifier}</span>
                      </span>
                      <span className="font-mono text-slate-500">{report.formattedDate()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
