import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactDOM from 'react-dom/client';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { AnalysisResultData } from '../types';
import AnalysisReport from './AnalysisReport'; 
import { DownloadIcon } from './icons';

interface HistorySidebarProps {
  analyses: AnalysisResultData[];
  onSelect: (analysis: AnalysisResultData) => void;
  currentAnalysisId: string | null;
  onDeleteSelected: (ids: string[]) => void;
}

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);


export const HistorySidebar: React.FC<HistorySidebarProps> = ({ analyses, onSelect, currentAnalysisId, onDeleteSelected }) => {
  const { t, i18n } = useTranslation();
  const [selectedIds, setSelectedIds] = useState(new Set<string>());
  const [isDownloading, setIsDownloading] = useState(false);

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    });
  };

  const handleDeleteClick = () => {
    if (window.confirm(t('confirmDelete'))) {
      onDeleteSelected(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const handleDownloadSelected = async () => {
    setIsDownloading(true);

    const selectedAnalyses = analyses.filter(a => selectedIds.has(a.id));

    for (const analysis of selectedAnalyses) {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        container.style.width = '896px'; // A reasonable width for rendering
        document.body.appendChild(container);
        
        const root = ReactDOM.createRoot(container);
        root.render(
            <React.StrictMode>
                <AnalysisReport analysis={analysis} />
            </React.StrictMode>
        );

        await new Promise(resolve => setTimeout(resolve, 300)); // allow for render

        const captureElement = container.firstChild as HTMLElement;
        captureElement.classList.remove('dark');
        
        // Explicitly set light theme styles for PDF generation
        captureElement.style.backgroundColor = '#FFFFFF';
        const allElements = captureElement.querySelectorAll('*');
        allElements.forEach((el) => {
            (el as HTMLElement).style.color = '#000000';
        });
        
        const imageElement = captureElement.querySelector('img[alt="Analyzed plant"]') as HTMLElement | null;
        if (imageElement) {
            imageElement.style.width = '70%';
            imageElement.style.margin = '0 auto 2rem auto'; 
        }

        const cards = captureElement.querySelectorAll('.pdf-card');
        cards.forEach(card => {
            (card as HTMLElement).style.backgroundColor = '#F9FAFB';
            (card as HTMLElement).style.border = '1px solid #E5E7EB';
        });

        const canvas = await html2canvas(captureElement, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 5;
        const availableWidth = pageWidth - (margin * 2);
        const availableHeight = pageHeight - (margin * 2);
        const canvasRatio = canvas.width / canvas.height;
        let pdfImageWidth = availableWidth;
        let pdfImageHeight = pdfImageWidth / canvasRatio;

        if (pdfImageHeight > availableHeight) {
            pdfImageHeight = availableHeight;
            pdfImageWidth = pdfImageHeight * canvasRatio;
        }

        const x = (pageWidth - pdfImageWidth) / 2;
        const y = (pageHeight - pdfImageHeight) / 2;

        pdf.addImage(imgData, 'PNG', x, y, pdfImageWidth, pdfImageHeight);
        pdf.save(`plant-analysis-${analysis.disease.replace(/\s+/g, '-')}.pdf`);

        root.unmount();
        document.body.removeChild(container);
    }

    setIsDownloading(false);
    setSelectedIds(new Set());
  };

  return (
    <div className="bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)] p-6 rounded-xl shadow-lg border border-black/5 dark:border-white/5 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-[var(--color-primary)]">{t('historyTitle')}</h2>
      {analyses.length === 0 ? (
        <p className="text-gray-600 dark:text-[var(--text-muted-dark)] flex-grow flex items-center justify-center">{t('noHistory')}</p>
      ) : (
        <div className="flex-grow space-y-3 overflow-y-auto -mr-2 pr-2">
          {analyses.map((analysis) => (
            <div key={analysis.id} className={`w-full text-left p-2 rounded-md transition-colors flex items-center space-x-3 rtl:space-x-reverse border-l-4 ${currentAnalysisId === analysis.id ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]' : 'bg-black/5 dark:bg-white/5 border-transparent'}`}>
                <input 
                    type="checkbox"
                    className="form-checkbox flex-shrink-0 h-5 w-5 text-[var(--color-primary)] bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-[var(--color-primary)]"
                    checked={selectedIds.has(analysis.id)}
                    onChange={() => handleToggleSelect(analysis.id)}
                    aria-label={`Select analysis for ${analysis.disease}`}
                />
                <button onClick={() => onSelect(analysis)} className="flex-grow flex items-center space-x-4 rtl:space-x-reverse min-w-0">
                    <img src={analysis.imageUrl} alt={analysis.disease} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                    <div className="overflow-hidden">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                analysis.severityLevel <= 3 ? 'bg-teal-500' : analysis.severityLevel <= 7 ? 'bg-sky-500' : 'bg-violet-500'
                            }`}></div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">{analysis.disease}</h3>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(analysis.timestamp).toLocaleString(i18n.language)}</p>
                    </div>
                </button>
            </div>
          ))}
        </div>
      )}
      {analyses.length > 0 && (
        <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 space-y-2">
            <button
                onClick={handleDownloadSelected}
                disabled={selectedIds.size === 0 || isDownloading}
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)] disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                {isDownloading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('downloading')}
                    </>
                ) : (
                    <>
                        <DownloadIcon className="w-5 h-5 me-2" />
                        {t('downloadSelected')}
                    </>
                )}
            </button>
            <button
                onClick={handleDeleteClick}
                disabled={selectedIds.size === 0 || isDownloading}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                <TrashIcon className="w-5 h-5 me-2" />
                {t('deleteSelected')}
            </button>
        </div>
      )}
    </div>
  );
};