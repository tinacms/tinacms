---
title: Using the power of MDX with Tina
date: '2021-12-09T12:09:32-04:00'
author: James Perkins
last_edited: '2021-12-09T12:09:32-04:00'
---

# Using the power of MDX with Tina

Tina allows content teams and developers to work at a fast pace and removes the friction between static sites and editing content. We took this approach a step further with the release of our MDX support, which allows developers to create reusable components and content teams to use them whenever they need to. This blog post will show you how to add Tina to your site, then how to create and use components to Tina.

### Project setup.

Step 1: Create a project with tailwind

```bash,copy
npx create-next-app -e with-tailwindcss tina-demo
cd tina-demo
```

Step 2: Add Tina to the project

Use the following command inside of the project to add all the Tina dependencies and wrap the application, ready to be used.

```bash,copy
npx @tinacms/cli@latest init
```

When you are asked if you want to replace your `_app.js` file, select Y as we want our init command to take care of adding the Tina specific code.
Step 3: Test Tina

Run `yarn dev` from the project directory and navigate to [http://localhost:3000/demo/blog/HelloWorld](http://localhost:3000/demo/blog/HelloWorld) , you can then enter edit mode by navigating to http://localhost:3000/admin

## Using Tina rich editor

To first use an MDX component we need to use Tina's rich editor, this will allow us to render the components and still have the power of an intuitive markdown editor. Shutdown your local server and we can start adding our changes.

### Update our Tina Schema.

Open up the `.tina/schema.ts` file and edit the body section from the following

```typescript,copy
{
  type: "string",
  label: "Blog Post Body",
  name: "body",
  isBody: true,
  ui: {
    component: "textarea"
  },
 },
```

to

```typescript,copy
  {
    type: 'rich-text',
    label: "Blog Post Body",
    name: "body",
    templates: [],
    isBody: true,
  },
```

We will fill in the `templates` section with all of our components later, we are just replacing the `textArea` with our Rich Text editor which allows us to use markdown and MDX components.

### Updating our [filename].js

Firstly, we need to remove all the code we no longer need. Let us go ahead and remove all the code in the tag including the tags itself:

The code to remove

```html
<head>
  {/* Tailwind CDN */}
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.7/tailwind.min.css"
    integrity="sha512-y6ZMKFUQrn+UUEVoqYe8ApScqbjuhjqzTuwUMEGMDuhS2niI8KA3vhH2LenreqJXQS+iIXVTRL2iaNfJbDNA1Q=="
    crossorigin="anonymous"
    referrerpolicy="no-referrer"
  />
  {/* Marked CDN */}
  <script
    type="text/javascript"
    crossorigin="anonymous"
    src="https://cdn.jsdelivr.net/npm/marked@3.0.8/lib/marked.min.js"
  />
</head>
```

Now that you have removed the first part of the unused code, we can import `TinaMarkdown` to handle parsing the markdown and in the future handle our components.

At the top of the file your import section should now look like:

```javascript,copy
import { staticRequest, gql, getStaticPropsForTina } from 'tinacms'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { createGlobalStyle } from 'styled-components'
```

### Replace marked with `TinaMarkdown`

Now that we are adding our rich-text editor, we no longer need to use marked to parse the HTML. We can remove the following:

```diff
- {typeof window !== "undefined" && (
-   <ContentSection content={window.marked.parse(props.data.post.body)}>
+   <ContentSection content={props.data.post.body}>
</ContentSection>
- )}
```

Then on line 234 we can replace the div that held the parsed markdown with our TinaMarkdown component.

```diff
- <div dangerouslySetInnerHTML={{ __html: content }}></div>
+ <TinaMarkdown content={content} />
```

Go ahead and run `yarn dev` and navigate back to http://localhost:3000/demo/blog/HelloWorld you'll notice that the editing experience has changed, with the ability to insert markdown and a new button called "Embed".

![Tina Markdown Example](https://res.cloudinary.com/forestry-demo/image/upload/v1638886705/blog-media/Tina-markdown-demo.png)

## Adding an MDX Component

Adding components to Tina requires the following:

1. A component that is powered by props
2. Adding the component and editable fields
3. Adding it to the `TinaMarkdown` component

For this blog post, let's create a customized callout that changes based on the selection. We can have a "default", "warning", "error". To save time I have created the component for you, go ahead and create a new folder called `components` on the root of the project and create a file called `Callout.js` and paste in the following code:

```javascript,copy
const backgroundColor = {
  warning: 'bg-yellow-200',
  error: 'bg-red-600',
  default: 'bg-gray-200',
}

const textColor = {
  warning: 'text-gray-600',
  error: 'text-white	',
  default: 'text-gray-600',
}

const Callout = ({ callout }) => {
  const background = backgroundColor[callout.type]
  const color = textColor[callout.type]

  return (
    <div className={`${background} ${color} flex rounded-lg mt-6 p-6`}>
      <div className="">{callout.text}</div>
    </div>
  )
}

export default Callout
```

Before we continue on, let us talk about this component. It is taking a prop named "callout", which provides the type of callout and callout text. The callout type will change the text color and background color.

### Update the tina schema.

In our `schema.ts` when we created our rich-text body section it had a templates array that was empty. We are going to add an object that contains our Callout component, that will drive our editable experience.

The important thing to note is the name needs to match our component name, so our example is Callout. Then the fields will be the parts we want to be editable; so we are going to name them type and text which will be editable by our users.

To make the experience more enjoyable, we are going to add a UI object that holds the defaults. When someone adds our Callout it will automatically have content. Below goes in our templates array.

```typescript,copy
{
  name: "Callout",
  label: "Callout",
  ui: {
    defaultItem: {
      type: "default",
      text: "Lorem ipsum dolor sit amet.",
    },
  },
  fields: [
    {
      name: "type",
      label: "Type",
      type: "string",
      options: ["default", "warning", "error"],
    },
    {
      name: "text",
      label: "Text",
      type: "string",
    },
  ],
},
```

### Registering our component in our front end.

The piece is to register the component with our `TinaMarkdown` . Open up the `[filename].js` file again. First, we need to import our component so add the following to the top of the file:

```javascript,copy
import Callout from '../../../components/Callout'
```

For code clarity, we can create an object that contains all the different Tina-powered components. We are going to pass the props through to our components so we can define that here.

```javascript,copy
const components = {
  Callout: props => {
    return <Callout callout={props} />
  },
}
```

Finally, we can update your `TinaMarkdown` component to pass the components for our users to use.

```javascript,copy
<TinaMarkdown content={content} components={components} />
```

Now relaunch your application and navigate back to the editable page, then click the "Embed" button and you will see the "Callout" as an option. You will see a button appear in the editable UI and a new callout appear on the page.

![Callout](https://res.cloudinary.com/forestry-demo/image/upload/v1638886705/blog-media/Callout.png)

Then when you select the button you will have the option to switch the type and edit the text.

![Warning](https://res.cloudinary.com/forestry-demo/image/upload/v1638886705/blog-media/warning.png)
