// tina/config.tsx
import { defineConfig } from "tinacms";

// src/components/layout/actions.tsx
import { Link } from "react-router-dom";
import { BiRightArrowAlt } from "react-icons/bi";

// src/lib/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/components/layout/actions.tsx
import { tinaField } from "tinacms/dist/react";
import { jsx, jsxs } from "react/jsx-runtime";

// src/components/layout/section.tsx
import { jsx as jsx2 } from "react/jsx-runtime";

// src/components/layout/container.tsx
import { jsx as jsx3 } from "react/jsx-runtime";

// src/components/layout/layout-context.tsx
import React, { useState, useContext, useEffect } from "react";
import { jsx as jsx4 } from "react/jsx-runtime";
var defaultTheme = {
  color: "blue",
  font: "sans",
  darkMode: "system"
};
var LayoutContext = React.createContext({
  globalSettings: {},
  theme: defaultTheme
});

// src/components/layout/icon.tsx
import { tinaField as tinaField2 } from "tinacms/dist/react";
import { BiLayer, BiSearchAlt2, BiTerminal } from "react-icons/bi";
import { jsx as jsx5, jsxs as jsxs2 } from "react/jsx-runtime";
var IconOptions = {
  Tina: (props) => jsxs2(
    "svg",
    {
      ...props,
      viewBox: "0 0 66 80",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: [
        jsx5("title", { children: "Tina" }),
        jsx5(
          "path",
          {
            d: "M39.4615 36.1782C42.763 33.4475 44.2259 17.3098 45.6551 11.5091C47.0843 5.70828 52.995 6.0025 52.995 6.0025C52.995 6.0025 51.4605 8.67299 52.0864 10.6658C52.7123 12.6587 57 14.4401 57 14.4401L56.0752 16.8781C56.0752 16.8781 54.1441 16.631 52.995 18.9297C51.8459 21.2283 53.7336 43.9882 53.7336 43.9882C53.7336 43.9882 46.8271 57.6106 46.8271 63.3621C46.8271 69.1136 49.5495 73.9338 49.5495 73.9338H45.7293C45.7293 73.9338 40.1252 67.2648 38.9759 63.9318C37.8266 60.5988 38.2861 57.2658 38.2861 57.2658C38.2861 57.2658 32.1946 56.921 26.7931 57.2658C21.3915 57.6106 17.7892 62.2539 17.1391 64.8512C16.4889 67.4486 16.2196 73.9338 16.2196 73.9338H13.1991C11.3606 68.2603 9.90043 66.2269 10.6925 63.3621C12.8866 55.4269 12.4557 50.9263 11.9476 48.9217C11.4396 46.9172 8 45.1676 8 45.1676C9.68492 41.7349 11.4048 40.0854 18.8029 39.9133C26.201 39.7413 36.1599 38.9088 39.4615 36.1782Z",
            fill: "currentColor"
          }
        ),
        jsx5(
          "path",
          {
            d: "M20.25 63.03C20.25 63.03 21.0305 70.2533 25.1773 73.9342H28.7309C25.1773 69.9085 24.7897 59.415 24.7897 59.415C22.9822 60.0035 20.4799 62.1106 20.25 63.03Z",
            fill: "currentColor"
          }
        )
      ]
    }
  ),
  BiLayer,
  BiSearchAlt2,
  BiTerminal
};
var iconSchema = {
  type: "object",
  label: "Icon",
  name: "icon",
  fields: [
    {
      type: "string",
      label: "Name",
      name: "name",
      options: Object.keys(IconOptions).map((key) => ({
        label: key,
        value: key
      }))
    },
    {
      type: "string",
      label: "Color",
      name: "color",
      options: [
        { label: "Blue", value: "blue" },
        { label: "Teal", value: "teal" },
        { label: "Green", value: "green" },
        { label: "Red", value: "red" },
        { label: "Pink", value: "pink" },
        { label: "Purple", value: "purple" },
        { label: "Orange", value: "orange" },
        { label: "Yellow", value: "yellow" },
        { label: "White", value: "white" }
      ]
    },
    {
      type: "string",
      label: "Style",
      name: "style",
      options: [
        { label: "Float", value: "float" },
        { label: "Circle", value: "circle" }
      ]
    },
    {
      type: "string",
      label: "Size",
      name: "size",
      options: [
        { label: "XS", value: "xs" },
        { label: "Small", value: "small" },
        { label: "Medium", value: "medium" },
        { label: "Large", value: "large" },
        { label: "XL", value: "xl" }
      ]
    }
  ]
};

