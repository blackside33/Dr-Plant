import React from 'react';

// Replaced the icon with the new heart/stethoscope/tree logo incorporating the Jordanian flag
export const LeafIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
        <defs>
            <clipPath id="heart-clip-path-component-flag">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </clipPath>
            <path id="star7-component-flag" d="M0 -10 L2.35 -3.09 L9.51 -3.09 L3.8 1.9 L6.18 8.09 L0 4 L-6.18 8.09 L-3.8 1.9 L-9.51 -3.09 L-2.35 -3.09 Z" />
        </defs>
        <g clipPath="url(#heart-clip-path-component-flag)">
            <rect x="0" y="0" width="24" height="8" fill="#000000"/>
            <rect x="0" y="8" width="24" height="8" fill="#FFFFFF"/>
            <rect x="0" y="16" width="24" height="8" fill="#007A3D"/>
            <path d="M2 3 L12 12 L2 21 Z" fill="#CE1126"/>
            <use href="#star7-component-flag" fill="#FFFFFF" transform="translate(6 12) scale(0.35)" />
        </g>
        <g stroke="#FFFFFF" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" fill="none" style={{ filter: 'drop-shadow(0px 0px 1px rgba(0,0,0,0.5))' }}>
            <path d="M9.5 5 A 2.5 2.5 0 0 1 14.5 5" />
            <circle cx="9" cy="5" r="0.75" fill="#FFFFFF"/>
            <circle cx="15" cy="5" r="0.75" fill="#FFFFFF"/>
            <path d="M9.5 5 C 10 7, 11 8, 12 8" />
            <path d="M14.5 5 C 14 7, 13 8, 12 8" />
            <path d="M12 8 V 11" />
            <path d="M12 11 C 10 10, 8 11, 8 13" />
            <path d="M12 11 C 11 12, 9.5 13.5, 9.5 15.5" />
            <path d="M12 11 C 10.5 11, 8.5 11.5, 7 10" />
            <path d="M12 11 C 12 17, 18 16, 18 14" />
            <circle fill="#FFFFFF" stroke="#FFFFFF" cx="18" cy="15" r="0.5" />
            <circle cx="18" cy="15" r="2" />
            <g fill="#FFFFFF" stroke="none">
                <circle cx="7.5" cy="9.5" r="0.6"/><circle cx="6.5" cy="10.5" r="0.6"/><circle cx="8" cy="13.5" r="0.6"/><circle cx="9" cy="16" r="0.6"/><circle cx="9" cy="12.5" r="0.6"/><circle cx="10" cy="14.5" r="0.6"/><circle cx="11" cy="10" r="0.6"/>
            </g>
        </g>
    </svg>
);


export const JordanianSpinner: React.FC = () => (
  <div className="relative w-16 h-16">
    <div className="absolute inset-0 border-4 border-stone-200 dark:border-[var(--card-bg-dark)] rounded-full"></div>
    <div className="absolute inset-0 border-4 border-t-[var(--color-primary)] border-l-[var(--color-primary)] border-b-transparent border-r-transparent rounded-full animate-spin"></div>
    <div className="absolute inset-2 border-2 border-stone-200 dark:border-[var(--card-bg-dark)] rounded-full"></div>
    <div className="absolute inset-2 border-2 border-t-[var(--color-secondary)] border-l-transparent border-b-transparent border-r-[var(--color-secondary)] rounded-full animate-spin [animation-direction:reverse]"></div>
  </div>
);


export const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

export const FlaskIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20.25a2.25 2.25 0 104.5 0v-5.642a2.25 2.25 0 00-.659-1.591l-5.432-5.432a2.25 2.25 0 00-1.591-.659H7.5a2.25 2.25 0 00-2.25 2.25v5.642a2.25 2.25 0 00.659 1.591l5.432 5.432a2.25 2.25 0 001.591.659z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25h.01" />
    </svg>
);

export const DnaIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3s4 6 0 9 M18 3s-4 6 0 9 M6 12s4 6 0 9 M18 12s-4 6 0 9 M8 6h8 M8 12h8 M8 18h8" />
    </svg>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

export const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

export const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

export const WeatherIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
);

export const InstallIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.25 3.75h5.5a2.25 2.25 0 0 1 2.25 2.25v12a2.25 2.25 0 0 1-2.25-2.25h-5.5a2.25 2.25 0 0 1-2.25-2.25v-12a2.25 2.25 0 0 1 2.25-2.25z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 13.5V6.75m0 6.75-2.25-2.25M12 13.5l2.25-2.25" />
  </svg>
);

export const SeedlingIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V3m0 0c-3.125 0-5.25 2.625-5.25 5.25s2.125 5.25 5.25 5.25c3.125 0 5.25-2.625 5.25-5.25S15.125 3 12 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18" />
    </svg>
);

export const FocusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9.75v-.75a2.25 2.25 0 0 0-2.25-2.25h-.75a2.25 2.25 0 0 0-2.25 2.25v.75m.75 6v.75a2.25 2.25 0 0 0 2.25 2.25h.75a2.25 2.25 0 0 0 2.25-2.25v-.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 15h-.75a2.25 2.25 0 0 1-2.25-2.25v-.75a2.25 2.25 0 0 1 2.25-2.25h.75m6 0h.75a2.25 2.25 0 0 1 2.25 2.25v.75a2.25 2.25 0 0 1-2.25 2.25h-.75" />
    </svg>
);

export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);


export const BackgroundIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z" />
    </svg>
);