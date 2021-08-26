import React from "react";
import { Container } from "./container";
import { Section } from "./section";
import { ThemeContext } from "./theme";
import format from "date-fns/format";
import { Hero } from "./blocks/hero";
import { Content as ContentBlock } from "./blocks/content";
import { Testimonial } from "./blocks/testimonial";
import { Features } from "./blocks/features";
import { TinaMarkdown } from "../components/editor/tina-markdown";

const blockRenderer = {
  Hero: (props) => <Hero data={props} />,
  Features: (props) => <Features data={props} />,
  Testimonial: (props) => <Testimonial data={props} />,
  ContentBlock: (props) => <ContentBlock data={props} />,
  Highlight: (props) => {
    return <span style={{ background: "yellow", color: "black" }} {...props} />;
  },
  LiveData: (props) => {
    switch (props.value) {
      case "currentTime":
        return <Timer {...props} />;
      case "currentURL":
        return <span>You're viewing a page at {window.location.href}</span>;
      default:
        return null;
    }
  },
};
export default function useInterval(callback, delay) {
  const callbacRef = React.useRef(null);

  // update callback function with current render callback that has access to latest props and state
  React.useEffect(() => {
    callbacRef.current = callback;
  });

  React.useEffect(() => {
    if (!delay) {
      return () => {};
    }

    const interval = setInterval(() => {
      callbacRef.current && callbacRef.current();
    }, delay);
    return () => clearInterval(interval);
  }, [delay]);
}

const Timer = () => {
  const [time, setTime] = React.useState(0);
  useInterval(() => setTime(time + 1), 1000);

  return <span>Counting... {time}</span>;
};

export const Post = ({ data }) => {
  const theme = React.useContext(ThemeContext);
  const titleColorClasses = {
    blue: "from-blue-400 to-blue-600 dark:from-blue-300 dark:to-blue-500",
    teal: "from-teal-400 to-teal-600 dark:from-teal-300 dark:to-teal-500",
    green: "from-green-400 to-green-600",
    red: "from-red-400 to-red-600",
    pink: "from-pink-300 to-pink-500",
    purple:
      "from-purple-400 to-purple-600 dark:from-purple-300 dark:to-purple-500",
    orange:
      "from-orange-300 to-orange-600 dark:from-orange-200 dark:to-orange-500",
    yellow:
      "from-yellow-400 to-yellow-500 dark:from-yellow-300 dark:to-yellow-500",
  };

  const date = new Date(data.date);
  const formattedDate = format(date, "MMM dd, yyyy");

  return (
    <Section className="flex-1">
      <Container className={`flex-1 max-w-4xl pb-2`} size="large">
        <h2
          className={`w-full relative	mb-8 text-6xl font-extrabold tracking-normal text-center title-font`}
        >
          <span
            className={`bg-clip-text text-transparent bg-gradient-to-r ${
              titleColorClasses[theme.color]
            }`}
          >
            {data.title}
          </span>
        </h2>

        <div className="flex items-center justify-center mb-16">
          {data.author && (
            <>
              <div className="flex-shrink-0 mr-4">
                <img
                  className="h-14 w-14 object-cover rounded-full shadow-sm"
                  src={data.author.data.avatar}
                  alt={data.author.data.name}
                />
              </div>
              <p className="text-base font-medium text-gray-600 group-hover:text-gray-800 dark:text-gray-200 dark:group-hover:text-white">
                {data.author.data.name}
              </p>
              <span className="font-bold text-gray-200 dark:text-gray-500 mx-2">
                —
              </span>
            </>
          )}
          <p className="text-base text-gray-400 group-hover:text-gray-500 dark:text-gray-300 dark:group-hover:text-gray-150">
            {formattedDate}
          </p>
        </div>
      </Container>
      {data.heroImg && (
        <div className="">
          <img
            src={data.heroImg}
            className="mb-14 block h-auto max-w-4xl lg:max-w-6xl mx-auto"
          />
        </div>
      )}
      <Container className={`flex-1 max-w-4xl pt-4`} size="large">
        <div className="prose dark:prose-dark  w-full max-w-none">
          <TinaMarkdown>{data._body}</TinaMarkdown>
        </div>
      </Container>
    </Section>
  );
};
