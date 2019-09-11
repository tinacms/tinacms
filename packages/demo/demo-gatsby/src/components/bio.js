/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"
import { useJsonForm } from "@tinacms/react-tinacms-json"

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
        firstName
        lastName
        location
        social {
          twitter
        }
        fileRelativePath
        rawJsonData
      }
    }
  `)

  const author = useJsonForm(data.dataJson, {
    fields: [
      { name: "firstName", component: "text" },
      { name: "lastName", component: "text" },
      { name: "location", component: "text" },
    ],
  })

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
