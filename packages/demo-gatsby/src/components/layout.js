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
import { Link } from "gatsby"

import { rhythm, scale } from "../utils/typography"
import { createRemarkButton } from "gatsby-tinacms-remark"
import { withPlugin } from "tinacms"

class Layout extends React.Component {
  render() {
    const { location, title, children } = this.props
    const rootPath = `${__PATH_PREFIX__}/`
    let header

    if (location.pathname === rootPath) {
      header = (
        <h1
          style={{
            ...scale(1.5),
            marginBottom: rhythm(1.5),
            marginTop: 0,
          }}
        >
          <Link
            style={{
              boxShadow: `none`,
              textDecoration: `none`,
              color: `inherit`,
            }}
            to={`/`}
          >
            {title}
          </Link>
        </h1>
      )
    } else {
      header = (
        <h3
          style={{
            fontFamily: `Montserrat, sans-serif`,
            marginTop: 0,
            marginBottom: 0,
          }}
        >
          <Link
            style={{
              boxShadow: `none`,
              textDecoration: `none`,
              color: `inherit`,
            }}
            to={`/`}
          >
            {title}
          </Link>
        </h3>
      )
    }
    return (
      <div>
        <header
          style={{
            marginLeft: `auto`,
            marginRight: `auto`,
            maxWidth: rhythm(24),
            padding: `${rhythm(1)} ${rhythm(3 / 4)}`,
          }}
        >
          {header}
        </header>
        <main>{children}</main>
        <footer
          style={{
            marginLeft: `auto`,
            marginRight: `auto`,
            maxWidth: rhythm(24),
            padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
          }}
        >
          © {new Date().getFullYear()}, Built with
          {` `}
          <a href="https://www.gatsbyjs.org">Gatsby</a> and{" "}
          <a href="https://tinacms.org">TinaCMS</a>
        </footer>
      </div>
    )
  }
}

const CreatePostPlugin = createRemarkButton({
  label: "Create Post",
  filename({ title }) {
    return `content/blog/${title.replace(/\s+/g, "-").toLowerCase()}/index.md`
  },
  frontmatter({ title }) {
    // Asynchronously generate front matter by fetching data from some server.
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          title,
          date: new Date(),
          heading_color: "#e6faf8",
          description: "A human friendy summary",
          thumbnail: "../../assets/profile-pic.jpg",
        })
      }, 1000)
    })
  },
  body({ title }) {
    return `# ${title}`
  },
  fields: [
    { name: "title", label: "Title", component: "text", required: true },
  ],
})

export default withPlugin(Layout, CreatePostPlugin)
