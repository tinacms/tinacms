/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"
import { useJsonForm } from "../../../../gatsby/gatsby-tinacms-json"

import { rhythm } from "../utils/typography"

const Bio = () => {
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

  const [author] = useJsonForm(data.dataJson, {
    label: "Author",
    fields: [
      { label: "First Name", name: "rawJson.firstName", description:"Enter first name", component: "text" },
      { label: "Last Name", name: "rawJson.lastName", description:"Enter last name", component: "text" },
      { label: "Location", name: "rawJson.location", description:"Enter where they're based", component: "text" },
    ],
  })

  /*
    //for testing single / multiple forms
   const author = data.dataJson
  */

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
