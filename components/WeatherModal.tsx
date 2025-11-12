import React from 'react';
import { useTranslation } from 'react-i18next';
import { WeatherData } from '../types';
import { LeafIcon } from './icons';

interface WeatherModalProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    error: string | null;
    data: WeatherData | null;
}

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
);

export const WeatherModal: React.FC<WeatherModalProps> = ({ isOpen, onClose, isLoading, error, data }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="weather-modal-title"
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg text-gray-800 dark:text-gray-100 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: 'fade-in-scale 0.3s forwards' }}
            >
                 <style>{`
                    @keyframes fade-in-scale {
                        from { transform: scale(0.95); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                `}</style>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 id="weather-modal-title" className="text-2xl font-bold text-blue-600 dark:text-blue-400">{t('weatherTitle')}</h2>
                        <button 
                            onClick={onClose} 
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            aria-label={t('close')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-64 space-y-3">
                            <LoadingSpinner />
                            <p className="text-lg">{error === 'location' ? t('gettingLocation') : t('analyzingMessage')}</p>
                        </div>
                    )}

                    {!isLoading && error && error !== 'location' && (
                        <div className="flex flex-col items-center justify-center h-64 text-center bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">
                             <h3 className="font-bold text-lg text-red-600 dark:text-red-300">{t('weatherErrorTitle')}</h3>
                             <p className="text-red-500 dark:text-red-400">{t('weatherErrorBody')}</p>
                        </div>
                    )}
                    
                    {!isLoading && !error && data && (
                        <div className="space-y-6">
                            {/* Current Conditions */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">{t('currentConditions')}</h3>
                                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="text-5xl font-bold">{Math.round(data.current_temp)}°C</p>
                                        <p className="text-gray-600 dark:text-gray-300">{data.condition}</p>
                                    </div>
                                    <div className="text-right rtl:text-left text-sm space-y-1">
                                        <p>{t('humidity')}: {data.humidity}%</p>
                                        <p>{t('windSpeed')}: {data.wind_speed} km/h</p>
                                    </div>
                                </div>
                            </div>

                             {/* Agricultural Tip */}
                             <div>
                                <h3 className="text-lg font-semibold mb-2 flex items-center">
                                    <LeafIcon className="w-5 h-5 me-2 text-green-500" />
                                    {t('agriculturalTip')}
                                </h3>
                                <div className="bg-green-50 dark:bg-green-900/50 border-l-4 border-green-500 p-4 rounded-r-lg">
                                    <p className="text-sm text-green-800 dark:text-green-200">{data.agricultural_summary}</p>
                                </div>
                            </div>
                            
                            {/* Forecast */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">{t('forecast')}</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {data.forecast.map((day, index) => (
                                        <div key={index} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center">
                                            <p className="font-bold">{day.day}</p>
                                            <p className="text-lg">{Math.round(day.max_temp)}° / {Math.round(day.min_temp)}°</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{day.condition}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
