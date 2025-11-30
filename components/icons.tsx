import React from 'react';

// Replaced the icon with the new heart/stethoscope/tree logo incorporating the Jordanian flag
export const LeafIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24">
        <defs>
            <clipPath id="heart-clip-path-component-flag">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </clipPath>
            <path id="star7-component-flag" d="M0 -10 L1.96 -4.05 L7.82 -6.23 L4.38 -1 L9.75 2.22 L3.52 2.8 L4.34 9 L0 4.5 L-4.34 9 L-3.52 2.8 L-9.75 2.22 L-4.38 -1 L-7.82 -6.23 L-1.96 -4.05 Z" />
        </defs>
        <g clipPath="url(#heart-clip-path-component-flag)" style={{ filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.3))' }}>
            <rect x="0" y="0" width="24" height="8" fill="#000000"/>
            <rect x="0" y="8" width="24" height="8" fill="#FFFFFF"/>
            <rect x="0" y="16" width="24" height="8" fill="#007A3D"/>
            <path d="M2 3 L12 12 L2 21 Z" fill="#CE1126"/>
            <use href="#star7-component-flag" fill="#FFFFFF" transform="translate(6 12) scale(0.35)" />
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

export const QuestionMarkCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
);

export const BugIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75M12 8.25a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zm-6 2.25l-2.625 2.625m14.625-2.625l2.625 2.625M4.5 15.75l-2.25 2.25m19.5-2.25l-2.25 2.25" />
    </svg>
);

export const MailIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
);
