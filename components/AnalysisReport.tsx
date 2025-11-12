import React from 'react';
import { useTranslation } from 'react-i18next';
import { AnalysisResultData } from '../types';
import { TreatmentCard } from './TreatmentCard';

interface AnalysisReportProps {
    analysis: AnalysisResultData;
}

const AnalysisReport = React.forwardRef<HTMLDivElement, AnalysisReportProps>(({ analysis }, ref) => {
    const { t, i18n } = useTranslation();

    return (
         <div ref={ref} className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
            <div className="max-w-4xl mx-auto font-sans p-4">
                {/* PDF Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-light text-gray-500 dark:text-gray-400">Doctor Plant AI</h1>
                </div>

                {/* Disease Title and Date */}
                <div className="text-center mb-6">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">{analysis.disease}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('analyzedOn', { date: new Date(analysis.timestamp).toLocaleString(i18n.language) })}</p>
                </div>

                {/* Image */}
                <img src={analysis.imageUrl} alt="Analyzed plant" className="w-full rounded-lg mb-8" />
                
                <div className="space-y-6">
                    {/* Severity Card */}
                    <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('severityLevel')}</h3>
                            <div className="text-right rtl:text-left">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{t('diseaseClassification')}</p>
                                <span className="text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2.5 py-1 rounded-full">{analysis.diseaseClassification}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div
                                    className={`h-2.5 rounded-full transition-all duration-500 ${
                                        analysis.severityLevel <= 3 ? 'bg-green-600' : analysis.severityLevel <= 7 ? 'bg-yellow-500' : 'bg-red-600'
                                    }`}
                                    style={{ width: `${analysis.severityLevel * 10}%` }}
                                ></div>
                            </div>
                            <span className="font-bold text-lg text-gray-700 dark:text-gray-300">{analysis.severityLevel}/10</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{analysis.severityDescription}</p>
                    </div>

                    {/* Description Card */}
                    <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">{t('description')}</h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 whitespace-pre-wrap leading-relaxed">
                            {analysis.description}
                        </div>
                    </div>
                    
                    {/* Recommendations */}
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('recommendations')}</h3>
                        <div className="space-y-6">
                            {analysis.treatments.map((treatment, index) => (
                                <TreatmentCard key={index} treatment={treatment} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default AnalysisReport;
