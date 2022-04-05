---
title: 'How to Use Syntax Highlighting with TinaMarkdown'
date: '2022-01-20T00:00:00-04:00'
author: James Perkins
last_edited: '2022-01-20T00:00:00Z'
opengraph:
  image:
    url: >-
      https://res.cloudinary.com/forestry-demo/image/upload/v1642688324/blog-media/syntax-highlighting-with-tina/syntax-highlight-cover.png
    width: '1920,'
    height: '1080,'
    alt: 'Syntax Highlighting with Tina'
---

👋 Hello and welcome. Today we are going to walk you through how to use syntax highlighting with TinaMarkdown. Through a very basic setup and example we will walk you through adding syntax highlighting so that your editors will love you (or at least highly appreciate you).

Prefer to learn through videos? Check out our video covering syntax highlighting:

<Youtube embedSrc="https://www.youtube.com/embed/Qp-7YlGisBM" />

## Setup

The starting point that I have created for this tutorial contains a very basic implementation of Tina that includes a blog. It is using our `rich-text` editor and our `TinaMarkdown` component.

```bash
# clone the repository
git clone https://github.com/tinacms/examples.git tina-examples
cd tina-examples

# Starting commit
git checkout 7753363ad1e967524359131565f13791d3a378eb

# move into the directory
cd syntax-highlighting

# install the dependencies
yarn

# launch Tina + Next.js
yarn dev
```

Once our Next.js application is running, you can navigate to [http://localhost:3000/post/HelloWorld](http://localhost:3000/post/HelloWorld). From there you will see a blog post that has a code block that looks a lot like regular text. When this is within a paragraph it may be hard for you or your editors to tell the difference between the code and regular text. Adding syntax highlighting will easily fix that!

![Image without syntax highlighting](https://res.cloudinary.com/forestry-demo/image/upload/v1642686958/blog-media/syntax-highlighting-with-tina/before-image.webp)

## Adding syntax highlighting

### Installing our package

For this tutorial we are going to use `react-syntax-highlighter`. If you prefer a different package, once you make your way through this tutorial and understand how it all works, you can use your favorite package and it will work the same.

```bash
# Install the syntax highlighting package
yarn add react-syntax-highlighter
```

Now we have our syntax highlighter installed, we can create a component that we can pass our `props` to.

### Creating our component

First, we need to create a new filed called `Codeblock.js` inside the `components` folder.

```bash
# create the file in the components directory
touch  ./components/Codeblock.js
```

[Need to compare your code click here for the commit](https://github.com/tinacms/examples/commit/cdfbe238aa5510ec699f4b5066daf3dfc5fcb5ae)

Inside of our newly created `Codeblock.js` file, we need to import a theme and Prism. I am going to use my favorite theme `atomOneDark` but your favorites will work just as well as mine

```jsx
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import atomOneDark from 'react-syntax-highlighter/dist/cjs/styles/prism/material-dark'
```

The component we are creating is going to take on two props: `children` and `language`. The children props holds all of the code we type into a code block, the language will be the language selected when editing the content for example javascript .

```jsx
const Codeblock = ({ children, language }) => {}
```

Now we have our component skeleton we can return our `SyntaxHighlighter` and pass in the `children` `language` .The `SyntaxHighlighter` is going to take on three different props `code`, `language` and `style` for example:

```jsx
<SyntaxHighlighter
  code={YOUR_CODE}
  language={YOUR_LANGUAGE}
  style={YOUR_THEME}
/>
```

So for our component we are going to pass the `children` to the `code` prop and `language` to the `language` prop and the `atomOneDark` to the `style` prop. It should now look like this:

```jsx
const Codeblock = ({ children, language }) => {
  return (
    <SyntaxHighlighter
      code={children || ''}
      language={language || 'jsx'}
      style={atomOneDark}
    />
  )
}
```

You may notice that I included an _or_ statement to the props we are passing in. This will make sure that when we create a new empty code block that Prism doesn’t error out

Finally, we need to export our component for use inside our `[slug].js` file. We can do this by adding `export {Codeblock}` at the bottom of our file. Our component file is now complete, and should look like this:

```jsx
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import atomOneDark from 'react-syntax-highlighter/dist/cjs/styles/prism/material-dark'

const Codeblock = ({ children, language }) => {
  return (
    <SyntaxHighlighter
      code={children || ''}
      language={language || 'jsx'}
      style={atomOneDark}
    />
  )
}

export { Codeblock }
```

[View the completed component in this commit](https://github.com/tinacms/examples/commit/983d80dd7fa07e29fb0d6802d989e40f260fb95d)

[![Join our Discord](https://res.cloudinary.com/forestry-demo/image/upload/v1642688157/blog-media/Join_our_discord.webp)](https://discord.com/invite/zumN63Ybpf)

### Using our component in our `[slug].js`

Now, we will import the component we just created into the `[slug].js` file.

```jsx
import { Codeblock } from '../../components/Codeblock'
```

This gives us access to the component, and we can create a variable called `components`. This `components` variable can hold all of the different components we want our `TinaMarkdown` to use. In our example we are overriding an element versus creating a new component.

```jsx
const components = {}
```

We are going to override the `code_block` element, if you are wondering what elements can be overridden you can find them all in our [tinacms](https://github.com/tinacms/tinacms/blob/main/packages/tinacms/src/rich-text.tsx) package.

Inside our component variable we can put a property named `code_block` which we can then use to override the original styling:

```jsx
const components = {
    code_block:
}
```

Now we are going to use the props that get passed from our `TinaMarkdown` and pass those along to our created component and return that

```jsx
code_block: props => {
  return <Codeblock children={props.children} language={props.lang} />
}
```

Our `components` object is now complete and should look like this:

```jsx
const components = {
  code_block: props => {
    return <Codeblock children={props.children} language={props.lang} />
  },
}
```

The final step is to use these `components` in our `TinaMarkdown`. To do that we are going to pass our components object to the components prop `components={components}` and our `TinaMarkdown` will look like the following:

```jsx
<TinaMarkdown
  content={props.data.getPostDocument.data.body}
  components={components}
/>
```

Now, you can launch using `yarn dev` and navigate back to [http://localhost:3000/post/HelloWorld](http://localhost:3000/post/HelloWorld). You will see that our code block now has Prism syntax highlighting.

![Image with syntax highlighting](https://res.cloudinary.com/forestry-demo/image/upload/v1642686958/blog-media/syntax-highlighting-with-tina/after-image.webp)

You can find the finished code in our [Github](https://github.com/tinacms/examples/tree/main/syntax-highlighting)

## Where can you keep up to date with Tina?

You know that you will want to be part of this creative, innovative, supportive community of developers (and even some editors and designers) who are experimenting and implementing Tina daily.

### Tina Community Discord

Tina has a community [Discord](https://discord.com/invite/zumN63Ybpf) that is full of Jamstack lovers and Tina enthusiasts. When you join you will find a place:

- To get help with issues
- Find the latest Tina news and sneak previews
- Share your project with Tina community, and talk about your experience
- Chat about the Jamstack

### Tina Twitter

Our Twitter account ([@tina_cms](https://twitter.com/tina_cms)) announces the latest features, improvements, and sneak peeks to Tina. We would also be psyched if you tagged us in projects you have built.
