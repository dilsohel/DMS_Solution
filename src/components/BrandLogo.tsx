import React, { useState } from 'react';

export const DMS_LOGO_URL = 'https://i.imgur.com/XjO7IJK.jpg';
export const DMS_LOGO_FALLBACK = 'https://imgur.com/XjO7IJK.jpg';
export const DMS_BG_URL = 'https://i.imgur.com/15btbvY.jpg';
export const DMS_BG_FALLBACK = 'https://imgur.com/15btbvY.jpg';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const [imgSrc, setImgSrc] = useState(DMS_LOGO_URL);
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'h-8 max-h-8 w-auto',
    md: 'h-10 max-h-10 w-auto',
    lg: 'h-12 max-h-12 w-auto',
    xl: 'h-16 max-h-16 w-auto',
  };

  if (hasError) {
    return (
      <div className={`flex items-center space-x-2.5 ${className}`}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-sky-500 flex items-center justify-center font-black text-white text-lg shadow-sm">
          DMS
        </div>
        {showText && (
          <div>
            <div className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">
              DMS Solution
            </div>
            <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5">
              Business SaaS
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img
        src={imgSrc}
        alt="DMS Solution Logo"
        referrerPolicy="no-referrer"
        onError={() => {
          if (imgSrc === DMS_LOGO_URL) {
            setImgSrc(DMS_LOGO_FALLBACK);
          } else {
            setHasError(true);
          }
        }}
        className={`${sizeClasses[size]} object-contain rounded-lg transition-transform duration-200 hover:scale-[1.02]`}
      />
      {showText && (
        <span className="font-extrabold text-lg tracking-tight text-slate-900 hidden sm:inline-block">
          DMS Solution
        </span>
      )}
    </div>
  );
};
