import ReactMarkdown from "react-markdown";

const BlogList = (props) => {

  return (
    <div>
      <h3>Hi! My name is {props.data.frontmatter.name || 'no name'}</h3>
      <ReactMarkdown>{props.data.markdownBody || 'md body goes here'}</ReactMarkdown>
      <style jsx>
        {`
          div {
            width: 100%;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            text-align: center;
          }
        `}
      </style>
    </div>
  );
};

export default BlogList;
