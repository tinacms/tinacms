/**



*/

import * as React from 'react'
import { ModalProvider } from '@toolkit/react-modals'
import { SidebarProvider, SidebarPosition } from '@toolkit/react-sidebar'
import { useCMS } from '../react-tinacms/use-cms'
import { Alerts } from '@toolkit/react-alerts'
import { MediaManager } from './media'
import { ActiveFieldIndicator } from './active-field-indicator'
import { MutationSignalProvider } from './mutation-signal'
import { BranchPickerProvider } from '@toolkit/hooks/use-branch-picker'
import { FileProvider } from './context-files'
import { CreateBranchModel } from '@toolkit/form-builder'

export interface TinaUIProps {
  position?: SidebarPosition
  styled?: boolean
  children?: React.ReactNode
}

export const TinaUI: React.FC<TinaUIProps> = ({ children, position }) => {
  const cms = useCMS()
  const [resizingSidebar, setResizingSidebar] = React.useState(false)
  const [createBranchModalOpen, setCreateBranchModalOpen] =
    React.useState(false)

  const getDirty = cms.forms.all().find((form) => form.dirty)

  return (
    <MutationSignalProvider>
      <ModalProvider>
        <FileProvider>
          <BranchPickerProvider
            createBranchModalOpen={createBranchModalOpen}
            setCreateBranchModalOpen={setCreateBranchModalOpen}
          >
            <Alerts alerts={cms.alerts} />
            <MediaManager />
            {cms.sidebar && (
              <SidebarProvider
                resizingSidebar={resizingSidebar}
                setResizingSidebar={setResizingSidebar}
                position={position}
                sidebar={cms.sidebar}
              />
            )}
            {createBranchModalOpen && (
              <CreateBranchModel
                safeSubmit={safeSubmit}
                crudType={getDirty ? getDirty.crudType : null}
                relativePath={getDirty ? getDirty.relativePath : null}
                values={getDirty ? getDirty.values : null}
                close={() => setCreateBranchModalOpen(false)}
              />
            )}
            <ActiveFieldIndicator />
            {/* Dragging across the iframe causes mouse events to stop propagating so there's a laggy feeling without this */}
            <div className={`${resizingSidebar ? 'pointer-events-none' : ''}`}>
              {children}
            </div>
          </BranchPickerProvider>
        </FileProvider>
      </ModalProvider>
    </MutationSignalProvider>
  )
}
