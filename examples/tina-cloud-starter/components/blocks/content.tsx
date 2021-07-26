import React from "react";
import Markdown from "react-markdown";
import { Container } from "../container";
import { Section } from "../section";

export const Content = ({ data }) => {
  return (
    <Section color={data.color}>
      <Container
        className={`max-w-4xl prose prose-lg ${
          data.color === "primary" ? `prose-primary` : `dark:prose-dark`
        }`}
        size="large"
      >
        <Markdown>{data.body}</Markdown>
      </Container>
    </Section>
  );
};
