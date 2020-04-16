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

/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"
import { useJsonForm } from "gatsby-tinacms-json"
import { useCMS, useFormScreenPlugin } from "tinacms"

import { rhythm } from "../utils/typography"

const fields = [
  {
    label: "First Name",
    name: "rawJson.firstName",
    description: "Enter first name",
    component: "text",
  },
  {
    label: "Last Name",
    name: "rawJson.lastName",
    description: "Enter last name",
    component: "text",
  },
  {
    label: "Location",
    name: "rawJson.location",
    description: "Enter where they're based",
    component: "text",
  },
]
const Bio = () => {
  const cms = useCMS()
  cms.sidebar.isHidden = false

  const data = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
        childImageSharp {
          fixed(width: 50, height: 50) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      dataJson(fileRelativePath: { eq: "/data/author.json" }) {
        id
        firstName
        lastName
        location
        social {
          twitter
        }
        fileRelativePath
        rawJson
      }
    }
  `)

  const [author, authorForm] = useJsonForm(data.dataJson, {
    label: "Author",
    fields,
  })

  useFormScreenPlugin(authorForm)

  return (
    <div
      style={{
        display: `flex`,
      }}
    >
      <Image
        fixed={data.avatar.childImageSharp.fixed}
        alt={`${author.firstName}_${author.lastName}`}
        style={{
          marginRight: rhythm(1 / 2),
          marginBottom: 0,
          minWidth: 50,
          borderRadius: `100%`,
        }}
        imgStyle={{
          borderRadius: `50%`,
        }}
      />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontWeight: "600" }}>Author</span>
        <a
          href={`https://twitter.com/${author.twitter}`}
          style={{
            color: "inherit",
          }}
        >
          {author.firstName} {author.lastName}
        </a>
      </div>
    </div>
  )
}

export default Bio
