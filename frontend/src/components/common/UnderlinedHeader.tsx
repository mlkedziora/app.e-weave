// frontend/src/components/common/UnderlinedHeader.tsx
import React, { FC } from 'react';
import Typography from './Typography';

interface UnderlinedHeaderProps {
  title: string;
  variant?: '20' | '15'; // Adjust variants as needed
  weight?: 'light' | 'regular';
  className?: string;
}

const UnderlinedHeader: FC<UnderlinedHeaderProps> = ({ title, variant = '20', weight = 'light', className = '' }) => {
  return (
    <div className="-ml-6">
      <Typography
        variant={variant}
        weight={weight}
        element="h2"
        className={`inline-block pl-6 border-b border-black pb-1 tracking-[3px] mb-4 text-black ${className}`}
      >
        {title}
      </Typography>
    </div>
  );
};

export default UnderlinedHeader;