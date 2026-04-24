import * as React from 'react';
import { BiError } from 'react-icons/bi';
import { GitBranchIcon } from 'lucide-react';
import { useCMS } from '../react-core';
import {
  Modal,
  ModalActions,
  ModalBody,
  ModalHeader,
  PopupModal,
} from '../react-modals';
import { PrefixedTextField } from './create-branch-modal';
import { Form } from '@toolkit/forms';
import { formatBranchName } from '@toolkit/plugin-branch-switcher';
import { Button } from '@toolkit/styles';
import { useEditorialWorkflow } from './use-editorial-workflow';
import { WorkflowProgressIndicator } from './workflow-progress-indicator';

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

  const baseBranch =
    tinaApi.protectedBranches[0] ||
    cms.api.tina.schema.config.config.repoProvider.defaultBranchName ||
    'main';

  const {
    isExecuting,
    errorMessage,
    currentStep,
    elapsedTime,
    executeWorkflow,
    reset,
  } = useEditorialWorkflow();

  const handleCreate = async () => {
    const success = await executeWorkflow({
      branchName: `tina/${newBranchName}`,
      baseBranch,
      path,
      values,
      crudType,
      tinaForm,
    });

    if (success) close();
  };

  return (
    <Modal className='flex'>
      <PopupModal className='w-auto'>
        <ModalHeader close={isExecuting ? undefined : close}>
          Branch no longer exists
        </ModalHeader>
        <ModalBody padded={true}>
          {isExecuting ? (
            <WorkflowProgressIndicator
              currentStep={currentStep}
              isExecuting={isExecuting}
              elapsedTime={elapsedTime}
            />
          ) : (
            <div className='max-w-sm'>
              <div className='flex items-start gap-3 p-3 mb-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm'>
                <GitBranchIcon
                  className='w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-600'
                  style={{ fill: 'none' }}
                />
                <span>
                  The branch{' '}
                  <span className='font-mono font-semibold'>{branchName}</span>{' '}
                  no longer exists. It may have been merged or deleted. Your
                  changes cannot be pushed to it.
                </span>
              </div>

              <p className='text-sm text-gray-700 mb-4'>
                Create a new branch from{' '}
                <span className='font-mono font-semibold'>{baseBranch}</span> to
                continue editing, or cancel and switch to an existing branch
                from the branch menu.
              </p>

              {errorMessage && (
                <div className='flex items-center gap-1 text-red-700 py-2 px-3 mb-4 bg-red-50 border border-red-200 rounded'>
                  <BiError className='w-5 h-auto text-red-400 flex-shrink-0' />
                  <span className='text-sm'>
                    <b>Error:</b> {errorMessage}
                  </span>
                </div>
              )}

              <PrefixedTextField
                name='new-branch-name'
                label='New Branch Name'
                placeholder='e.g. my-updates'
                value={newBranchName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  reset();
                  setNewBranchName(formatBranchName(e.target.value));
                }}
              />
            </div>
          )}
        </ModalBody>
        {!isExecuting && (
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
              disabled={!newBranchName}
              onClick={handleCreate}
            >
              <GitBranchIcon
                className='w-4 h-4 mr-1'
                style={{ fill: 'none' }}
              />
              Create new branch
            </Button>
          </ModalActions>
        )}
      </PopupModal>
    </Modal>
  );
};
