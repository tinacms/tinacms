/**

*/

import React from 'react'
import type { TinaCMS } from '@tinacms/toolkit'

import GetCMS from '../components/GetCMS'
import { PageWrapper, PageHeader, PageBodyNarrow } from '../components/Page'

const DashboardPage = () => {
  return (
    <GetCMS>
      {(cms: TinaCMS) => (
        <PageWrapper>
          <>
            <PageHeader isLocalMode={cms.api?.tina?.isLocalMode}>
              <h3 className="text-2xl font-sans text-gray-700">
                Welcome to Tina!
              </h3>
            </PageHeader>
            <PageBodyNarrow>
              This is your dashboard for editing or creating content. Select a
              collection on the left to begin.
            </PageBodyNarrow>
          </>
        </PageWrapper>
      )}
    </GetCMS>
  )
}

export default DashboardPage
