import * as React from 'react';
import { useCMS } from '@toolkit/react-tinacms/use-cms';
import ReferenceSelect from './reference-select';
import ReferenceLink from './reference-link';
import ReferenceCreate from './reference-create';
import { ReferenceProps } from './model/reference-props';

export const Reference: React.FC<ReferenceProps> = ({ input, field }) => {
  const cms = useCMS();
  const [optionsVersion, setOptionsVersion] = React.useState(0);

  return (
    <>
      <div className='relative group'>
        <ReferenceSelect
          cms={cms}
          input={input}
          field={field}
          optionsVersion={optionsVersion}
        />
      </div>
      <div className='flex flex-wrap items-center gap-x-4'>
        <ReferenceLink cms={cms} input={input} />
        {field.allowCreate && (
          <ReferenceCreate
            cms={cms}
            collections={field.collections}
            onCreated={(id) => {
              input.onChange(id);
              setOptionsVersion((version) => version + 1);
            }}
          />
        )}
      </div>
    </>
  );
};
