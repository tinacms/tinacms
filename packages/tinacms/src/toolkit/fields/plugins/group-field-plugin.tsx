import {
  FieldsBuilder,
  FormWrapper,
  useFormPortal,
} from '@toolkit/form-builder';
import { Field, Form } from '@toolkit/forms';
import { useCMS } from '@toolkit/react-core/use-cms';
import * as React from 'react';
import { BiPencil } from 'react-icons/bi';
import { IoMdClose } from 'react-icons/io';
import { wrapFieldWithNoHeader } from './wrap-field-with-meta';

export interface GroupFieldDefinititon extends Field {
  component: 'group';
  fields: Field[];
}

export interface GroupProps {
  input: any;
  meta: any;
  field: GroupFieldDefinititon;
  form: any;
  tinaForm: Form;
}

export const Group = wrapFieldWithNoHeader(
  ({ tinaForm, field }: GroupProps) => {
    const cms = useCMS();
    return (
      <>
        <Header
          onClick={() => {
            const state = tinaForm.finalForm.getState();
            if (state.invalid === true) {
              // @ts-ignore
              cms.alerts.error('Cannot navigate away from an invalid form.');
              return;
            }

            cms.dispatch({
              type: 'forms:set-active-field-name',
              value: { formId: tinaForm.id, fieldName: field.name },
            });
          }}
        >
          {field.label || field.name}
          {field.description && (
            <span
              className={`block font-sans text-xs italic font-light text-gray-400 pt-0.5 whitespace-normal m-0`}
              dangerouslySetInnerHTML={{ __html: field.description }}
            ></span>
          )}
        </Header>
      </>
    );
  }
);

interface PanelProps {
  setExpanded(_next: boolean): void;
  isExpanded: boolean;
  tinaForm: Form;
  field: GroupFieldDefinititon;
  children?: any;
}

const Panel = function Panel({
  setExpanded,
  isExpanded,
  tinaForm,
  field,
}: PanelProps) {
  const cms = useCMS();
  const FormPortal = useFormPortal();
  const fields: any[] = React.useMemo(() => {
    return field.fields.map((subField: any) => ({
      ...subField,
      name: `${field.name}.${subField.name}`,
    }));
  }, [field.fields, field.name]);

  return (
    <FormPortal>
      {({ zIndexShift }) => (
        <GroupPanel
          isExpanded={isExpanded}
          style={{ zIndex: zIndexShift + 1000 }}
        >
          <PanelHeader
            onClick={() => {
              const state = tinaForm.finalForm.getState();
              if (state.invalid === true) {
                // @ts-ignore
                cms.alerts.error('Cannot navigate away from an invalid form.');
                return;
              }

              setExpanded(false);
            }}
          >
            {field.label || field.name}
          </PanelHeader>
          <PanelBody id={tinaForm.id}>
            {isExpanded ? (
              <FieldsBuilder form={tinaForm} fields={fields} />
            ) : null}
          </PanelBody>
        </GroupPanel>
      )}
    </FormPortal>
  );
};

const Header = ({ onClick, children }) => {
  return (
    <div className='pt-1 mb-5'>
      <button
        onClick={onClick}
        className='group px-4 py-3 bg-white hover:bg-gray-50 shadow focus:shadow-outline focus:border-tina-orange-dark w-full border border-gray-100 hover:border-gray-200 text-gray-500 hover:text-tina-orange-dark focus:text-tina-orange-dark rounded flex justify-between items-center gap-2'
      >
        <span className='text-left text-base font-medium overflow-hidden text-ellipsis whitespace-nowrap flex-1'>
          {children}
        </span>{' '}
        <BiPencil className='h-6 w-auto transition-opacity duration-150 ease-out opacity-80 group-hover:opacity-90' />
      </button>
    </div>
  );
};

export const PanelHeader = ({ onClick, children }) => {
  return (
    <button
      className={`relative z-40 group text-left w-full bg-white hover:bg-gray-50 py-2 border-t border-b shadow-sm
       border-gray-100 px-6 -mt-px`}
      onClick={onClick}
      tabIndex={-1}
    >
      <div className='flex items-center justify-between gap-3 text-xs tracking-wide font-medium text-gray-700 group-hover:text-blue-400 uppercase max-w-form mx-auto'>
        {children}
        <IoMdClose className='h-auto w-5 inline-block opacity-70 -mt-0.5 -mx-0.5' />
      </div>
    </button>
  );
};

export const PanelBody = ({ id, children }) => {
  return (
    <div className='flex-1 w-full overflow-y-auto bg-[var(--tina-color-grey-1)]'>
      <FormWrapper id={id}>{children}</FormWrapper>
    </div>
  );
};

export const GroupPanel = ({
  isExpanded,
  className = '',
  style = {},
  ...props
}) => (
  <div
    className={`absolute w-full top-0 bottom-0 left-0 flex flex-col justify-between overflow-hidden z-10 ${className}`}
    style={{
      pointerEvents: isExpanded ? 'all' : 'none',
      ...(isExpanded
        ? {
            animationName: 'fly-in-left',
            animationDuration: '150ms',
            animationDelay: '0',
            animationIterationCount: 1,
            animationTimingFunction: 'ease-out',
            animationFillMode: 'backwards',
          }
        : {
            transition: 'transform 150ms ease-out',
            transform: 'translate3d(100%, 0, 0)',
          }),
      ...style,
    }}
    {...props}
  />
);

export interface GroupFieldProps {
  field: Field;
}

export function GroupField(props: GroupFieldProps) {
  return <div>Subfield: {props.field.label || props.field.name}</div>;
}

export const GroupFieldPlugin = {
  name: 'group',
  Component: Group,
};
