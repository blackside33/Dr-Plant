import React from 'react';
import { useTranslation } from 'react-i18next';
import { SunIcon, MoonIcon } from './icons';

type Theme = 'light' | 'dark';

interface ThemeSwitcherProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, onThemeChange }) => {
  const { t } = useTranslation();

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    onThemeChange(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-green-500 transition-colors"
      aria-label={t('toggleTheme')}
    >
      {theme === 'light' ? (
        <MoonIcon className="w-6 h-6" />
      ) : (
        <SunIcon className="w-6 h-6" />
      )}
    </button>
  );
};
