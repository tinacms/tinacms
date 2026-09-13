/**



*/

import { Alerts } from '@toolkit/react-alerts';
import { ModalProvider } from '@toolkit/react-modals';
import { SidebarPosition, SidebarProvider } from '@toolkit/react-sidebar';
import * as React from 'react';
import { useCMS } from '../react-tinacms/use-cms';
import { ActiveFieldIndicator } from './active-field-indicator';
import { MediaManager } from './media';
import { MutationSignalProvider } from './mutation-signal';
import { ResizeOverlay } from './resize-overlay';

export interface TinaUIProps {
  position?: SidebarPosition;
  styled?: boolean;
  children?: React.ReactNode;
}

export const TinaUI: React.FC<TinaUIProps> = ({ children, position }) => {
  const cms = useCMS();
  const [resizingSidebar, setResizingSidebar] = React.useState(false);

  return (
    <MutationSignalProvider>
      <ModalProvider>
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
        <ActiveFieldIndicator />
        {/* Overlay captures mouse events during resize without affecting iframe focus */}
        <ResizeOverlay isResizing={resizingSidebar} />
        {children}
      </ModalProvider>
    </MutationSignalProvider>
  );
};
