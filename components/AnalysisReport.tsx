import React from 'react';
import { useTranslation } from 'react-i18next';
import { AnalysisResultData } from '../types';
import { TreatmentCard } from './TreatmentCard';
import { BugIcon } from './icons';

interface AnalysisReportProps {
    analysis: AnalysisResultData;
}

const AnalysisReport = React.forwardRef<HTMLDivElement, AnalysisReportProps>(({ analysis }, ref) => {
    const { t, i18n } = useTranslation();

    return (
         <div ref={ref} className="bg-transparent text-inherit">
            <div className="max-w-4xl mx-auto font-sans p-4">
                {/* PDF Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-[var(--color-primary)]">طبيب النبات</h1>
                    <p className="text-sm text-[var(--text-muted-light)] dark:text-[var(--text-muted-dark)]">AI Analysis Report</p>
                </div>

                {/* Disease Title and Date */}
                <div className="text-center mb-8 border-b-2 border-[var(--color-secondary)]/30 pb-4">
                    {analysis.isInsect && (
                        <div className="flex justify-center mb-2">
                            <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                <BugIcon className="w-4 h-4" />
                                {t('insectDetected')}
                            </span>
                        </div>
                    )}
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">{analysis.disease}</h2>
                    <p className="text-sm text-[var(--text-muted-light)] dark:text-[var(--text-muted-dark)] mt-2">{t('analyzedOn', { date: new Date(analysis.timestamp).toLocaleString(i18n.language) })}</p>
                </div>

                {/* Image */}
                <img src={analysis.imageUrl} alt="Analyzed plant" className="w-full max-w-md mx-auto rounded-lg mb-8 shadow-lg" />
                
                <div className="space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Severity Card */}
                        <div className="bg-black/5 dark:bg-black/20 p-6 rounded-xl border border-black/5 dark:border-white/10 pdf-card">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('severityLevel')}</h3>
                                <div className="text-right rtl:text-left">
                                    <p className="text-xs font-semibold text-[var(--text-muted-light)] dark:text-[var(--text-muted-dark)] mb-1">{t('diseaseClassification')}</p>
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${analysis.isInsect ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                                        {analysis.diseaseClassification}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3.5">
                                    <div
                                        className={`h-3.5 rounded-full transition-all duration-500 ${
                                            analysis.severityLevel <= 3 ? 'bg-teal-500' : analysis.severityLevel <= 7 ? 'bg-sky-500' : 'bg-violet-500'
                                        }`}
                                        style={{ width: `${analysis.severityLevel * 10}%` }}
                                    ></div>
                                </div>
                                <span className="font-bold text-lg text-gray-700 dark:text-gray-300">{analysis.severityLevel}/10</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{analysis.severityDescription}</p>
                        </div>
                        
                        {/* Image Quality Card */}
                        {analysis.imageQualityScore !== undefined && analysis.imageQualityDescription && (
                            <div className="bg-black/5 dark:bg-black/20 p-6 rounded-xl border border-black/5 dark:border-white/10 pdf-card">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">{t('imageQuality')}</h3>
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3.5">
                                        <div
                                            className={`h-3.5 rounded-full transition-all duration-500 ${
                                                analysis.imageQualityScore <= 3 ? 'bg-violet-500' : analysis.imageQualityScore <= 7 ? 'bg-sky-500' : 'bg-teal-500'
                                            }`}
                                            style={{ width: `${analysis.imageQualityScore * 10}%` }}
                                        ></div>
                                    </div>
                                    <span className="font-bold text-lg text-gray-700 dark:text-gray-300">{analysis.imageQualityScore}/10</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{analysis.imageQualityDescription}</p>
                            </div>
                        )}
                    </div>


                    {/* Description Card */}
                    <div className="bg-black/5 dark:bg-black/20 p-6 rounded-xl border border-black/5 dark:border-white/10 pdf-card">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">{t('description')}</h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 whitespace-pre-wrap leading-relaxed">
                            {analysis.description}
                        </div>
                    </div>
                    
                    {/* Recommendations */}
                    {analysis.treatments.length > 0 && (
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">{t('recommendations')}</h3>
                            <div className="space-y-6">
                                {analysis.treatments.map((treatment, index) => (
                                    <TreatmentCard key={index} treatment={treatment} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default AnalysisReport;