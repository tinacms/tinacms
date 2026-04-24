import * as React from 'react';
import { AiOutlineLoading } from 'react-icons/ai';
import { WORKFLOW_STEPS, formatTime } from './use-editorial-workflow';

interface WorkflowProgressIndicatorProps {
  currentStep: number;
  isExecuting: boolean;
  elapsedTime: number;
}

export const WorkflowProgressIndicator = ({
  currentStep,
  isExecuting,
  elapsedTime,
}: WorkflowProgressIndicatorProps) => {
  return (
    <>
      <div className='flex justify-between my-8 relative px-5 sm:gap-x-8'>
        <div
          className='absolute top-5 h-0.5 bg-gray-200 -z-10'
          style={{ left: '50px', right: '50px' }}
        />
        {currentStep > 1 && currentStep <= WORKFLOW_STEPS.length && (
          <div
            className='absolute top-5 h-0.5 bg-tina-orange -z-10 transition-all duration-500'
            style={{
              left: '50px',
              width: `calc((100% - 100px) * ${(currentStep - 1) / (WORKFLOW_STEPS.length - 1)})`,
            }}
          />
        )}
        {currentStep > 2 && (
          <div
            className='absolute top-5 h-0.5 bg-green-500 -z-10 transition-all duration-500'
            style={{
              left: '50px',
              width: `calc((100% - 100px) * ${Math.min(1, (currentStep - 2) / (WORKFLOW_STEPS.length - 1))})`,
            }}
          />
        )}

        {WORKFLOW_STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={step.id} className='flex flex-col items-center relative'>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium mb-3 border-2 transition-all duration-300 select-none ${
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isActive
                      ? 'bg-tina-orange border-tina-orange text-white'
                      : 'bg-white border-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <svg
                    className='w-5 h-5'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                ) : isActive ? (
                  <AiOutlineLoading className='animate-spin text-lg' />
                ) : (
                  stepNumber
                )}
              </div>
              <div className='text-center max-w-24'>
                <div className='text-sm font-semibold leading-tight'>
                  {step.name}
                </div>
                <div className='text-xs text-gray-400 mt-1 leading-tight'>
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className='flex items-center justify-between'>
        <div className='text-xs text-gray-500'>Estimated time: 1-2 min</div>
        {isExecuting && currentStep > 0 && (
          <div className='flex items-center gap-1 text-sm text-gray-500 tabular-nums'>
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                clipRule='evenodd'
              />
            </svg>
            {formatTime(elapsedTime)}
          </div>
        )}
      </div>
      <a
        className='underline text-tina-orange-dark font-medium text-xs'
        href='https://tina.io/docs/r/editorial-workflow'
        target='_blank'
      >
        Learn more about Editorial Workflow
      </a>
    </>
  );
};
