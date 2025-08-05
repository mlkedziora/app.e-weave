// frontend/src/components/common/ProgressDisplay.tsx
import React, { FC } from 'react';
import ProgressBar from './ProgressBar';
import Typography from './Typography';

interface ProgressDisplayProps {
  progress: number;
  className?: string;
}

const ProgressDisplay: FC<ProgressDisplayProps> = ({ progress, className = '' }) => {
  return (
    <div className={`px-5 ${className}`}>
      <div className="flex justify-center items-center">
        <ProgressBar progress={progress} width="80%" />
        <Typography variant="15" className="ml-5 text-black">
          {progress}%
        </Typography>
      </div>
    </div>
  );
};

export default ProgressDisplay;