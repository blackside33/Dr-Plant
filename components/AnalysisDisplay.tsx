import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { AnalysisResultData, Treatment } from '../types';
import { FlaskIcon, DnaIcon, LeafIcon, DownloadIcon } from './icons';

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

const TreatmentCard: React.FC<{ treatment: Treatment }> = ({ treatment }) => {
    const { t } = useTranslation();
    const isChemical = treatment.type.toLowerCase().includes('chem') || treatment.type.includes('كيميائي');

    return (
        <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg">
            <div className="flex items-center mb-3">
                {isChemical ? <FlaskIcon className="w-6 h-6 me-3 text-red-500 dark:text-red-400" /> : <DnaIcon className="w-6 h-6 me-3 text-blue-500 dark:text-blue-400" />}
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{isChemical ? t('chemicalTreatment') : t('biologicalTreatment')}</h4>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed whitespace-pre-wrap">{treatment.description}</p>
            {treatment.suggestedProducts && treatment.suggestedProducts.length > 0 && (
                <div>
                    <h5 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">{t('suggestedProducts')}</h5>
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                      <table className="w-full text-sm text-left text-gray-600 dark:text-gray-400">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                              <tr>
                                  <th scope="col" className="px-4 py-2">{t('commercialName')}</th>
                                  <th scope="col" className="px-4 py-2">{t('scientificName')}</th>
                                  <th scope="col" className="px-4 py-2">{t('activeIngredient')}</th>
                              </tr>
                          </thead>
                          <tbody>
                              {treatment.suggestedProducts.map((product, index) => (
                                  <tr key={index} className="bg-white dark:bg-gray-800 border-b last:border-b-0 dark:border-gray-700">
                                      <td className="px-4 py-2 font-semibold text-gray-900 dark:text-white">{product.name}</td>
                                      <td className="px-4 py-2">{product.scientificName}</td>
                                      <td className="px-4 py-2">{product.activeIngredient}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                    </div>
                </div>
            )}
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
        backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
        onclone: (document) => {
             document.body.style.backgroundColor = theme === 'dark' ? '#1f2937' : '#f9fafb';
        }
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= pageHeight) {
        // If content fits on one page, stretch it to fill the entire page.
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, pageHeight);
    } else {
        // For content longer than one page, use corrected multi-page logic without stretching.
        let position = 0;
        let heightLeft = imgHeight;
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position -= pageHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
    }
    
    // Add watermark to all pages
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(50);
        pdf.setTextColor(theme === 'dark' ? 150 : 100);
        const watermarkText = 'Plant Doctor AI';
        
        pdf.text(watermarkText, pageWidth / 2, pageHeight / 2, {
            angle: 45,
            align: 'center',
            baseline: 'middle',
            opacity: 0.2
        });
    }

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
            <div ref={analysisContentRef} className="p-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
              <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4 text-center">{analysis.disease}</h2>
              <img src={analysis.imageUrl} alt="Analyzed plant" className="w-full h-auto max-h-80 object-cover rounded-lg mb-6 shadow-md" />
              
              <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{t('severityLevel')}</h3>
                          </div>
                          <div className="text-right rtl:text-left">
                              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">{t('diseaseClassification')}</h4>
                              <span className="font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full inline-block text-sm">{analysis.diseaseClassification}</span>
                          </div>
                      </div>
                      <div className="flex items-center gap-4 mb-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                              <div
                                  className={`h-4 rounded-full transition-all duration-500 ${
                                      analysis.severityLevel <= 3 ? 'bg-green-600' : analysis.severityLevel <= 7 ? 'bg-yellow-500' : 'bg-red-600'
                                  }`}
                                  style={{ width: `${analysis.severityLevel * 10}%` }}
                              ></div>
                          </div>
                          <span className="font-bold text-lg text-gray-700 dark:text-gray-300">{analysis.severityLevel}/10</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">{analysis.severityDescription}</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">{t('description')}</h3>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{analysis.description}</p>
                  </div>
                  
                  <div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{t('recommendations')}</h3>
                      <div className="space-y-4">
                          {analysis.treatments.map((treatment, index) => (
                              <TreatmentCard key={index} treatment={treatment} />
                          ))}
                      </div>
                  </div>
              </div>
            </div>
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