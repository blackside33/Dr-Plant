import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: 'en' | 'ar') => {
        i18n.changeLanguage(lng);
    };

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'ar', name: 'العربية' },
    ];

    return (
        <div className="flex space-x-2 bg-gray-200 dark:bg-gray-700 rounded-full p-1">
            {languages.map(lang => (
                <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code as 'en' | 'ar')}
                    className={`px-3 py-1 text-sm font-medium rounded-full transition-colors duration-300 ${i18n.language === lang.code ? 'bg-green-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                    {lang.name}
                </button>
            ))}
        </div>
    );
};