import React from "react"
import { Link } from "gatsby"

import { rhythm, scale } from "../utils/typography"
import { createRemarkButton } from "@tinacms/react-tinacms-remark"
import { withPlugin } from "@tinacms/react-tinacms"

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
          <a href="https://www.gatsbyjs.org">Gatsby</a>
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
    console.log({ title })
    // Asynchronously generate front matter by fetching data from some server.
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          title,
          date: new Date(),
          heading_color: "pink",
          description: "My new post. ",
        })
      }, 1000)
    })
  },
  body({ title }) {
    return `# ${title}`
  },
})

export default withPlugin(Layout, CreatePostPlugin)
