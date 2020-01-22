import Header from "./Header";
import Meta from './Meta'

export default function Layout(props) {
  return (
    <section
      className="layout"
    >
    <Meta 
      siteTitle={props.siteTitle} 
      siteDescription={props.siteDescription} 
    />
    <Header siteTitle={props.siteTitle} />
    <div className="content">{props.children}</div>
    <style jsx>
      {`
        .layout {
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .content {
          flex-grow: 1;
        }
        @media (min-width: 768px) {
          .layout {
            display: block;
          }
          .content {
            flex-grow: none;
            width: 70vw;
            margin-left: 30vw;
          }
        }
      `}
    </style>
  </section>
  );
}