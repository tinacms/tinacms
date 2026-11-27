import {
  Modal,
  ModalBody,
  ModalHeader,
  PopupModal,
} from '@toolkit/react-modals';
import { useCMS } from '@toolkit/react-tinacms';
import * as React from 'react';
import { useBranchData } from './branch-data';
import { BranchSwitcher } from './branch-switcher';
import type { Branch } from './types';

interface SubmitModalProps {
  close(): void;
}

export const BranchModal = ({ close }: SubmitModalProps) => {
  const tinaApi = useCMS().api.tina;
  const { setCurrentBranch } = useBranchData();
  const [modalTitle, setModalTitle] = React.useState<string>('Branch List');

  return (
    <Modal>
      <PopupModal className=' w-[800px]'>
        <ModalHeader close={close}>{modalTitle}</ModalHeader>
        <ModalBody padded={false}>
          <BranchSwitcher
            // Index statuses are fetched lazily for the rows on screen.
            listBranches={async () => {
              const branches = await tinaApi.listBranches({
                includeIndexStatus: false,
              });
              if (!Array.isArray(branches)) return [];
              const list: Branch[] = [];
              for (const branch of branches) {
                if (typeof branch.name === 'string') {
                  list.push({ ...branch, name: branch.name });
                }
              }
              return list;
            }}
            createBranch={async (data) => {
              return await tinaApi.createBranch(data);
            }}
            chooseBranch={setCurrentBranch}
            setModalTitle={setModalTitle}
          />
        </ModalBody>
      </PopupModal>
    </Modal>
  );
};
