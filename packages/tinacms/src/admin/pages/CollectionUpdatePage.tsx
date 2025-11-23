import {
  Collection,
  TinaSchema,
  canonicalPath,
  resolveForm,
} from '@tinacms/schema-tools';
import { Form, FormBuilder, FormStatus } from '@tinacms/toolkit';
import type { TinaCMS } from '@tinacms/toolkit';
import { FormBreadcrumbs } from '@toolkit/react-sidebar/components/sidebar-body';
import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TinaAdminApi } from '../api';
import { ErrorDialog } from '../components/ErrorDialog';
import GetCMS from '../components/GetCMS';
import GetCollection from '../components/GetCollection';
import GetDocument from '../components/GetDocument';
import { PageWrapper } from '../components/Page';
import { useCollectionFolder } from './utils';

const updateDocument = async (
  cms: TinaCMS,
  relativePath: string,
  collection: Collection,
  mutationInfo: { includeCollection: boolean; includeTemplate: boolean },
  values: any
) => {
  const api = new TinaAdminApi(cms);
  const params = api.schema.transformPayload(collection.name, values);
  if (await api.isAuthenticated()) {
    await api.updateDocument(collection, relativePath, params);
  } else {
    const authMessage = `UpdateDocument failed: User is no longer authenticated; please login and try again.`;
    cms.alerts.error(authMessage);
    console.error(authMessage);
    return false;
  }
};

const CollectionUpdatePage = () => {
  const { collectionName, ...rest } = useParams();
  const folder = useCollectionFolder();
  const { '*': filename } = rest; // TODO can just use the folder.name instead

  const resolvedFile = folder.fullyQualifiedName ? folder.name : filename;
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
            const relativePath = `${resolvedFile}.${collection.format}`;
            const mutationInfo = {
              includeCollection: true,
              includeTemplate: !!collection.templates,
            };

            return (
              <PageWrapper headerClassName='bg-white'>
                <GetDocument
                  cms={cms}
                  collectionName={collection.name}
                  relativePath={relativePath}
                >
                  {(document) => (
                    <RenderForm
                      cms={cms}
                      document={document}
                      filename={resolvedFile}
                      relativePath={relativePath}
                      collection={collection}
                      mutationInfo={mutationInfo}
                    />
                  )}
                </GetDocument>
              </PageWrapper>
            );
          }}
        </GetCollection>
      )}
    </GetCMS>
  );
};

const RenderForm = ({
  cms,
  document,
  filename,
  relativePath,
  collection,
  mutationInfo,
}: {
  cms: TinaCMS;
  document;
  filename;
  relativePath;
  collection;
  mutationInfo;
}) => {
  const [formIsPristine, setFormIsPristine] = useState(true);
  const schema: TinaSchema | undefined = cms.api.tina.schema;

  // the schema is being passed in from the frontend so we can use that
  const schemaCollection = schema.getCollection(collection.name);

  const template = schema.getTemplateForData({
    collection: schemaCollection,
    data: document._values,
  });
  const formInfo = resolveForm({
    collection: schemaCollection,
    basename: schemaCollection.name,
    schema: schema,
    template,
  });

  const form = useMemo(() => {
    return new Form({
      // id is the full document path
      id: canonicalPath(`${schemaCollection.path}/${relativePath}`),
      label: 'form',
      fields: formInfo.fields as any,
      initialValues: document._values,
      onSubmit: async (values) => {
        try {
          await updateDocument(
            cms,
            relativePath,
            collection,
            mutationInfo,
            values
          );
          cms.alerts.success('Document updated!');
        } catch (error) {
          cms.alerts.error(() =>
            ErrorDialog({
              title: 'There was a problem saving your document',
              message: 'Tina caught an error while updating the page',
              error,
            })
          );
          console.error(error);
          throw new Error(
            `[${error.name}] UpdateDocument failed: ${error.message}`
          );
        }
      },
    });
  }, [cms, document, relativePath, collection, mutationInfo]);

  React.useEffect(() => {
    cms.dispatch({ type: 'forms:add', value: form });
    cms.dispatch({ type: 'forms:set-active-form-id', value: form.id });
    return () => {
      cms.dispatch({ type: 'forms:remove', value: form.id });
      cms.dispatch({ type: 'forms:set-active-form-id', value: null });
    };
  }, [JSON.stringify(document._values)]);
  if (!cms.state.activeFormId) {
    return null;
  }
  const activeForm = cms.state.forms.find(
    ({ tinaForm }) => tinaForm.id === form.id
  );

  return (
    <>
      <div
        className={`py-4 px-6 border-b border-gray-200 bg-white w-full grow-0 shrink basis-0 flex justify-center`}
      >
        <div className='w-full flex gap-1.5 justify-between items-center'>
          <FormBreadcrumbs
            className='w-[calc(100%-3rem)]'
            rootBreadcrumbName={`${filename}.${collection.format}`}
          />
          <FormStatus pristine={formIsPristine} />
        </div>
      </div>
      {activeForm && (
        <FormBuilder form={activeForm} onPristineChange={setFormIsPristine} />
      )}
    </>
  );
};

export default CollectionUpdatePage;
