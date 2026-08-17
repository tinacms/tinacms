import * as React from 'react';
import {
  Modal,
  ModalBody,
  ModalHeader,
  PopupModal,
} from '@toolkit/react-modals';
import { WorkflowProgressIndicator } from './workflow-progress-indicator';

interface EditorialWorkflowProgressModalProps {
  title: string;
  currentStep: number;
  elapsedTime: number;
}

/**
 * Shared modal shell for any "we're creating a branch + PR right now"
 * state. Both the content-save flow (`CreateBranchModal`) and the
 * media-store flow (`MediaWorkflowOverlay`) render this while the
 * workflow is in flight so the editor sees the same indicator regardless
 * of what triggered it.
 */
export const EditorialWorkflowProgressModal = ({
  title,
  currentStep,
  elapsedTime,
}: EditorialWorkflowProgressModalProps) => (
  <Modal className='flex'>
    <PopupModal className='w-auto'>
      <ModalHeader>{title}</ModalHeader>
      <ModalBody padded={true}>
        <WorkflowProgressIndicator
          currentStep={currentStep}
          isExecuting
          elapsedTime={elapsedTime}
        />
      </ModalBody>
    </PopupModal>
  </Modal>
);
