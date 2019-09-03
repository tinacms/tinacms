# Creating Markdown in Gatsby

Creating new Markdown files is made possible by two plugins:

- `gatsby-tinacms-remark`: Provides hooks and components for creating Remark forms.
- `gatsby-tinacms-git`: Extends the gatsby development server to writes changes to the local filesystem;
  and registers [CMS Backend](../concepts/backends.md) for saving changes to that backend.

## Creating Content-Button Plugins

XEditor uses `content-button` plugins to render buttons at the top of the xeditor sidebar. These buttons are used for creating new content in the CMS. The `createRemarkButton` function helps us constructs `content-button` plugins for creating markdown files.

```javascript
import { createRemarkButton } from '@tinacms/react-tinacms-remark'

const CreatePostButton = createRemarkButton({ label: 'Create Post' })
```

This will add a button with the text `Create Post` to the sidebar. Clicking the button will reveal a text input that accepts the path of the markdown file to be created.

### Formattting the Filename

To simplify file creation for content writers, the `createRemarkButton` can be given a `filename` function that calculates the path.

**Example 1: Hardcoded Content Directory**

```javascript
const CreatePostButton = createRemarkButton({
  label: 'Create Post',
  filename: name => `content/blog/${name}.md`,
})
```

**Example 2: Content as index fiels**

```javascript
const CreatePostButton = createRemarkButton({
  label: 'Create Post',
  filename: name => `content/blog/${name}/index.md`,
})
```

**Example 3: Slugify Name**

```javascript
const CreatePostButton = createRemarkButton({
  label: 'Create Post',
  filename: name => {
    let slug = name.replace(/\s+/, '-').toLowerCase()

    return `content/blog/${slug}/index.md`
  },
})
```

### Providing Default Frontmatter

The `createRemarkButton` function can be given a `frontmatter` function that returns the default frontmatter.

**Example: Title + Date**

```javascript
const CreatePostButton = createRemarkButton({
  label: 'Create Post',
  frontmatter: title => ({
    title,
    date: new Date(),
  }),
})
```

### Providign a Default Body

The `createRemarkButton` function can be given a `frontmatter` function tht returns the default frontmatter.

**Example: Title + Date**

```javascript
const CreatePostButton = createRemarkButton({
  label: 'Create Post',
  body: () => `This is a new blog post. Please write some content.`,
})
```

## Adding the Button

### Only show on the Blog index

In this example, we use the `withPlugin` higher order component from `@tinacms/react-tinacms` to add the button
to the XEditor when visiting the blog index page.

**Example: src/pages/index.js**

```jsx
import { usePlugin } from '@tinacms/react-tinacms'
import { createRemarkButton } from '@tinacms/react-tinacms-remark'

function BlogIndex(props) {
  const { data } = props
  const posts = data.allMarkdownRemark.edges

  return (
    <Layout location={props.location}>
      {posts.map(({ node }) => {
        const title = node.frontmatter.title || node.fields.slug
        return (
          <div key={node.fields.slug}>
            <h3>
              <Link style={{ boxShadow: `none` }} to={node.fields.slug}>
                {title}
              </Link>
            </h3>
            <small>{node.frontmatter.date}</small>
            <p
              dangerouslySetInnerHTML={{
                __html: node.frontmatter.description || node.excerpt,
              }}
            />
          </div>
        )
      })}
    </Layout>
  )
}

// Create the button plugin
const CreatePostButton = createRemarkButton({
  label: 'Create Post',
  filename: name => {
    let slug = name.replace(/\s+/, '-').toLowerCase()

    return `content/blog/${slug}/index.md`
  },
  frontmatter: title => ({
    title,
    date: new Date(),
  }),
})

export default withPlugin(BlogIndex, CreatePostButton)
```
