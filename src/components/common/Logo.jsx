import React from 'react';
import logoIcon from '../../assets/images/as_logo_icon.png';
import fullLogo from '../../assets/images/AdmireSoftech_logo.png';

export default function Logo({
  variant = 'full', // 'full' (uses AdmireSoftech_logo.png) | 'icon' (uses as_logo_icon.png)
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  compact = false,
  className = '',
}) {
  const activeVariant = compact ? 'icon' : variant;

  const fullSizeMap = {
    xs: 'h-6 max-w-[110px]',
    sm: 'h-8 max-w-[135px]',
    md: 'h-9 max-w-[155px]',
    lg: 'h-11 max-w-[185px]',
    xl: 'h-14 max-w-[240px]',
  };

  const iconSizeMap = {
    xs: 'h-6 w-6',
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-9 w-9',
    xl: 'h-11 w-11',
  };

  if (activeVariant === 'full') {
    return (
      <div className={`flex items-center justify-center select-none ${className}`}>
        <img
          src={fullLogo}
          alt="Admire Softech Logo"
          className={`${fullSizeMap[size] || fullSizeMap.md} w-auto object-contain drop-shadow-sm`}
        />
      </div>
    );
  }

  // Icon-only variant (for collapsed sidebar / compact badge)
  return (
    <div className={`flex items-center justify-center select-none ${className}`}>
      <img
        src={logoIcon}
        alt="Admire Softech Icon"
        className={`${iconSizeMap[size] || iconSizeMap.md} object-contain drop-shadow-sm`}
      />
    </div>
  );
}
