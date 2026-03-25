import * as React from 'react';

const DefaultDisplayOnlyField: React.FC<any> = () => {
  return (
    <div className='rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-500 italic'>
      Display-only field — provide a component via <code>ui.component</code>
    </div>
  );
};

export const DisplayOnlyFieldPlugin = {
  name: 'displayOnly',
  Component: DefaultDisplayOnlyField,
};

export const InfoBox = ({
  message,
  links,
}: {
  message: string;
  links?: { text: string; url: string }[];
}): React.FC<any> => {
  const InfoBoxComponent: React.FC<any> = () => {
    return (
      <div className='rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm mb-1 w-full'>
        <p className='text-gray-700 whitespace-normal break-words'>{message}</p>
        {links && links.length > 0 && (
          <ul className='flex flex-col gap-1 mt-2'>
            {links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 underline hover:text-blue-800'
                >
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  InfoBoxComponent.displayName = 'InfoBox';
  return InfoBoxComponent;
};
