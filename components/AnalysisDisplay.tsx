import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { AnalysisResultData } from '../types';
import { LeafIcon, DownloadIcon, JordanianSpinner } from './icons';
import AnalysisReport from './AnalysisReport';

const Spinner: React.FC<{ messageKey: string }> = ({ messageKey }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <JordanianSpinner />
      <p className="text-lg text-[var(--color-secondary)]">{t(messageKey)}</p>
      {messageKey === 'analyzingMessage' && <p className="text-sm text-gray-500 dark:text-[var(--text-muted-dark)]">{t('analyzingSubtext')}</p>}
    </div>
  );
};

const WelcomeMessage: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="text-center p-8 flex flex-col items-center justify-center h-full">
            <LeafIcon className="w-24 h-24 text-[var(--color-secondary)] mb-6 opacity-80" />
            <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-2">{t('welcomeTitle')}</h2>
            <p className="text-gray-600 dark:text-[var(--text-muted-dark)] max-w-md">{t('welcomeMessage')}</p>
        </div>
    );
};

interface AnalysisDisplayProps {
  analysis: AnalysisResultData | null;
  isLoading: boolean;
  error: string | null;
  imagePreview: string | null;
  loadingMessageKey: string;
}

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, isLoading, error, imagePreview, loadingMessageKey }) => {
  const { t } = useTranslation();
  const analysisContentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    const contentToCapture = analysisContentRef.current;
    if (!contentToCapture || !analysis) return;

    // Use a clone to avoid modifying the on-screen element
    const captureElement = contentToCapture.cloneNode(true) as HTMLElement;
    captureElement.classList.remove('dark');
    document.body.appendChild(captureElement);
    
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
        (card as HTMLElement).style.backgroundColor = '#F9FAFB'; // A light gray for cards
        (card as HTMLElement).style.border = '1px solid #E5E7EB';
    });


    const canvas = await html2canvas(captureElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
    });
    
    document.body.removeChild(captureElement); // Clean up the cloned element
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 5; // 0.5 cm
    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2);

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const canvasRatio = canvasWidth / canvasHeight;

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
  };
  
  return (
    <div className="bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)] p-6 rounded-lg shadow-md border border-black/10 dark:border-white/10 h-full overflow-y-auto">
      <div className="flex flex-col items-center justify-center h-full">
        {isLoading && <Spinner messageKey={loadingMessageKey} />}
        {!isLoading && error && <div className="text-center text-red-500 dark:text-red-400 p-4 bg-red-100 dark:bg-red-900/50 rounded-md">
            <h3 className="font-bold text-lg">{t('analysisFailedTitle')}</h3>
            <p>{error}</p>
        </div>}
        {!isLoading && !error && !analysis && !imagePreview && <WelcomeMessage />}
        
        {imagePreview && !analysis && !isLoading && !error && (
             <div className="text-center">
                <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-4">{t('imageReadyTitle')}</h2>
                <img src={imagePreview} alt="Plant preview" className="max-h-[60vh] rounded-lg mx-auto shadow-lg" />
                <p className="mt-4 text-gray-600 dark:text-[var(--text-muted-dark)]">{t('imageReadyMessage')}</p>
            </div>
        )}

        {!isLoading && !error && analysis && (
          <div className="w-full">
            <AnalysisReport ref={analysisContentRef} analysis={analysis} />
            <div className="mt-6 text-center">
              <button
                onClick={handleDownloadPdf}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <DownloadIcon className="w-5 h-5 me-2" />
                {t('downloadPDF')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};