// src/components/layout/header.tsx
import { useState as useState2 } from "react";
import { Link as Link4 } from "react-router-dom";

// src/components/layout/desktop-nav.tsx
import { Link as Link2, useLocation } from "react-router-dom";
import { jsx as jsx6 } from "react/jsx-runtime";

// src/components/layout/mobile-nav-drawer.tsx
import { useEffect as useEffect2 } from "react";
import { Link as Link3, useLocation as useLocation2 } from "react-router-dom";
import { BiMenu, BiX } from "react-icons/bi";
import { Fragment, jsx as jsx7, jsxs as jsxs3 } from "react/jsx-runtime";

// src/components/layout/header.tsx
import { jsx as jsx8, jsxs as jsxs4 } from "react/jsx-runtime";

// src/components/layout/footer.tsx
import { Link as Link5 } from "react-router-dom";
import {
  BiLogoGithub,
  BiLogoTwitter,
  BiLogoFacebook,
  BiLogoInstagram
} from "react-icons/bi";
import { jsx as jsx9, jsxs as jsxs5 } from "react/jsx-runtime";

// src/components/blocks/hero.tsx
import { TinaMarkdown as TinaMarkdown2 } from "tinacms/dist/rich-text";
import { tinaField as tinaField3 } from "tinacms/dist/react";

// src/components/markdown-components.tsx
import React4, { Suspense } from "react";
import {
  TinaMarkdown
} from "tinacms/dist/rich-text";
import { jsx as jsx10, jsxs as jsxs6 } from "react/jsx-runtime";
var Prism = React4.lazy(
  () => import("tinacms/dist/rich-text/prism").then((m) => ({
    default: m.Prism ?? m.default
  }))
);

// tina/schemas/shared-fields.ts
var makeSlugify = (prefix) => (values) => `${(values?.title || `${prefix}-${Date.now()}`).toLowerCase().split(" ").join("-")}`;
var tagsFieldSchema = {
  type: "object",
  label: "Tags",
  name: "tags",
  list: true,
  fields: [
    {
      type: "reference",
      label: "Tag",
      name: "tag",
      collections: ["tag"]
    }
  ]
};
var dateFieldSchemas = [
  {
    type: "datetime",
    label: "Publish Date",
    name: "pubDate"
  },
  {
    type: "datetime",
    label: "Updated Date",
    name: "updatedDate"
  }
];
var actionsFieldSchema = {
  label: "Actions",
  name: "actions",
  type: "object",
  list: true,
  ui: {
    defaultItem: {
      label: "Action Label",
      type: "button",
      icon: true,
      link: "/"
    },
    itemProps: (item) => ({ label: item.label })
  },
  fields: [
    {
      label: "Label",
      name: "label",
      type: "string"
    },
    {
      label: "Type",
      name: "type",
      type: "string",
      options: [
        { label: "Button", value: "button" },
        { label: "Link", value: "link" }
      ]
    },
    {
      label: "Link",
      name: "link",
      type: "string"
    },
    {
      label: "Icon",
      name: "icon",
      type: "boolean"
    }
  ]
};
var colorFieldSchema = {
  type: "string",
  label: "Color",
  name: "color",
  options: [
    { label: "Default", value: "default" },
    { label: "Tint", value: "tint" },
    { label: "Primary", value: "primary" }
  ]
};

// src/components/blocks/hero.tsx
import { jsx as jsx11, jsxs as jsxs7 } from "react/jsx-runtime";
var heroBlockSchema = {
  name: "hero",
  label: "Hero",
  ui: {
    previewSrc: "/blocks/hero.png",
    defaultItem: {
      tagline: "Here's some text above the other text",
      headline: "This Big Text is Totally Awesome",
      text: "Phasellus scelerisque, libero eu finibus rutrum, risus risus accumsan libero, nec molestie urna dui a leo."
    }
  },
  fields: [
    {
      type: "string",
      label: "Tagline",
      name: "tagline"
    },
    {
      type: "string",
      label: "Headline",
      name: "headline"
    },
    {
      label: "Text",
      name: "text",
      type: "rich-text"
    },
    {
      type: "object",
      label: "Image",
      name: "image",
      fields: [
        {
          type: "string",
          label: "Source",
          name: "src",
          ui: {
            component: "image"
          }
        },
        {
          type: "string",
          label: "Alt Text",
          name: "alt"
        }
      ]
    },
    actionsFieldSchema,
    colorFieldSchema
  ]
};

