import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { AnalysisResultData } from '../types';
import { LeafIcon, DownloadIcon } from './icons';
import AnalysisReport from './AnalysisReport';

const Spinner: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
      <p className="text-lg text-green-600 dark:text-green-300">{t('analyzingMessage')}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{t('analyzingSubtext')}</p>
    </div>
  );
};

const WelcomeMessage: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="text-center p-8 flex flex-col items-center justify-center h-full">
            <LeafIcon className="w-24 h-24 text-green-500 mb-6 opacity-80" />
            <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{t('welcomeTitle')}</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">{t('welcomeMessage')}</p>
        </div>
    );
};

interface AnalysisDisplayProps {
  analysis: AnalysisResultData | null;
  isLoading: boolean;
  error: string | null;
  imagePreview: string | null;
  theme: 'light' | 'dark';
}

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, isLoading, error, imagePreview, theme }) => {
  const { t } = useTranslation();
  const analysisContentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    const contentToCapture = analysisContentRef.current;
    if (!contentToCapture || !analysis) return;

    const canvas = await html2canvas(contentToCapture, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        onclone: (document) => {
            document.documentElement.classList.remove('dark');
            document.body.style.backgroundColor = '#ffffff';
            
            const imageElement = document.querySelector('img[alt="Analyzed plant"]') as HTMLElement | null;
            if (imageElement) {
                imageElement.style.width = '70%';
                imageElement.style.display = 'block';
                imageElement.style.margin = '0 auto 2rem auto'; 
            }

            const style = document.createElement('style');
            style.innerHTML = `
              /* Force white background on elements that have dark/gray backgrounds in the UI */
              .bg-white, .bg-gray-100, .bg-gray-200, .bg-blue-100,
              .dark\\:bg-gray-700, .dark\\:bg-gray-800, .dark\\:bg-gray-900, .dark\\:bg-blue-900 {
                background-color: #ffffff !important;
              }
              
              /* Remove all borders for a cleaner look */
              .border, .border-b, .border-gray-200, .dark\\:border-gray-700 {
                border: none !important;
              }

              /* Force all text to be black for readability */
              * {
                 color: #000000 !important;
              }

              /* Ensure headings are bold for emphasis */
              h1, h2, h3, h4, h5, h6 {
                  font-weight: bold !important;
              }
            `;
            document.head.appendChild(style);
        }
    });
    
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
    
    // Calculate coordinates to center the image on the page
    const x = (pageWidth - pdfImageWidth) / 2;
    const y = (pageHeight - pdfImageHeight) / 2;

    pdf.addImage(imgData, 'PNG', x, y, pdfImageWidth, pdfImageHeight);
    
    pdf.save(`plant-analysis-${analysis.disease.replace(/\s+/g, '-')}.pdf`);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg h-full overflow-y-auto">
      <div className="flex flex-col items-center justify-center h-full">
        {isLoading && <Spinner />}
        {!isLoading && error && <div className="text-center text-red-500 dark:text-red-400 p-4 bg-red-100 dark:bg-red-900/50 rounded-md">
            <h3 className="font-bold text-lg">{t('analysisFailedTitle')}</h3>
            <p>{error}</p>
        </div>}
        {!isLoading && !error && !analysis && !imagePreview && <WelcomeMessage />}
        
        {imagePreview && !analysis && !isLoading && !error && (
             <div className="text-center">
                <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">{t('imageReadyTitle')}</h2>
                <img src={imagePreview} alt="Plant preview" className="max-h-[60vh] rounded-lg mx-auto shadow-lg" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">{t('imageReadyMessage')}</p>
            </div>
        )}

        {!isLoading && !error && analysis && (
          <div className="w-full">
            <AnalysisReport ref={analysisContentRef} analysis={analysis} />
            <div className="mt-6 text-center">
              <button
                onClick={handleDownloadPdf}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
