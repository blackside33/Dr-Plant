import React from 'react';
import { useTranslation } from 'react-i18next';

export const Footer: React.FC = () => {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="text-center py-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('footerCopyright', { year: currentYear })}
            </p>
        </footer>
    );
};