// src/components/blocks/features.tsx
import { tinaField as tinaField4 } from "tinacms/dist/react";

// src/components/ui/card.tsx
import { jsx as jsx12 } from "react/jsx-runtime";

// src/components/blocks/features.tsx
import { jsx as jsx13, jsxs as jsxs8 } from "react/jsx-runtime";
var featureBlockSchema = {
  name: "features",
  label: "Features",
  ui: {
    previewSrc: "/blocks/features.png",
    defaultItem: {
      title: "Features",
      items: []
    }
  },
  fields: [
    {
      type: "string",
      label: "Title",
      name: "title"
    },
    {
      type: "string",
      ui: {
        component: "textarea"
      },
      label: "Description",
      name: "description"
    },
    {
      type: "object",
      label: "Feature Items",
      name: "items",
      list: true,
      ui: {
        itemProps: (item) => {
          return {
            label: typeof item === "string" ? item : item?.title
          };
        },
        defaultItem: "New Feature"
      },
      fields: [
        iconSchema,
        {
          type: "string",
          label: "Title",
          name: "title"
        },
        {
          type: "string",
          label: "Text",
          name: "text",
          ui: {
            component: "textarea"
          }
        },
        actionsFieldSchema
      ]
    },
    colorFieldSchema
  ]
};

// src/components/blocks/cta.tsx
import { tinaField as tinaField5 } from "tinacms/dist/react";
import { jsx as jsx14, jsxs as jsxs9 } from "react/jsx-runtime";
var ctaBlockSchema = {
  name: "cta",
  label: "CTA",
  ui: {
    previewSrc: "/blocks/cta.png"
  },
  fields: [
    {
      type: "string",
      label: "Title",
      name: "title"
    },
    {
      type: "string",
      ui: {
        component: "textarea"
      },
      label: "Description",
      name: "description"
    },
    actionsFieldSchema,
    colorFieldSchema
  ]
};

// src/components/blocks/testimonial.tsx
import { tinaField as tinaField6 } from "tinacms/dist/react";
import { jsx as jsx15, jsxs as jsxs10 } from "react/jsx-runtime";
var testimonialBlockSchema = {
  name: "testimonial",
  label: "Testimonial",
  ui: {
    previewSrc: "/blocks/testimonial.png",
    defaultItem: {
      quote: "There are only two hard things in Computer Science: cache invalidation and naming things.",
      author: "Phil Karlton",
      color: "primary"
    }
  },
  fields: [
    {
      type: "string",
      ui: {
        component: "textarea"
      },
      label: "Quote",
      name: "quote"
    },
    {
      type: "string",
      label: "Author",
      name: "author"
    },
    colorFieldSchema
  ]
};

// src/components/blocks/content.tsx
import { TinaMarkdown as TinaMarkdown3 } from "tinacms/dist/rich-text";
import { tinaField as tinaField7 } from "tinacms/dist/react";
import { jsx as jsx16 } from "react/jsx-runtime";
var contentBlockSchema = {
  name: "content",
  label: "Content",
  ui: {
    defaultItem: {
      body: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pede."
    }
  },
  fields: [
    {
      type: "rich-text",
      label: "Body",
      name: "body"
    },
    colorFieldSchema
  ]
};

// tina/collections/page.tsx
var Page = {
  label: "Pages",
  name: "page",
  path: "content/pages",
  format: "mdx",
  ui: {
    router: ({
      document: document2
    }) => {
      const filepath = document2._sys.breadcrumbs.join("/");
      if (filepath === "home") {
        return "/";
      }
      return `/${filepath}`;
    }
  },
  fields: [
    {
      type: "object",
      list: true,
      name: "blocks",
      label: "Sections",
      ui: {
        visualSelector: true
      },
      templates: [
        heroBlockSchema,
        featureBlockSchema,
        ctaBlockSchema,
        testimonialBlockSchema,
        contentBlockSchema
      ]
    }
  ]
};
var page_default = Page;

