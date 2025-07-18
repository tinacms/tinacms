import * as React from 'react';

interface ProgressBarProps {
  /** Progress percentage (0-100) */
  progress: number;
  /** Additional CSS classes */
  className?: string;
  /** Color of the progress bar */
  color?: 'blue' | 'green';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
  color = 'blue',
}) => {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const colorClass = color === 'green' ? 'bg-green-500' : 'bg-blue-500';

  return (
    <div className={`w-full ${className}`}>
      <div className='w-full bg-gray-200 rounded-full h-2'>
        <div
          className={`${colorClass} h-2 rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
