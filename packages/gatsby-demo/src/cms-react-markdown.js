import { useCMSForm } from "@forestryio/cms-react"

export function useMarkdownRemarkForm(markdownRemark) {
  return useCMSForm({
    name: `markdownRemark:${markdownRemark.slug}`,
    initialValues: markdownRemark,
    fields: generateFields(markdownRemark),
    onSubmit() {
      console.log("Test")
    },
  })
}

function generateFields(post) {
  let frontmatterFields = Object.keys(post.frontmatter).map(key => ({
    component: "text",
    name: `frontmatter.${key}`,
  }))

  return [...frontmatterFields, { component: "text", name: "html" }]
}
