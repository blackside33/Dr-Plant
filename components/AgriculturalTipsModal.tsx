import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AgriculturalTipsData, PlantSuggestion } from '../types';
import { SeedlingIcon } from './icons';

interface AgriculturalTipsModalProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    error: string | null;
    data: AgriculturalTipsData | null;
    onManualSearch: (location: string) => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[var(--color-primary)]"></div>
);

const SuggestionCard: React.FC<{ suggestion: PlantSuggestion }> = ({ suggestion }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-gray-500/10 p-4 rounded-lg border-l-4 border-[var(--color-primary)]">
            <h4 className="font-bold text-lg text-[var(--color-primary)] mb-2">{suggestion.plantName}</h4>
            <div className="space-y-2 text-sm">
                <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{t('plantingAdvice')}:</p>
                    <p className="text-gray-600 dark:text-gray-400">{suggestion.plantingAdvice}</p>
                </div>
                <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{t('productivityOutlook')}:</p>
                    <p className="text-gray-600 dark:text-gray-400">{suggestion.productivityOutlook}</p>
                </div>
            </div>
        </div>
    );
};

export const AgriculturalTipsModal: React.FC<AgriculturalTipsModalProps> = ({ isOpen, onClose, isLoading, error, data, onManualSearch }) => {
    const { t } = useTranslation();
    const [locationInput, setLocationInput] = useState('');

    if (!isOpen) return null;

    const productiveCrops = data?.suggestions.filter(s => s.category === 'Productive') || [];
    const ornamentalPlants = data?.suggestions.filter(s => s.category === 'Ornamental') || [];
    const uncategorized = data?.suggestions.filter(s => s.category !== 'Productive' && s.category !== 'Ornamental') || [];

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tips-modal-title"
        >
            <div 
                className="bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)] rounded-2xl shadow-2xl w-full max-w-2xl text-[var(--text-light)] dark:text-[var(--text-dark)] transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale border border-black/5 dark:border-white/10 max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: 'fade-in-scale 0.3s forwards' }}
            >
                 <style>{`
                    @keyframes fade-in-scale {
                        from { transform: scale(0.95); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                `}</style>
                <div className="p-6 border-b border-black/10 dark:border-white/10">
                    <div className="flex justify-between items-center">
                        <h2 id="tips-modal-title" className="text-2xl font-bold text-[var(--color-secondary)] flex items-center">
                            <SeedlingIcon className="w-7 h-7 me-3"/>
                            {t('agriculturalTipsTitle')}
                        </h2>
                        <button 
                            onClick={onClose} 
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            aria-label={t('close')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-64 space-y-3">
                            <LoadingSpinner />
                            <p className="text-lg">{error === 'location' ? t('gettingLocation') : t('analyzingMessage')}</p>
                        </div>
                    )}

                    {!isLoading && error && !data && (
                         <div className="flex flex-col items-center justify-center h-64 text-center bg-rose-100 dark:bg-rose-900/50 p-4 rounded-lg">
                             <h3 className="font-bold text-lg text-rose-600 dark:text-rose-300">{t('tipsErrorTitle')}</h3>
                             <p className="text-rose-500 dark:text-rose-400 mb-4">{error}</p>
                             <form onSubmit={(e) => { e.preventDefault(); onManualSearch(locationInput); }} className="w-full max-w-sm">
                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                    <input 
                                        type="text"
                                        value={locationInput}
                                        onChange={(e) => setLocationInput(e.target.value)}
                                        placeholder={t('locationInputPlaceholder')}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)]"
                                        aria-label="Location Input"
                                    />
                                    <button type="submit" className="px-4 py-2 bg-[var(--color-secondary)] text-white rounded-md hover:bg-[var(--color-secondary-hover)] transition-colors whitespace-nowrap">
                                        {t('searchButton')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    
                    {!isLoading && !error && data && (
                        <div className="space-y-6">
                             <div>
                                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">{t('generalSummary')}</h3>
                                <div className="bg-gray-500/10 p-4 rounded-lg">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{data.summary}</p>
                                </div>
                            </div>
                            
                           {productiveCrops.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200 border-b border-gray-500/20 pb-2">{t('productiveCrops')}</h3>
                                    <div className="space-y-4">
                                        {productiveCrops.map((suggestion, index) => (
                                            <SuggestionCard key={`prod-${index}`} suggestion={suggestion} />
                                        ))}
                                    </div>
                                </div>
                           )}

                           {ornamentalPlants.length > 0 && (
                                <div className="pt-4">
                                    <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200 border-b border-gray-500/20 pb-2">{t('ornamentalPlants')}</h3>
                                    <div className="space-y-4">
                                        {ornamentalPlants.map((suggestion, index) => (
                                            <SuggestionCard key={`orn-${index}`} suggestion={suggestion} />
                                        ))}
                                    </div>
                                </div>
                           )}

                           {uncategorized.length > 0 && (
                                <div className="pt-4">
                                    <div className="space-y-4">
                                        {uncategorized.map((suggestion, index) => (
                                            <SuggestionCard key={`uncat-${index}`} suggestion={suggestion} />
                                        ))}
                                    </div>
                                </div>
                           )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};