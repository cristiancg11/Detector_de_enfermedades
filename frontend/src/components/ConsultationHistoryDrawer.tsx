/**
 * AgroScan AI - Consultation History Drawer Component.
 *
 * Slide-over drawer displaying past plant diagnoses with timestamps,
 * crop types, diagnosed pathogens, and instant re-load capability into the viewer.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  Trash2,
  Search,
  ExternalLink,
  Calendar,
  Sparkles,
  Leaf,
} from 'lucide-react';
import { HistoryStorageService, SavedConsultation } from '../services/historyStorageService';
import { DiagnosticReport } from '../models/DiagnosticReport';

export interface ConsultationHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReport: (report: DiagnosticReport) => void;
}

export const ConsultationHistoryDrawer: React.FC<ConsultationHistoryDrawerProps> = ({
  isOpen,
  onClose,
  onSelectReport,
}) => {
  const [historyItems, setHistoryItems] = useState<SavedConsultation[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadHistory = () => {
    const items = HistoryStorageService.getConsultationHistory();
    setHistoryItems(items);
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }

    const handleUpdate = () => {
      loadHistory();
    };

    window.addEventListener('agroscan-history-updated', handleUpdate);
    return () => {
      window.removeEventListener('agroscan-history-updated', handleUpdate);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredItems = historyItems.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.crop.toLowerCase().includes(q) ||
      item.diseaseName.toLowerCase().includes(q) ||
      (item.scientificName && item.scientificName.toLowerCase().includes(q)) ||
      (item.plotName && item.plotName.toLowerCase().includes(q)) ||
      (item.formattedDate && item.formattedDate.toLowerCase().includes(q))
    );
  });

  const handleSelect = (item: SavedConsultation) => {
    try {
      const reportInstance =
        item.report instanceof DiagnosticReport
          ? item.report
          : DiagnosticReport.fromJSON(item.report);
      onSelectReport(reportInstance);
      onClose();
    } catch (err) {
      console.warn('Failed to construct DiagnosticReport instance:', err);
      if (item.report) {
        onSelectReport(item.report as any);
        onClose();
      }
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('¿Desea eliminar esta consulta del historial?')) {
      HistoryStorageService.deleteConsultation(id);
      loadHistory();
    }
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        '¿Está seguro de borrar todo el historial de consultas? Esta acción no se puede deshacer.'
      )
    ) {
      HistoryStorageService.clearHistory();
      loadHistory();
    }
  };

  const getSeverityBadge = (severity: string) => {
    const s = (severity || '').toUpperCase();
    if (s.includes('CRIT') || s.includes('SEV') || s.includes('ALTO')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300/60">
          Severidad Crítica
        </span>
      );
    }
    if (s.includes('MOD')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/60">
          Severidad Moderada
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60">
        Severidad Leve
      </span>
    );
  };

  const getCropEmoji = (crop: string) => {
    const c = (crop || '').toLowerCase();
    if (c.includes('papa') || c.includes('potato')) return '🥔';
    if (c.includes('café') || c.includes('cafe') || c.includes('coffee')) return '☕';
    if (c.includes('maíz') || c.includes('maiz') || c.includes('corn')) return '🌽';
    if (c.includes('tomate') || c.includes('tomato')) return '🍅';
    return '🌱';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Historial de Consultas
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold border border-emerald-300/60">
                  {historyItems.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Diagnósticos fitosanitarios analizados previamente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {historyItems.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Limpiar todo el historial"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por cultivo, enfermedad, fecha..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>
        </div>

        {/* Consultation List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
              <Leaf className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="font-bold text-slate-700 dark:text-slate-300 text-base">
                {searchQuery ? 'No se encontraron resultados' : 'Sin consultas guardadas'}
              </p>
              <p className="text-xs max-w-xs mt-1">
                {searchQuery
                  ? 'Intente buscar con otro nombre de patógeno o cultivo.'
                  : 'Los nuevos diagnósticos realizados se guardarán automáticamente aquí para su posterior consulta.'}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className="group relative p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50/50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl" role="img" aria-label={item.crop}>
                      {getCropEmoji(item.crop)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {item.crop}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                          {item.plotName}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white mt-0.5 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {item.diseaseName}
                      </h4>
                      {item.scientificName && (
                        <p className="text-xs italic text-emerald-700 dark:text-emerald-400 font-serif">
                          {item.scientificName}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {getSeverityBadge(item.severity)}
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-500" />
                      {Math.round(item.confidence * 100)}% Certeza
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                    <Calendar className="w-3 h-3" />
                    <span>{item.formattedDate}</span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-end text-emerald-600 dark:text-emerald-400 text-xs font-bold gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Reabrir Diagnóstico</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Total en memoria local: {historyItems.length} registros</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultationHistoryDrawer;
