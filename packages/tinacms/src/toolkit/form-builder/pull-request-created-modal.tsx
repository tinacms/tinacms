import { Button } from '@toolkit/styles';
import { CircleCheck, ExternalLink } from 'lucide-react';
import * as React from 'react';
import { useCMS } from '../react-core';
import {
  Modal,
  ModalActions,
  ModalBody,
  ModalHeader,
  PopupModal,
} from '../react-modals';
import {
  collectionListHash,
  documentEditHash,
  type EditorialWorkflowCompleteEvent,
} from './editorial-workflow-utils';

export const PullRequestCreatedModal = ({
  branchName,
  pullRequestUrl,
  isDraft,
  onContinueEditing,
  onDone,
}: {
  branchName: string;
  pullRequestUrl?: string;
  isDraft: boolean;
  onContinueEditing: () => void;
  onDone: () => void;
}) => (
  <Modal className='flex'>
    <PopupModal className='w-auto'>
      <ModalHeader close={onContinueEditing}>
        {isDraft ? 'Draft pull request created' : 'Pull request created'}
      </ModalHeader>
      <ModalBody padded={true}>
        <div className='max-w-sm'>
          <div className='flex items-start gap-3 p-3 mb-4 bg-green-50 border border-green-200 rounded text-green-800 text-sm'>
            <CircleCheck className='w-4 h-4 mt-0.5 flex-shrink-0 text-green-600' />
            <span>
              Your changes are saved on the branch{' '}
              <span className='font-mono font-semibold'>{branchName}</span>.
            </span>
          </div>
          <p className='text-sm text-gray-700 mb-4'>
            {isDraft
              ? "A draft pull request has been created. It is still a draft, so it hasn't been sent for review and your changes are not live yet."
              : 'A pull request has been created and is ready for review. Your changes go live once a reviewer approves and merges it.'}
          </p>
          <p className='text-sm text-gray-700'>
            Anything else you save now is added to the same pull request.
          </p>
          {pullRequestUrl && (
            <a
              className='inline-flex items-center gap-1 mt-4 text-sm underline text-tina-orange-dark font-medium'
              href={pullRequestUrl}
              target='_blank'
              rel='noreferrer'
            >
              View pull request
              <ExternalLink className='w-4 h-4' />
            </a>
          )}
        </div>
      </ModalBody>
      <ModalActions align='end'>
        <Button
          variant='secondary'
          className='w-full sm:w-auto'
          onClick={onContinueEditing}
        >
          Continue editing
        </Button>
        <Button variant='primary' className='w-full sm:w-auto' onClick={onDone}>
          Done
        </Button>
      </ModalActions>
    </PopupModal>
  </Modal>
);

/**
 * Lives above the form so the prompt survives the form unmounting when the
 * workflow switches the editor to the new branch.
 */
export const PullRequestCreatedOverlay = () => {
  const cms = useCMS();
  const [completed, setCompleted] =
    React.useState<EditorialWorkflowCompleteEvent | null>(null);

  React.useEffect(
    () =>
      cms.events.subscribe<EditorialWorkflowCompleteEvent>(
        'editorial-workflow:complete',
        setCompleted
      ),
    [cms]
  );

  if (!completed) return null;

  const { collection, relativePath, crudType } = completed;

  return (
    <PullRequestCreatedModal
      branchName={completed.branchName}
      pullRequestUrl={completed.pullRequestUrl}
      isDraft={completed.isDraft}
      onContinueEditing={() => {
        setCompleted(null);
        // The create form cannot save a document that now exists.
        if (crudType === 'create') {
          window.location.hash = documentEditHash(collection, relativePath);
        }
      }}
      onDone={() => {
        setCompleted(null);
        window.location.hash = collectionListHash(collection, relativePath);
      }}
    />
  );
};
