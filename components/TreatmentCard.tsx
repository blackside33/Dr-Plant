import React from 'react';
import { useTranslation } from 'react-i18next';
import { Treatment } from '../types';
import { FlaskIcon, DnaIcon } from './icons';

export const TreatmentCard: React.FC<{ treatment: Treatment }> = ({ treatment }) => {
    const { t } = useTranslation();
    const isChemical = treatment.type.toLowerCase().includes('chem') || treatment.type.includes('كيميائي');

    return (
        <div className="bg-gray-100/50 dark:bg-black/20 p-6 rounded-lg border border-black/10 dark:border-white/10 pdf-card">
            <div className="flex items-center mb-4">
                {isChemical ? <FlaskIcon className="w-6 h-6 me-3 text-[var(--color-secondary)]" /> : <DnaIcon className="w-6 h-6 me-3 text-[var(--color-primary)]" />}
                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100">{isChemical ? t('chemicalTreatment') : t('biologicalTreatment')}</h4>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-4 whitespace-pre-wrap leading-relaxed">
                {treatment.description}
            </div>
            {treatment.suggestedProducts && treatment.suggestedProducts.length > 0 && (
                <div>
                    <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('suggestedProducts')}</h5>
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                      <table className="w-full text-sm text-left">
                          <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-200 dark:bg-gray-700">
                              <tr>
                                  <th scope="col" className="px-4 py-2 font-semibold">{t('commercialName')}</th>
                                  <th scope="col" className="px-4 py-2 font-semibold">{t('scientificName')}</th>
                                  <th scope="col" className="px-4 py-2 font-semibold">{t('activeIngredient')}</th>
                              </tr>
                          </thead>
                          <tbody className="text-gray-600 dark:text-gray-400">
                              {treatment.suggestedProducts.map((product, index) => (
                                  <tr key={index} className="bg-white dark:bg-gray-800 border-b last:border-b-0 dark:border-gray-700">
                                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{product.name}</td>
                                      <td className="px-4 py-3">{product.scientificName}</td>
                                      <td className="px-4 py-3">{product.activeIngredient}</td>
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