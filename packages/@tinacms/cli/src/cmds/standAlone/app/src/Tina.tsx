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
