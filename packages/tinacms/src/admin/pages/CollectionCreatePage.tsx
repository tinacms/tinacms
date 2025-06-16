import {
  Collection,
  TinaSchema,
  normalizePath,
  resolveForm,
} from '@tinacms/schema-tools';
import type { Template } from '@tinacms/schema-tools';
import {
  BillingWarning,
  Form,
  FormBuilder,
  FormStatus,
  wrapFieldsWithMeta,
} from '@tinacms/toolkit';
import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { LocalWarning } from '@tinacms/toolkit';
import type { TinaCMS } from '@tinacms/toolkit';
import { FormBreadcrumbs } from '@toolkit/react-sidebar/components/sidebar-body';
import { FaLock, FaUnlock } from 'react-icons/fa';
import { TinaAdminApi } from '../api';
import { ErrorDialog } from '../components/ErrorDialog';
import GetCMS from '../components/GetCMS';
import GetCollection from '../components/GetCollection';
import { PageWrapper } from '../components/Page';
import { useCollectionFolder } from './utils';

const createDocument = async (
  cms: TinaCMS,
  collection: Collection,
  template: { name: string },
  mutationInfo: { includeCollection: boolean; includeTemplate: boolean },
  folder: string,
  values: any
) => {
  const api = new TinaAdminApi(cms);
  const { filename, ...leftover } = values;

  if (typeof filename !== 'string') {
    throw new Error('Filename must be a string');
  }

  // Append the folder if it exists and the filename does not start with a slash
  const appendFolder =
    folder && !filename.startsWith('/') ? `/${folder}/` : '/';
  const relativePath = `${appendFolder}${filename}.${collection.format}`;

  const params = api.schema.transformPayload(collection.name, {
    _collection: collection.name,
    ...(template && { _template: template.name }),
    ...leftover,
  });

  if (await api.isAuthenticated()) {
    await api.createDocument(collection, relativePath, params);
  } else {
    const authMessage = `CreateDocument failed: User is no longer authenticated; please login and try again.`;
    cms.alerts.error(authMessage);
    console.error(authMessage);
    return false;
  }
};

const CollectionCreatePage = () => {
  const folder = useCollectionFolder();
  const { collectionName, templateName } = useParams();

  return (
    <GetCMS>
      {(cms: TinaCMS) => (
        <GetCollection
          cms={cms}
          collectionName={collectionName}
          folder={folder}
          includeDocuments={false}
        >
          {(collection) => {
            const mutationInfo = {
              includeCollection: true,
              includeTemplate: !!collection.templates,
            };

            return (
              <RenderForm
                cms={cms}
                collection={collection}
                templateName={templateName}
                mutationInfo={mutationInfo}
                folder={folder}
              />
            );
          }}
        </GetCollection>
      )}
    </GetCMS>
  );
};

const FilenameInput = (props) => {
  const [filenameTouched, setFilenameTouched] = React.useState(false);

  return (
    <div
      className='group relative block cursor-pointer'
      onClick={() => {
        setFilenameTouched(true);
      }}
    >
      <input
        type='text'
        className={`shadow-inner focus:shadow-outline focus:border-blue-500 focus:outline-none block text-base pr-3 truncate py-2 w-full border transition-all ease-out duration-150 focus:text-gray-900 rounded ${
          props.readonly || !filenameTouched
            ? 'bg-gray-50 text-gray-300  border-gray-150 pointer-events-none pl-8 group-hover:bg-white group-hover:text-gray-600  group-hover:border-gray-200'
            : 'bg-white text-gray-600  border-gray-200 pl-3'
        }`}
        {...props}
        disabled={props.readonly || !filenameTouched}
      />
      <FaLock
        className={`text-gray-400 absolute top-1/2 left-2 -translate-y-1/2 pointer-events-none h-5 w-auto transition-opacity duration-150 ease-out ${
          !filenameTouched && !props.readonly
            ? 'opacity-20 group-hover:opacity-0 group-active:opacity-0'
            : 'opacity-0'
        }`}
      />
      <FaUnlock
        className={`text-blue-500 absolute top-1/2 left-2 -translate-y-1/2 pointer-events-none h-5 w-auto transition-opacity duration-150 ease-out ${
          !filenameTouched && !props.readonly
            ? 'opacity-0 group-hover:opacity-80 group-active:opacity-80'
            : 'opacity-0'
        }`}
      />
    </div>
  );
};

