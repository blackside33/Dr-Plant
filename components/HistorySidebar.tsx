
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AnalysisResultData } from '../types';

interface HistorySidebarProps {
  analyses: AnalysisResultData[];
  onSelect: (analysis: AnalysisResultData) => void;
  currentAnalysisId: string | null;
  isSelectionMode: boolean;
  selectedAnalysesIds: Set<string>;
  onSelectAnalysisForAction: (id: string) => void;
  onExitSelectionMode: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ analyses, onSelect, currentAnalysisId, isSelectionMode, selectedAnalysesIds, onSelectAnalysisForAction, onExitSelectionMode }) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-green-600 dark:text-green-400">
          {isSelectionMode ? t('selectItemsForAction') : t('historyTitle')}
        </h2>
        {isSelectionMode && (
          <button
            onClick={onExitSelectionMode}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {t('exitSelectionMode')}
          </button>
        )}
      </div>
      {analyses.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 flex-grow flex items-center justify-center">{t('noHistory')}</p>
      ) : (
        <div className="space-y-3 overflow-y-auto">
          {analyses.map((analysis) => (
            <button
              key={analysis.id}
              onClick={() => isSelectionMode ? onSelectAnalysisForAction(analysis.id) : onSelect(analysis)}
              className={`w-full text-left p-3 rounded-md transition-colors flex items-center space-x-4 rtl:space-x-reverse 
              ${isSelectionMode && selectedAnalysesIds.has(analysis.id) ? 'bg-blue-100 dark:bg-blue-800 border-2 border-blue-500 dark:border-blue-400' :
              currentAnalysisId === analysis.id && !isSelectionMode ? 'bg-green-100 dark:bg-green-800' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              {isSelectionMode && (
                <input
                  type="checkbox"
                  checked={selectedAnalysesIds.has(analysis.id)}
                  onChange={() => onSelectAnalysisForAction(analysis.id)}
                  className="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-400 rounded focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              <img src={analysis.imageUrl} alt={analysis.disease} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        analysis.severityLevel <= 3 ? 'bg-green-500' : analysis.severityLevel <= 7 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">{analysis.disease}</h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(analysis.timestamp).toLocaleString(i18n.language)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};