// tina/collections/post.tsx
var Post = {
  label: "Posts",
  name: "post",
  path: "content/posts",
  format: "mdx",
  ui: {
    router: ({
      document: document2
    }) => {
      return `/posts/${document2._sys.breadcrumbs.join("/")}`;
    },
    filename: {
      slugify: makeSlugify("post"),
      readonly: true
    }
  },
  fields: [
    {
      type: "string",
      label: "Title",
      name: "title",
      isTitle: true,
      required: true,
      ui: {
        validate: (value) => {
          if (!value || value.trim().length < 5) {
            return "Title must be at least 5 characters";
          }
        }
      }
    },
    {
      type: "image",
      name: "heroImg",
      label: "Hero Image",
      // @ts-ignore
      uploadDir: () => "posts"
    },
    {
      type: "rich-text",
      label: "Excerpt",
      name: "excerpt",
      overrides: {
        toolbar: ["bold", "italic", "link"]
      }
    },
    {
      type: "reference",
      label: "Author",
      name: "author",
      collections: ["author"]
    },
    {
      type: "datetime",
      label: "Posted Date",
      name: "date",
      ui: {
        dateFormat: "MMMM DD YYYY",
        timeFormat: "hh:mm A",
        validate: (value) => {
          if (value && new Date(value) > /* @__PURE__ */ new Date()) {
            return "Posted date cannot be in the future";
          }
        }
      }
    },
    {
      ...tagsFieldSchema,
      ui: {
        itemProps: (item) => {
          return { label: item?.tag };
        }
      }
    },
    {
      type: "rich-text",
      label: "Body",
      name: "_body",
      templates: [
        {
          name: "BlockQuote",
          label: "Block Quote",
          fields: [
            {
              name: "children",
              label: "Quote",
              type: "rich-text",
              overrides: {
                toolbar: ["bold", "italic", "link"]
              }
            },
            {
              name: "authorName",
              label: "Author",
              type: "string"
            }
          ]
        },
        {
          name: "DateTime",
          label: "Date & Time",
          inline: true,
          fields: [
            {
              name: "format",
              label: "Format",
              type: "string",
              options: ["utc", "iso", "local"]
            }
          ]
        },
        {
          name: "NewsletterSignup",
          label: "Newsletter Sign Up",
          fields: [
            {
              name: "children",
              label: "CTA",
              type: "rich-text"
            },
            {
              name: "placeholder",
              label: "Placeholder",
              type: "string"
            },
            {
              name: "buttonText",
              label: "Button Text",
              type: "string"
            },
            {
              name: "disclaimer",
              label: "Disclaimer",
              type: "rich-text",
              overrides: {
                toolbar: ["bold", "italic", "link"]
              }
            }
          ],
          ui: {
            defaultItem: {
              placeholder: "Enter your email",
              buttonText: "Notify Me"
            }
          }
        }
      ],
      isBody: true
    }
  ]
};
var post_default = Post;

// tina/collections/author.tsx
var Author = {
  label: "Authors",
  name: "author",
  path: "content/authors",
  format: "md",
  ui: {
    router: ({
      document: document2
    }) => `/authors/${document2._sys.filename}`
  },
  fields: [
    {
      type: "string",
      label: "Name",
      name: "name",
      isTitle: true,
      required: true
    },
    {
      type: "image",
      label: "Avatar",
      name: "avatar",
      // @ts-ignore -- uploadDir is a valid TinaCMS image field option but not yet in the type definitions
      uploadDir: () => "authors"
    },
    {
      type: "string",
      label: "Description",
      name: "description"
    },
    ...dateFieldSchemas,
    {
      type: "string",
      label: "Hobbies",
      name: "hobbies",
      list: true
    }
  ]
};
var author_default = Author;

// tina/collections/tag.ts
var Tag = {
  label: "Tags",
  name: "tag",
  path: "content/tags",
  format: "json",
  fields: [
    {
      type: "string",
      label: "Name",
      name: "name",
      isTitle: true,
      required: true
    }
  ]
};
var tag_default = Tag;

