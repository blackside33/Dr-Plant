import React from 'react';
import { useTranslation } from 'react-i18next';
import { InstallIcon } from './icons';

interface InstallPwaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInstall?: () => void;
    isIos: boolean;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({ isOpen, onClose, onInstall, isIos }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const title = isIos ? t('iosInstallTitle') : t('installModalTitle');
    const body = isIos ? t('iosInstallBody') : t('installModalBody');

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-modal-title"
        >
            <div 
                className="bg-[var(--card-bg-light)] dark:bg-[var(--card-bg-dark)] rounded-2xl shadow-2xl w-full max-w-md text-[var(--text-light)] dark:text-[var(--text-dark)] transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale border-2 border-[var(--color-secondary)]"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: 'fade-in-scale 0.3s forwards' }}
            >
                <style>{`
                    @keyframes fade-in-scale {
                        from { transform: scale(0.95); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                `}</style>
                <div className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                       <div className="p-3 bg-[var(--color-primary)]/10 rounded-full">
                           <InstallIcon className="w-12 h-12 text-[var(--color-primary)]" />
                       </div>
                    </div>

                    <h2 id="install-modal-title" className="text-2xl font-bold mb-2">{title}</h2>
                    <p className="text-gray-600 dark:text-[var(--text-muted-dark)] mb-6">{body}</p>

                    <div className={`flex ${isIos ? 'justify-center' : 'justify-between'} space-x-4 rtl:space-x-reverse`}>
                        {isIos ? (
                             <button onClick={onClose} className="w-full px-4 py-3 bg-[var(--color-primary)] text-white font-semibold rounded-md hover:bg-[var(--color-primary-hover)] transition-colors">
                                {t('close')}
                            </button>
                        ) : (
                           <>
                             <button onClick={onClose} className="w-1/2 px-4 py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                                {t('installLaterButton')}
                            </button>
                            <button onClick={onInstall} className="w-1/2 px-4 py-3 bg-[var(--color-primary)] text-white font-semibold rounded-md hover:bg-[var(--color-primary-hover)] transition-colors">
                                {t('installButton')}
                            </button>
                           </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};