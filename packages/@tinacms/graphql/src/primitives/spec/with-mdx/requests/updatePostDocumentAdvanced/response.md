---
title: Hello World
author: content/authors/homer.md
---

How's that?

This is MDX

<Cta title="ok"/>

<BlockQuote
  author="Homer"
  categories={["health"]}
>
  # This is rich-text blockquote
</BlockQuote>

<Hero
  subTitle={
<>
## Oh Hi

<Cta title="Get Started"/>

</>
}
  config={{variant: "primary"}}
>
  # Welcome to my website

  <Cta
    title="Get Started"
    actions={[{title: "Click Here!", _template: "popup", body: "please?"}]}
  />
</Hero>
