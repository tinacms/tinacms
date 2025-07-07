import * as React from 'react';
import { BiLoaderAlt } from 'react-icons/bi';
import { ProgressBar } from './ProgressBar';

// Test component for developing the progress indicator UI
export const ProgressIndicatorTest = () => {
  const [currentStep, setCurrentStep] = React.useState(2);
  const [statusMessage, setStatusMessage] = React.useState(
    'Processing branch index...'
  );

  const steps = [
    {
      id: 1,
      name: 'Creating branch',
      description: 'Setting up workspace',
    },
    { id: 2, name: 'Saving content', description: 'Storing your changes' },
    {
      id: 3,
      name: 'Creating pull request',
      description: 'Preparing for review',
    },
    { id: 4, name: 'Complete', description: 'Ready for review' },
  ];

  const renderProgressIndicator = () => {
    const progressPercentage = (currentStep / steps.length) * 100;

    return (
      <div className='py-6'>
        {/* Step indicators - Responsive layout */}
        <div className='mb-8'>
          {/* Mobile: Vertical layout */}
          <div className='block sm:hidden space-y-8'>
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;

              return (
                <div key={step.id} className='flex items-center gap-3'>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isCompleted ? '✓' : stepNumber}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div
                      className={`text-sm font-medium leading-tight ${
                        isActive
                          ? 'text-blue-600'
                          : isCompleted
                            ? 'text-green-600'
                            : 'text-gray-500'
                      }`}
                    >
                      {step.name}
                    </div>
                    <div className='text-sm text-gray-500 mt-1 leading-tight'>
                      {step.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: Horizontal layout */}
          <div className='hidden sm:flex justify-between items-center gap-4'>
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;

              return (
                <div
                  key={step.id}
                  className='flex flex-col items-center flex-1 px-2 max-w-32'
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-3 ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isCompleted ? '✓' : stepNumber}
                  </div>
                  <div className='text-center'>
                    <div
                      className={`text-xs font-medium leading-tight whitespace-nowrap ${
                        isActive
                          ? 'text-blue-600'
                          : isCompleted
                            ? 'text-green-600'
                            : 'text-gray-500'
                      }`}
                    >
                      {step.name}
                    </div>
                    <div className='text-xs text-gray-500 mt-1 leading-tight whitespace-nowrap'>
                      {step.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress bar */}
        <ProgressBar progress={progressPercentage} className='mb-6' />

        {/* Current status message */}
        <div className='text-center'>
          <div className='flex items-center justify-center gap-2 mb-2'>
            {currentStep < steps.length && (
              <BiLoaderAlt className='opacity-70 text-blue-400 animate-spin w-4 h-4' />
            )}
            <span className='text-sm font-medium text-gray-700'>
              {currentStep === steps.length
                ? 'Complete!'
                : `Step ${currentStep} of ${steps.length}`}
            </span>
          </div>
          <p className='text-sm text-gray-600 leading-relaxed'>
            {statusMessage}
          </p>
          {currentStep > 0 && currentStep < steps.length && (
            <p className='text-xs text-gray-500 mt-2'>
              This usually takes 1-2 minutes
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className='mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-sm'>
      <h2 className='text-lg font-semibold mb-4 text-gray-800'>
        🔧 Progress Indicator Test
      </h2>

      {/* Progress Indicator */}
      {renderProgressIndicator()}

      {/* Test Controls */}
      <div className='mt-6 p-4 bg-gray-50 border border-gray-200 rounded'>
        <p className='text-sm font-medium text-gray-700 mb-3'>Test Controls:</p>
        <div className='flex gap-2 flex-wrap mb-3'>
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => {
                setCurrentStep(index + 1);
                setStatusMessage(
                  index === 0
                    ? 'Creating your branch...'
                    : index === 1
                      ? 'Saving your content...'
                      : index === 2
                        ? 'Creating pull request...'
                        : 'Workflow completed successfully!'
                );
              }}
              className={`px-3 py-1 text-xs rounded ${
                currentStep === index + 1
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              Step {index + 1}
            </button>
          ))}
        </div>
        <div className='text-xs text-gray-500'>
          <p>• Resize window to test mobile/desktop layouts</p>
          <p>• Click steps to test different states</p>
        </div>
      </div>
    </div>
  );
};
