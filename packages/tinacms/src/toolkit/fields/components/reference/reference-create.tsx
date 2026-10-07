import type { Collection, Template } from '@tinacms/schema-tools';
import { normalizePath } from '@tinacms/schema-tools';
import { FormBuilder } from '@toolkit/form-builder';
import {
  Modal,
  ModalBody,
  ModalHeader,
  PopupModal,
} from '@toolkit/react-modals';
import type { TinaCMS } from '@toolkit/tina-cms';
import { Plus } from 'lucide-react';
import * as React from 'react';
import { buildCreateDocumentForm } from '../../../../admin/pages/create-document-form';

interface ReferenceCreateProps {
  cms: TinaCMS;
  collections: string[];
  onCreated: (id: string) => void;
}

const documentId = (collection: Collection, relativePath: string) =>
  `${normalizePath(collection.path)}/${relativePath.replace(/^\/+/, '')}`;

const TemplatePicker = ({
  templates,
  onPick,
}: {
  templates: Template[];
  onPick: (templateName: string) => void;
}) => (
  <div className='flex flex-col gap-2 p-5'>
    <p className='text-sm text-gray-700'>Choose a template</p>
    {templates.map((template) => (
      <button
        key={template.name}
        type='button'
        onClick={() => onPick(template.name)}
        className='text-left px-4 py-3 rounded border border-gray-200 bg-white hover:border-blue-500 hover:text-blue-500 transition-colors'
      >
        {typeof template.label === 'string' ? template.label : template.name}
      </button>
    ))}
  </div>
);

const CreateModal = ({
  cms,
  collection,
  close,
  onCreated,
}: {
  cms: TinaCMS;
  collection: Collection<true>;
  close: () => void;
  onCreated: (id: string) => void;
}) => {
  const templates = collection.templates ?? [];
  const [templateName, setTemplateName] = React.useState<string | undefined>();
  const needsTemplate = templates.length > 0 && !templateName;

  const form = React.useMemo(() => {
    if (needsTemplate) return null;
    return buildCreateDocumentForm({
      cms,
      collection,
      templateName,
      onCreated: (relativePath) => {
        onCreated(documentId(collection, relativePath));
        close();
      },
    }).form;
  }, [cms, collection, templateName, needsTemplate]);

  return (
    <Modal>
      <PopupModal data-test='reference-create-modal'>
        <ModalHeader close={close}>
          New {collection.label || collection.name}
        </ModalHeader>
        <ModalBody padded={false}>
          {needsTemplate ? (
            <TemplatePicker templates={templates} onPick={setTemplateName} />
          ) : (
            <div className='max-h-[70vh] flex flex-col'>
              <FormBuilder form={{ tinaForm: form }} />
            </div>
          )}
        </ModalBody>
      </PopupModal>
    </Modal>
  );
};

const ReferenceCreate: React.FC<ReferenceCreateProps> = ({
  cms,
  collections,
  onCreated,
}) => {
  const [creating, setCreating] = React.useState<Collection<true> | null>(null);
  const hasTinaAdmin = cms.flags.get('tina-admin') !== false;

  if (!hasTinaAdmin) {
    return null;
  }

  const schemaCollections = collections.flatMap((name) => {
    const collection = cms.api.tina.schema?.getCollection(name);
    return collection ? [collection] : [];
  });

  return (
    <>
      {schemaCollections.map((collection) => (
        <button
          key={collection.name}
          type='button'
          data-test={`reference-create:${collection.name}`}
          onClick={() => setCreating(collection)}
          className='text-gray-700 hover:text-blue-500 inline-flex items-center uppercase text-sm mt-2 mb-2 leading-none'
        >
          <Plus className='h-5 w-auto opacity-80 mr-2' />
          New {collection.label || collection.name}
        </button>
      ))}
      {creating && (
        <CreateModal
          cms={cms}
          collection={creating}
          close={() => setCreating(null)}
          onCreated={onCreated}
        />
      )}
    </>
  );
};

export default ReferenceCreate;