export const RenderForm = ({
  cms,
  collection,
  folder,
  templateName,
  mutationInfo,
  customDefaults,
}: {
  cms: TinaCMS;
  collection: Collection;
  folder;
  templateName;
  mutationInfo;
  customDefaults?: any;
}) => {
  const navigate = useNavigate();
  const [formIsPristine, setFormIsPristine] = useState(true);
  const schema: TinaSchema | undefined = cms.api.tina.schema;

  // the schema is being passed in from the frontend so we can use that
  const schemaCollection = schema.getCollection(collection.name);
  const template: Template<true> = schema.getTemplateForData({
    collection: schemaCollection,
    data: { _template: templateName },
  }) as Template<true>;

  const formInfo = resolveForm({
    collection: schemaCollection,
    basename: schemaCollection.name,
    schema: schema,
    template,
  });

  let slugFunction = schemaCollection.ui?.filename?.slugify;

  if (!slugFunction) {
    const titleField = template?.fields.find(
      (x) => x.required && x.type === 'string' && x.isTitle
    )?.name;
    // If the collection does not a slugify function and is has a title field, use the default slugify function
    if (titleField) {
      // default slugify function strips out all non-alphanumeric characters
      slugFunction = (values: unknown) =>
        values[titleField]?.replace(/ /g, '-').replace(/[^a-zA-Z0-9-]/g, '');
    }
  }

  const defaultItem =
    customDefaults ||
    // @ts-ignore internal types aren't up to date
    template.ui?.defaultItem ||
    // @ts-ignore
    template?.defaultItem ||
    {};

  const filenameField = {
    name: 'filename',
    label: 'Filename',
    component: slugFunction
      ? wrapFieldsWithMeta(({ field, input, meta }) => {
          return (
            <FilenameInput
              readOnly={schemaCollection?.ui?.filename?.readonly}
              {...input}
            />
          );
        })
      : 'text',
    disabled: schemaCollection?.ui?.filename?.readonly,
    description: collection.ui?.filename?.description ? (
      <span
        dangerouslySetInnerHTML={{ __html: collection.ui.filename.description }}
      />
    ) : (
      <span>
        A unique filename for the content.
        <br />
        Examples: <code>My_Document</code>, <code>My_Document.en</code>,{' '}
        <code>sub-folder/My_Document</code>
      </span>
    ),
    placeholder: 'My_Document',
    validate: (value, allValues, meta) => {
      if (!value) {
        if (meta.dirty) {
          return 'Required';
        }
        return true;
      }

      const isValid = /[\.\-_\/a-zA-Z0-9]*$/.test(value);
      if (value && !isValid) {
        return 'Must contain only a-z, A-Z, 0-9, -, _, ., or /.';
      }
      // check if the filename is allowed by the collection.
      if (schemaCollection.match?.exclude || schemaCollection.match?.include) {
        const filePath = `${normalizePath(schemaCollection.path)}/${value}.${
          schemaCollection.format || 'md'
        }`;
        const match = schema?.matchFiles({
          files: [filePath],
          collection: schemaCollection,
        });
        if (match?.length === 0) {
          return `The filename "${value}" is not allowed for this collection.`;
        }
      }
    },
  };

  const form = useMemo(() => {
    const folderName = folder.fullyQualifiedName ? folder.name : '';
    return new Form({
      crudType: 'create',
      initialValues:
        typeof defaultItem === 'function'
          ? { ...defaultItem(), _template: templateName }
          : { ...defaultItem, _template: templateName },
      extraSubscribeValues: { active: true, submitting: true, touched: true },
      onChange: (values) => {
        if (!values?.submitting) {
          const filename: string = values?.values?.filename;

          // If the filename starts with "/" then it is an absolute path and we should not append the folder name
          const appendFolder =
            folderName && !filename?.startsWith('/') ? `/${folderName}/` : '/';

          // keeps the forms relative path in sync with the filename
          form.relativePath =
            schemaCollection.path +
            appendFolder +
            `${filename}.${schemaCollection.format || 'md'}`;
        }
        if (
          slugFunction &&
          values?.active !== 'filename' &&
          !values?.submitting &&
          !values.touched?.filename
        ) {
          const value = slugFunction(values.values, {
            template,
            collection: schemaCollection,
          });
          form.finalForm.change('filename', value);
        }
      },
      id:
        schemaCollection.path +
        folderName +
        `/new-post.${schemaCollection.format || 'md'}`,
      label: 'form',
      fields: [
        collection.ui?.filename?.showFirst && filenameField,
        ...(formInfo.fields as any),
        !collection.ui?.filename?.showFirst && filenameField,
      ].filter((x) => !!x),
      onSubmit: async (values) => {
        try {
          const folderName = folder.fullyQualifiedName ? folder.name : '';
          await createDocument(
            cms,
            collection,
            template,
            mutationInfo,
            folderName,
            values
          );
          cms.alerts.success('Document created!');
          setTimeout(() => {
            navigate(
              `/collections/${collection.name}${
                folder.fullyQualifiedName ? `/${folder.fullyQualifiedName}` : ''
              }`
            );
          }, 10);
        } catch (error) {
          console.error(error);
          const defaultErrorText = 'There was a problem saving your document.';
          if (error.message.includes('already exists')) {
            cms.alerts.error(
              `${defaultErrorText} The "Filename" is already used for another document, please modify it.`
            );
          } else {
            cms.alerts.error(() =>
              ErrorDialog({
                title: defaultErrorText,
                message: 'Tina caught an error while creating the page',
                error,
              })
            );
          }
          throw new Error(
            `[${error.name}] CreateDocument failed: ${error.message}`
          );
        }
      },
    });
  }, [cms, collection, mutationInfo]);

  React.useEffect(() => {
    cms.dispatch({ type: 'forms:add', value: form });
    cms.dispatch({ type: 'forms:set-active-form-id', value: form.id });
    return () => {
      cms.dispatch({ type: 'forms:remove', value: form.id });
      cms.dispatch({ type: 'forms:set-active-form-id', value: null });
    };
  }, [JSON.stringify(formInfo.fields)]);
  if (!cms.state.activeFormId) {
    return null;
  }
  const activeForm = cms.state.forms.find(
    ({ tinaForm }) => tinaForm.id === form.id
  );

  return (
    <PageWrapper headerClassName='bg-white'>
      <>
        <div
          className={`py-4 px-6 border-b border-gray-200 bg-white w-full grow-0 shrink basis-0 flex justify-center`}
        >
          <div className='w-full flex gap-1.5 justify-between items-center'>
            <FormBreadcrumbs
              className='w-[calc(100%-3rem)]'
              rootBreadcrumbName='Create New'
            />
            <FormStatus pristine={formIsPristine} />
          </div>
        </div>

        {activeForm && (
          <FormBuilder form={activeForm} onPristineChange={setFormIsPristine} />
        )}
      </>
    </PageWrapper>
  );
};

export default CollectionCreatePage;
