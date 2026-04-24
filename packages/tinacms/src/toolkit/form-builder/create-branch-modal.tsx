import * as React from 'react';
import { BiError } from 'react-icons/bi';
import { GitBranchIcon, TriangleAlert } from 'lucide-react';
import { Button, DropdownButton } from '@toolkit/styles';
import { useCMS } from '../react-core';
import {
  Modal,
  ModalActions,
  ModalBody,
  ModalHeader,
  PopupModal,
} from '../react-modals';
import { FieldLabel } from '@toolkit/fields';
import { Form } from '@toolkit/forms';
import { useEditorialWorkflow } from './use-editorial-workflow';
import { WorkflowProgressIndicator } from './workflow-progress-indicator';

// Format the default branch name by removing content/ prefix and file extension
const formatDefaultBranchName = (
  filePath: string,
  crudType: string
): string => {
  let result = filePath;

  const contentPrefix = 'content/';
  // Remove "content/" prefix if present
  if (result.startsWith(contentPrefix)) {
    result = result.substring(contentPrefix.length);
  }

  // Remove file extension
  const lastDot = result.lastIndexOf('.');
  const lastSlash = Math.max(result.lastIndexOf('/'), result.lastIndexOf('\\'));
  if (lastDot > lastSlash && lastDot > 0) {
    result = result.slice(0, lastDot);
  }

  // Add deletion indicator for delete operations
  if (crudType === 'delete') {
    result = `❌-${result}`;
  }

  return result;
};

export const CreateBranchModal = ({
  close,
  safeSubmit,
  path,
  values,
  crudType,
  tinaForm,
  onBaseBranchDeleted,
}: {
  safeSubmit: () => Promise<void>;
  close: () => void;
  path: string;
  values: Record<string, unknown>;
  crudType: string;
  tinaForm?: Form;
  onBaseBranchDeleted?: () => void;
}) => {
  const cms = useCMS();
  const tinaApi = cms.api.tina;
  const [newBranchName, setNewBranchName] = React.useState(
    formatDefaultBranchName(path, crudType)
  );
  const [isBranchGuardChecking, setIsBranchGuardChecking] =
    React.useState(false);

  const {
    isExecuting,
    errorMessage,
    currentStep,
    elapsedTime,
    executeWorkflow,
    reset,
  } = useEditorialWorkflow();

  const executeEditorialWorkflow = async () => {
    setIsBranchGuardChecking(true);

    const baseBranch = decodeURIComponent(tinaApi.branch);

    let baseBranchExists = true;
    try {
      console.debug(
        '[tina:branch-guard] executeEditorialWorkflow: checking base branch:',
        baseBranch
      );
      baseBranchExists = await tinaApi.branchExists(baseBranch);
    } catch (err) {
      console.error(
        '[tina:branch-guard] executeEditorialWorkflow: branchExists threw, failing open:',
        err
      );
    }
    console.debug(
      '[tina:branch-guard] executeEditorialWorkflow: base branch exists?',
      baseBranchExists
    );

    if (!baseBranchExists) {
      console.debug(
        '[tina:branch-guard] executeEditorialWorkflow: base branch deleted — handing off'
      );
      onBaseBranchDeleted?.();
      return;
    }

    setIsBranchGuardChecking(false);

    const success = await executeWorkflow({
      branchName: `tina/${newBranchName}`,
      baseBranch,
      path,
      values,
      crudType,
      tinaForm,
    });

    if (success) {
      close();
    }
  };

  const renderStateContent = () => {
    if (isExecuting) {
      return (
        <WorkflowProgressIndicator
          currentStep={currentStep}
          isExecuting={isExecuting}
          elapsedTime={elapsedTime}
        />
      );
    } else {
      return (
        <div className='max-w-sm'>
          {errorMessage && (
            <div className='flex items-center gap-1 text-red-700 py-2 px-3 mb-4 bg-red-50 border border-red-200 rounded'>
              <BiError className='w-5 h-auto text-red-400 flex-shrink-0' />
              <span className='text-sm'>
                <b>Error:</b> {errorMessage}
              </span>
            </div>
          )}
          <p className='text-lg text-gray-700 font-bold mb-2'>
            First, let's create a copy
          </p>
          <p className='text-sm text-gray-700 mb-4 max-w-sm'>
            To make changes, you need to create a copy then get it approved and
            merged for it to go live.
            <br />
            <br />
            <span className='text-gray-500'>Learn more about </span>
            <a
              className='underline text-tina-orange-dark font-medium'
              href='https://tina.io/docs/r/editorial-workflow'
              target='_blank'
            >
              Editorial Workflow
            </a>
            .
          </p>
          <PrefixedTextField
            name='new-branch-name'
            label={'Branch Name'}
            placeholder='e.g. {{PAGE-NAME}}-updates'
            value={newBranchName}
            onChange={(e) => {
              // reset error state on change
              reset();
              setNewBranchName(e.target.value);
            }}
          />
        </div>
      );
    }
  };

  return (
    <Modal className='flex'>
      <PopupModal className='w-auto'>
        <ModalHeader close={isExecuting ? undefined : close}>
          <div className='flex items-center justify-between w-full'>
            <div className='flex items-center'>Save changes to new branch</div>
          </div>
        </ModalHeader>
        <ModalBody padded={true}>{renderStateContent()}</ModalBody>
        {!isExecuting && (
          <ModalActions align='end'>
            <Button
              variant='secondary'
              className='w-full sm:w-auto'
              onClick={close}
            >
              Cancel
            </Button>
            <DropdownButton
              variant='primary'
              align='start'
              className='w-full sm:w-auto'
              disabled={newBranchName === '' || isBranchGuardChecking}
              onMainAction={executeEditorialWorkflow}
              items={[
                {
                  label: 'Save to Protected Branch',
                  onClick: () => {
                    close();
                    safeSubmit();
                  },
                  icon: <TriangleAlert className='w-4 h-4' />,
                },
              ]}
            >
              <GitBranchIcon
                className='w-4 h-4 mr-1'
                style={{ fill: 'none' }}
              />
              Save to a new branch
            </DropdownButton>
          </ModalActions>
        )}
      </PopupModal>
    </Modal>
  );
};

export const PrefixedTextField = ({
  label = null,
  prefix = 'tina/',
  ...props
}) => {
  return (
    <>
      {label && <FieldLabel name={props.name}>{label}</FieldLabel>}
      <div className='border border-gray-200 focus-within:border-blue-200 bg-gray-100 focus-within:bg-blue-100 rounded shadow-sm focus-within:shadow-outline overflow-hidden flex items-stretch divide-x divide-gray-200 focus-within:divide-blue-100 w-full transition-all ease-out duration-150'>
        <span className='pl-3 pr-2 py-2 text-base text-tina-orange-dark bg-tina-orange-light'>
          {prefix}
        </span>
        <input
          id={props.name}
          type='text'
          className='shadow-inner focus:outline-none block text-base placeholder:text-gray-300 px-3 py-2 text-gray-600 flex-1 bg-white focus:text-gray-900'
          {...props}
        />
      </div>
    </>
  );
};
