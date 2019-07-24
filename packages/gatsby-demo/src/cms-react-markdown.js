import { useCMSForm } from "@forestryio/cms"

export function useMarkdownRemarkForm(markdownRemark) {
  return useCMSForm({
    name: `markdownRemark:${markdownRemark.slug}`,
    initialValues: markdownRemark,
    fields: [
      { name: "frontmatter.title", component: "text" },
      { name: "frontmatter.date", component: "text" },
    ],
    onSubmit() {
      console.log("Test")
    },
  })
}