// tina/fields/color.tsx
import { wrapFieldsWithMeta } from "tinacms";
import { Fragment as Fragment2, jsx as jsx17, jsxs as jsxs11 } from "react/jsx-runtime";
var colorOptions = [
  "blue",
  "teal",
  "green",
  "yellow",
  "orange",
  "red",
  "pink",
  "purple",
  "white"
];
var ColorPickerInput = wrapFieldsWithMeta(({ input }) => {
  const inputClasses = {
    blue: "bg-blue-500 border-blue-600",
    teal: "bg-teal-500 border-teal-600",
    green: "bg-green-500 border-green-600",
    yellow: "bg-yellow-500 border-yellow-600",
    orange: "bg-orange-500 border-orange-600",
    red: "bg-red-500 border-red-600",
    pink: "bg-pink-500 border-pink-600",
    purple: "bg-purple-500 border-purple-600",
    white: "bg-white border-gray-150"
  };
  return jsxs11(Fragment2, { children: [
    jsx17("input", { type: "text", id: input.name, className: "hidden", ...input }),
    jsx17("div", { className: "flex gap-2 flex-wrap", children: colorOptions.map((color) => {
      return jsx17(
        "button",
        {
          type: "button",
          "aria-label": `Select ${color} color`,
          "aria-pressed": input.value === color,
          className: cn("w-9 h-9 rounded-full shadow border", inputClasses[color], input.value === color && "ring-[3px] ring-offset-2 ring-blue-400"),
          onClick: () => {
            input.onChange(color);
          }
        },
        color
      );
    }) })
  ] });
});

// tina/collections/global.ts
var Global = {
  label: "Global",
  name: "global",
  path: "content/global",
  format: "json",
  ui: {
    global: true
  },
  fields: [
    {
      type: "object",
      label: "Header",
      name: "header",
      fields: [
        {
          type: "string",
          label: "Name",
          name: "name"
        },
        {
          type: "string",
          label: "Color",
          name: "color",
          options: [
            { label: "Default", value: "default" },
            { label: "Primary", value: "primary" }
          ]
        },
        {
          type: "object",
          label: "Nav Links",
          name: "nav",
          list: true,
          ui: {
            itemProps: (item) => {
              return { label: item?.label };
            },
            defaultItem: {
              href: "home",
              label: "Home"
            }
          },
          fields: [
            {
              type: "string",
              label: "Link",
              name: "href"
            },
            {
              type: "string",
              label: "Label",
              name: "label"
            }
          ]
        }
      ]
    },
    {
      type: "object",
      label: "Footer",
      name: "footer",
      fields: [
        {
          type: "object",
          label: "Social Links",
          name: "social",
          list: true,
          ui: {
            itemProps: (item) => {
              return { label: item?.url || "Social Link" };
            }
          },
          fields: [
            {
              type: "string",
              label: "Icon",
              name: "icon"
            },
            {
              type: "string",
              label: "Url",
              name: "url"
            }
          ]
        }
      ]
    },
    {
      type: "object",
      label: "Theme",
      name: "theme",
      // @ts-ignore
      fields: [
        {
          type: "string",
          label: "Primary Color",
          name: "color",
          ui: {
            component: ColorPickerInput
          }
        },
        {
          type: "string",
          name: "font",
          label: "Font Family",
          options: [
            { label: "System Sans", value: "sans" },
            { label: "Nunito", value: "nunito" },
            { label: "Lato", value: "lato" }
          ]
        },
        {
          type: "string",
          name: "darkMode",
          label: "Dark Mode",
          options: [
            { label: "System", value: "system" },
            { label: "Light", value: "light" },
            { label: "Dark", value: "dark" }
          ]
        }
      ]
    }
  ]
};
var global_default = Global;

// tina/collections/blog.tsx
var Blog = {
  label: "Blogs",
  name: "blog",
  path: "content/blogs",
  format: "mdx",
  ui: {
    router: ({
      document: document2
    }) => `/blog/${document2._sys.filename}`,
    filename: {
      slugify: makeSlugify("blog"),
      readonly: true
    }
  },
  fields: [
    {
      type: "string",
      label: "Title",
      name: "title",
      isTitle: true,
      required: true
    },
    {
      type: "image",
      name: "heroImage",
      label: "Hero Image",
      // @ts-ignore
      uploadDir: () => "blogs"
    },
    {
      type: "rich-text",
      label: "Excerpt",
      name: "excerpt",
      overrides: {
        toolbar: ["bold", "italic", "link"]
      }
    },
    {
      type: "string",
      label: "Description",
      name: "description"
    },
    {
      type: "reference",
      label: "Author",
      name: "author",
      collections: ["author"]
    },
    ...dateFieldSchemas,
    {
      type: "rich-text",
      label: "Body",
      name: "_body",
      isBody: true
    }
  ]
};
var blog_default = Blog;

// tina/config.tsx
var branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main";
var config_default = defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public"
    }
  },
  schema: {
    collections: [page_default, post_default, author_default, tag_default, global_default, blog_default]
  }
});
export {
  config_default as default
};
