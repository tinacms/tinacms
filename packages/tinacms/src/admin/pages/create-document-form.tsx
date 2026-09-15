import {
  type Collection,
  ERR_ALREADY_EXISTS,
  RELATIVE_PATH_ALLOWED_CHARS_MESSAGE,
  RELATIVE_PATH_REGEX,
  type Template,
  type TinaSchema,
  normalizePath,
  resolveForm,
} from '@tinacms/schema-tools';
import {
  Form,
  isSessionExpiredError,
  wrapFieldsWithMeta,
} from '@tinacms/toolkit';
import type { TinaCMS } from '@tinacms/toolkit';
import { dispatchSessionExpired } from '@toolkit/core/session-expired';
import { Lock, Unlock } from 'lucide-react';
import React from 'react';
import { TinaAdminApi } from '../api';
import { ErrorDialog } from '../components/ErrorDialog';

export const relativePathFor = (
  folder: string,
  filename: string,
  format: string
) => {
  const appendFolder =
    folder && !filename.startsWith('/') ? `/${folder}/` : '/';
  return `${appendFolder}${filename}.${format}`;
};

export const createDocument = async (
  cms: TinaCMS,
  collection: Collection,
  template: { name: string } | undefined,
  folder: string,
  values: any
) => {
  const api = new TinaAdminApi(cms);
  const { filename, ...leftover } = values;

  if (typeof filename !== 'string') {
    throw new Error('Filename must be a string');
  }

  const relativePath = relativePathFor(
    folder,
    filename,
    collection.format || 'md'
  );

  const params = api.schema.transformPayload(collection.name, {
    _collection: collection.name,
    ...(template && { _template: template.name }),
    ...leftover,
  });

  if (await api.isAuthenticated()) {
    await api.createDocument(collection, relativePath, params);
    return relativePath;
  }
  dispatchSessionExpired(cms.events);
  return false;
};

export const FilenameInput = (props) => {
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
      <Lock
        className={`text-gray-400 absolute top-1/2 left-2 -translate-y-1/2 pointer-events-none h-5 w-auto transition-opacity duration-150 ease-out ${
          !filenameTouched && !props.readonly
            ? 'opacity-20 group-hover:opacity-0 group-active:opacity-0'
            : 'opacity-0'
        }`}
      />
      <Unlock
        className={`text-blue-500 absolute top-1/2 left-2 -translate-y-1/2 pointer-events-none h-5 w-auto transition-opacity duration-150 ease-out ${
          !filenameTouched && !props.readonly
            ? 'opacity-0 group-hover:opacity-80 group-active:opacity-80'
            : 'opacity-0'
        }`}
      />
    </div>
  );
};

export interface CreateDocumentFormOptions {
  cms: TinaCMS;
  collection: Collection;
  templateName?: string;
  folderName?: string;
  customDefaults?: any;
  onCreated: (relativePath: string) => void;
}

/**
 * Builds the form used to create a document in a collection: the collection's
 * fields plus the filename field with its slugify, validation and folder
 * handling. Shared by the admin's create page and by reference fields that
 * allow creating the referenced document in place.
 */
export const buildCreateDocumentForm = ({
  cms,
  collection,
  templateName,
  folderName = '',
  customDefaults,
  onCreated,
}: CreateDocumentFormOptions) => {
  const schema: TinaSchema = cms.api.tina.schema;
  const schemaCollection = schema.getCollection(collection.name);
  const template = schema.getTemplateForData({
    collection: schemaCollection,
    data: { _template: templateName },
  }) as Template<true>;

  const formInfo = resolveForm({
    collection: schemaCollection,
    basename: schemaCollection.name,
    schema,
    template,
  });

  let slugFunction = schemaCollection.ui?.filename?.slugify;

  if (!slugFunction) {
    const titleField = template?.fields.find(
      (x) => x.required && x.type === 'string' && x.isTitle
    )?.name;
    if (titleField) {
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

  const format = schemaCollection.format || 'md';
  const fileReadOnly = schemaCollection?.ui?.filename?.readonly;
  const parse = schemaCollection?.ui?.filename?.parse;
  const filenameField = {
    name: 'filename',
    label: 'Filename',
    parse,
    component:
      slugFunction && !fileReadOnly
        ? wrapFieldsWithMeta(({ input }) => {
            return <FilenameInput readOnly={fileReadOnly} {...input} />;
          })
        : 'text',
    disabled: fileReadOnly,
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

      if (!RELATIVE_PATH_REGEX.test(value)) {
        return RELATIVE_PATH_ALLOWED_CHARS_MESSAGE;
      }
      if (schemaCollection.match?.exclude || schemaCollection.match?.include) {
        const filePath = `${normalizePath(schemaCollection.path)}/${value}.${format}`;
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

  const form = new Form({
    crudType: 'create',
    initialValues:
      typeof defaultItem === 'function'
        ? { ...defaultItem(), _template: templateName }
        : { ...defaultItem, _template: templateName },
    extraSubscribeValues: { active: true, submitting: true, touched: true },
    onChange: (values) => {
      if (!values?.submitting) {
        const filename: string = values?.values?.filename;
        form.path =
          schemaCollection.path +
          relativePathFor(folderName, filename ?? '', format);
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
    id: `${schemaCollection.path}${folderName}/new-post.${format}`,
    label: 'form',
    fields: [
      collection.ui?.filename?.showFirst && filenameField,
      ...(formInfo.fields as any),
      !collection.ui?.filename?.showFirst && filenameField,
    ].filter((x) => !!x),
    onSubmit: async (values) => {
      try {
        const relativePath = await createDocument(
          cms,
          collection,
          template,
          folderName,
          values
        );
        if (relativePath === false) return;
        cms.alerts.success('Document created!');
        onCreated(relativePath);
      } catch (error) {
        if (isSessionExpiredError(error)) throw error;
        const defaultErrorText = 'There was a problem saving your document.';
        if (error.message && error.message.includes(ERR_ALREADY_EXISTS)) {
          cms.alerts.error(
            `${defaultErrorText} The filename "${form.values.filename}.${format}" is already used for another document, please modify it.`
          );
        } else {
          cms.alerts.error(() =>
            ErrorDialog({
              title: defaultErrorText,
              message: 'Tina caught an error while creating the file',
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

  return { form, formInfo };
};
