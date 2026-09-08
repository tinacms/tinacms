import type { Collection } from '@tinacms/schema-tools';
import { FormBuilder, FormStatus } from '@tinacms/toolkit';
import type { TinaCMS } from '@tinacms/toolkit';
import { FormBreadcrumbs } from '@toolkit/react-sidebar/components/sidebar-body';
import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GetCMS from '../components/GetCMS';
import GetCollection from '../components/GetCollection';
import { PageWrapper } from '../components/Page';
import { buildCreateDocumentForm } from './create-document-form';
import { useCollectionFolder } from './utils';

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

  const collectionListPath = `/collections/${collection.name}${
    folder.fullyQualifiedName ? `/${folder.fullyQualifiedName}` : ''
  }`;

  const { form, formInfo } = useMemo(() => {
    return buildCreateDocumentForm({
      cms,
      collection,
      templateName,
      folderName: folder.fullyQualifiedName ? folder.name : '',
      customDefaults,
      onCreated: () => {
        setTimeout(() => {
          navigate(collectionListPath);
        }, 10);
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
              collectionCrumb={{
                label: collection.label || collection.name,
                onClick: () => navigate(collectionListPath),
              }}
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
