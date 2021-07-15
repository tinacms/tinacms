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
import { TinaCMS } from 'tinacms'
import {
  TinaCloudAuthWall,
  useDocumentCreatorPlugin,
} from 'tina-graphql-gateway'
import { createClient } from '../utils/'
import { useGraphqlForms } from 'tina-graphql-gateway'

const TinaWrapper = (props) => {
  const cms = React.useMemo(() => {
    return new TinaCMS({
      apis: {
        tina: createClient(),
      },
      enabled: true,
      sidebar: true,
    })
  }, [])
  return (
    <TinaCloudAuthWall cms={cms}>
      {props.query ? <Inner {...props} /> : props.children(props)}
    </TinaCloudAuthWall>
  )
}

const Inner = (props) => {
  const [payload, isLoading] = useGraphqlForms({
    query: (gql) => gql(props.query),
    variables: props.variables || {},
  })
  const [payloadTheme, isLoadingTheme] = useGraphqlForms({
    query: (gql) => gql(ThemeQuery),
    variables: props.variables || {},
  })
  // useDocumentCreatorPlugin();
  return (
    <>
      {isLoading || isLoadingTheme ? (
        <>
          <div>loading</div>
          <div
            style={{
              pointerEvents: 'none',
            }}
          >
            {props.children(props)}
          </div>
        </>
      ) : (
        // pass the new edit state data to the child
        props.children({ ...props, pageProps: payload, theme: payloadTheme })
      )}
    </>
  )
}

export const ThemeQuery = `#graphql
query getTheme {
  getThemeDocument(relativePath: "NormalTheme.json") {
    id
    data {
      __typename ... on Theme_Doc_Data {
        color
        btnStyle
      }
    }
  }
}
`

export default TinaWrapper
