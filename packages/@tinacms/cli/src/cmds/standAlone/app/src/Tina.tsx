/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react'
import TinaCMS, { TinaAdmin } from 'tinacms'

// @ts-expect-error
import schema from 'TINA_IMPORT'

export const TinaAdminWrapper = () => {
  return (
    <TinaCMS
      //   apiURL="https://content.tinajs.io/content/05477644-3e42-44dd-87ea-ab81992db347/github/main"
      apiURL="http://localhost:4001/graphql"
      schema={schema}
    >
      <TinaAdmin />
    </TinaCMS>
  )
}
