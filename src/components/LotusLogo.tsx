import React from 'react';

interface LotusLogoProps {
  className?: string;
  size?: number;
}

export const LotusLogo: React.FC<LotusLogoProps> = ({ className = 'w-9 h-9', size }) => {
  return (
    <svg
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: (size * 80) / 100 } : undefined}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lotusCenter" x1="50" y1="10" x2="50" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E86C88" />
          <stop offset="50%" stopColor="#D45D79" />
          <stop offset="100%" stopColor="#86293D" />
        </linearGradient>
        <linearGradient id="lotusPetalLeft" x1="25" y1="25" x2="45" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5A3B7" />
          <stop offset="60%" stopColor="#D45D79" />
          <stop offset="100%" stopColor="#86293D" />
        </linearGradient>
        <linearGradient id="lotusPetalRight" x1="75" y1="25" x2="55" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5A3B7" />
          <stop offset="60%" stopColor="#D45D79" />
          <stop offset="100%" stopColor="#86293D" />
        </linearGradient>
        <linearGradient id="lotusOuterLeft" x1="10" y1="40" x2="40" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F8BAC7" />
          <stop offset="70%" stopColor="#E2748D" />
          <stop offset="100%" stopColor="#9C324A" />
        </linearGradient>
        <linearGradient id="lotusOuterRight" x1="90" y1="40" x2="60" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F8BAC7" />
          <stop offset="70%" stopColor="#E2748D" />
          <stop offset="100%" stopColor="#9C324A" />
        </linearGradient>
        <linearGradient id="lotusBase" x1="30" y1="65" x2="70" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C84B68" />
          <stop offset="100%" stopColor="#86293D" />
        </linearGradient>
      </defs>

      {/* Far Outer Petals */}
      <path
        d="M12 56 C14 44, 28 36, 46 62 C34 66, 20 64, 12 56 Z"
        fill="url(#lotusOuterLeft)"
        opacity="0.9"
      />
      <path
        d="M88 56 C86 44, 72 36, 54 62 C66 66, 80 64, 88 56 Z"
        fill="url(#lotusOuterRight)"
        opacity="0.9"
      />

      {/* Mid Petals */}
      <path
        d="M24 38 C28 22, 44 26, 48 64 C36 62, 28 52, 24 38 Z"
        fill="url(#lotusPetalLeft)"
      />
      <path
        d="M76 38 C72 22, 56 26, 52 64 C64 62, 72 52, 76 38 Z"
        fill="url(#lotusPetalRight)"
      />

      {/* Central Majestic Petal */}
      <path
        d="M50 8 C42 24, 42 48, 50 68 C58 48, 58 24, 50 8 Z"
        fill="url(#lotusCenter)"
      />

      {/* Base Pod / Sepal */}
      <ellipse
        cx="50"
        cy="68"
        rx="18"
        ry="4"
        fill="url(#lotusBase)"
      />
    </svg>
  );
};
