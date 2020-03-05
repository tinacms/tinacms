/**

Copyright 2019 Forestry.io Inc

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

import React from "react"
import { graphql } from "gatsby"
import TestMdxForm from "../components/test-mdx-form"

const HelloPage = props => {
  const mdx = props.data.mdx
  return (
    <div>
      <h1>Hi Joe</h1>
      <TestMdxForm mdx={mdx} />
    </div>
  )
}

export default HelloPage

// Add ...TinaMdx fragment to query
export const pageQuery = graphql`
  query {
    mdx(fileRelativePath: { eq: "/content/mdx/hello.mdx" }) {
      ...TinaMdx
      frontmatter {
        title
      }
      body
    }
  }
`
