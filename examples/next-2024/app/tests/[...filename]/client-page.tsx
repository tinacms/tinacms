"use client";
import type { PostQuery, TestQuery } from "@/tina/__generated__/types";
import mermaid from "mermaid";
import { useEffect, useRef } from "react";
import { useTina } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";

export const useMermaidElement = () => {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mermaidRef.current) {
      mermaid.initialize({ startOnLoad: true });
      mermaid.run();
    }
  }, []);

  return {
    mermaidRef,
  };
};

interface ClientPageProps {
  query: string;
  variables: {
    relativePath: string;
  };
  data: TestQuery;
}

export default function TestClientPage(props: ClientPageProps) {
  // data passes though in production mode and data is updated to the sidebar data in edit-mode
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });
  return (
    <>
      <TinaMarkdown
        content={data.test.testingMdx}
        components={{
          mermaid(props) {
            const { mermaidRef } = useMermaidElement();
            return (
              <div contentEditable={false}>
                <div ref={mermaidRef}>
                  <pre className="mermaid">{props?.value}</pre>
                </div>
              </div>
            );
          },
        }}
      />
      <code>
        <pre>{JSON.stringify(data.test, null, 2)}</pre>
      </code>
    </>
  );
}
