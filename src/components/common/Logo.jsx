import React from 'react';
import logoIcon from '../../assets/images/as_logo_icon.png';
import fullLogo from '../../assets/images/AdmireSoftech_logo.png';

export default function Logo({
  variant = 'full', // 'full' (uses AdmireSoftech_logo.png) | 'icon' (uses as_logo_icon.png)
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
}) {
  const fullSizeMap = {
    sm: 'h-8 max-w-[140px]',
    md: 'h-10 max-w-[180px]',
    lg: 'h-12 max-w-[220px]',
    xl: 'h-16 max-w-[280px]',
  };

  const iconSizeMap = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
    lg: 'h-11 w-11',
    xl: 'h-14 w-14',
  };

  if (variant === 'full') {
    return (
      <div className={`flex items-center justify-center select-none w-full ${className}`}>
        <img
          src={fullLogo}
          alt="Admire Softech Logo"
          className={`${fullSizeMap[size] || fullSizeMap.md} w-auto object-contain`}
        />
      </div>
    );
  }

  // Icon-only variant (for collapsed sidebar / compact badge)
  return (
    <div className={`flex items-center justify-center select-none w-full ${className}`}>
      <img
        src={logoIcon}
        alt="Admire Softech Icon"
        className={`${iconSizeMap[size] || iconSizeMap.md} object-contain`}
      />
    </div>
  );
}
