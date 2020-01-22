import matter from "gray-matter";
import { useLocalMarkdownForm } from 'next-tinacms-markdown';

import Layout from "../components/Layout";
import BlogList from "../components/BlogList";


export default function Index(props) {
  const formOptions = {
    label: 'Home Page',
    fields: [
      { label:"Name",
        name:"frontmatter.name",
        component: "text"
      },
        {
        name: 'markdownBody',
        label: 'Home Page Content',
        component: 'markdown',
      },
    ]
  }
  const [data] = useLocalMarkdownForm(props.data, formOptions)

  console.log("data", data)
  return (
    <Layout 
      pathname="/" 
      siteTitle={props.title} 
      siteDescription={props.description}
    >
      <section>
        <BlogList data={data} />
      </section>
    </Layout>
  );
};

Index.getInitialProps = async function() {
  const configData = await import(`../data/config.json`)
  const indexData = await import(`../data/index.md`)
  const data = matter(indexData.default)

  return {
    title: configData.title,
    description: configData.description,
    data: {
      fileRelativePath: `data/index.md`,
      frontmatter: data.data,
      markdownBody: data.content
    }
  }
}