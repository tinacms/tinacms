import { Form } from '@toolkit/forms';
import { Button } from '@toolkit/styles';
import { formatBranchName, normalizeBranchName } from '@utils/branch-name';
import { CircleAlert, GitBranchIcon } from 'lucide-react';
import * as React from 'react';
import { useCMS } from '../react-core';
import {
  Modal,
  ModalActions,
  ModalBody,
  ModalHeader,
  PopupModal,
} from '../react-modals';
import { PrefixedTextField } from './create-branch-modal';
import { EditorialWorkflowErrorBox } from './editorial-workflow-error-box';
import { useEditorialWorkflowState } from './editorial-workflow-provider';
import type { EditorialWorkflowErrorCopy } from './editorial-workflow-utils';

export const BranchDeletedModal = ({
  branchName,
  close,
  path,
  values,
  crudType,
  tinaForm,
}: {
  branchName: string;
  close: () => void;
  path: string;
  values: Record<string, unknown>;
  crudType: string;
  tinaForm?: Form;
}) => {
  const cms = useCMS();
  const tinaApi = cms.api.tina;
  const [newBranchName, setNewBranchName] = React.useState('');
  const normalizedBranchName = normalizeBranchName(newBranchName);

  const baseBranch =
    tinaApi.protectedBranches[0] ||
    cms.api.tina.schema.config.config.repoProvider.defaultBranchName ||
    'main';

  const { startContentSave } = useEditorialWorkflowState();
  const [error, setError] = React.useState<EditorialWorkflowErrorCopy>();

  const handleCreate = async () => {
    const result = await startContentSave({
      branchName: `tina/${normalizedBranchName}`,
      baseBranch,
      path,
      values,
      crudType,
      tinaForm,
    });

    if (result.started) {
      close();
    } else if (result.error) {
      setError(result.error);
    }
  };

  return (
    <Modal className='flex'>
      <PopupModal className='w-auto'>
        <ModalHeader close={close}>Branch no longer exists</ModalHeader>
        <ModalBody padded={true}>
          <div className='max-w-sm'>
            <div className='flex items-start gap-3 p-3 mb-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm'>
              <GitBranchIcon
                className='w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-600'
                style={{ fill: 'none' }}
              />
              <span>
                The branch{' '}
                <span className='font-mono font-semibold'>{branchName}</span> no
                longer exists. It may have been merged or deleted. Your changes
                cannot be pushed to it.
              </span>
            </div>

            <p className='text-sm text-gray-700 mb-4'>
              Create a new branch from{' '}
              <span className='font-mono font-semibold'>{baseBranch}</span> to
              continue editing, or cancel and switch to an existing branch from
              the branch menu.
            </p>

            {error && <EditorialWorkflowErrorBox error={error} />}

            <PrefixedTextField
              name='new-branch-name'
              label='New Branch Name'
              placeholder='e.g. my-updates'
              value={newBranchName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setError(undefined);
                setNewBranchName(formatBranchName(e.target.value));
              }}
            />
          </div>
        </ModalBody>
        <ModalActions align='end'>
          <Button
            variant='secondary'
            className='w-full sm:w-auto'
            onClick={close}
          >
            Cancel
          </Button>
          <Button
            variant='primary'
            className='w-full sm:w-auto'
            disabled={!normalizedBranchName}
            onClick={handleCreate}
          >
            <GitBranchIcon className='w-4 h-4 mr-1' style={{ fill: 'none' }} />
            Create new branch
          </Button>
        </ModalActions>
      </PopupModal>
    </Modal>
  );
};
