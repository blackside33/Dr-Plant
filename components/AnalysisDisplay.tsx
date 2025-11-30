import React from 'react';
import { useTranslation } from 'react-i18next';
import { AnalysisResultData } from '../types';
import { LeafIcon, JordanianSpinner } from './icons';
import { AnalysisReport } from './AnalysisReport';

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
  
  return (
    <div className="bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)] p-6 rounded-xl shadow-lg border border-black/5 dark:border-white/5 h-full overflow-y-auto">
      <div className="flex flex-col items-center justify-center h-full">
        {isLoading && <Spinner messageKey={loadingMessageKey} />}
        {!isLoading && error && <div className="text-center text-rose-600 dark:text-rose-300 p-4 bg-rose-100 dark:bg-rose-900/50 rounded-md">
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
            <AnalysisReport analysis={analysis} />
          </div>
        )}
      </div>
    </div>
  );
};