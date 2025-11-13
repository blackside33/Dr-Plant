import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: 'en' | 'ar') => {
        i18n.changeLanguage(lng);
    };

    const languages = [
        { code: 'en', name: 'EN' },
        { code: 'ar', name: 'ع' },
    ];

    return (
        <div className="flex space-x-1 bg-black/10 dark:bg-white/10 rounded-full p-1">
            {languages.map(lang => (
                <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code as 'en' | 'ar')}
                    className={`px-3 py-1 text-sm font-medium rounded-full transition-colors duration-300 ${i18n.language === lang.code ? 'bg-[var(--color-primary)] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10'}`}
                >
                    {lang.name}
                </button>
            ))}
        </div>
    );
};