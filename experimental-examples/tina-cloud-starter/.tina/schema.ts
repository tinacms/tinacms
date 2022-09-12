import { defineSchema } from "tinacms";
import type { TinaTemplate } from "tinacms";
import { contentBlockSchema } from "../components/blocks/content";
import { featureBlockShema } from "../components/blocks/features";
import { heroBlockSchema } from "../components/blocks/hero";
import { testimonialBlockSchema } from "../components/blocks/testimonial";
import { iconSchema } from "../components/icon";

const tem = {
  name: "test",
  label: "test",
  fields: [{ type: "string", name: "yo" }],
};
// const CreateInnerTemplate = () => {
const InnerTemplate: TinaTemplate = {
  label: "List Items",
  name: "items",
  ui: {
    defaultItem: {
      title: "Here's Another Feature",
    },
  },
  fields: [
    {
      label: "Page Blocks",
      name: "nestedBlockc",
      type: "object",
      list: true,
      ui: {
        visualSelector: true,
      },
      fields: [
        {
          label: "title",
          name: "title",
          type: "string",
        },
      ],
    },
  ],
};
// return InnerTemplate;
// };

const BlocksTemplate: TinaTemplate = {
  label: "Page Blocks",
  name: "nestedBlocks",
  fields: [
    {
      label: "Page Blocks",
      name: "nestedBlock1",
      type: "object",
      list: true,
      templates: [InnerTemplate],
    },
    {
      label: "Page Blocks2",
      name: "nestedBlock2",
      type: "object",
      list: true,
      templates: [InnerTemplate],
    },
  ],
};

const schema = defineSchema({
  // FIXME: right now this needs to be defined here
  // and in config.ts when using static build mode.
  // This is because for the backend we're transforming things
  // like `config.media` to be present on `schema`, but not before
  // passing it into TinaCMS.
  config: {
    // build: {
    //   outputFolder: "tina",
    //   publicFolder: "public",
    // },
    branch: "main",
    clientId: "foobar",
    token: "foo",
    media: {
      tina: {
        publicFolder: "public",
        mediaRoot: "",
      },
    },
  },
  collections: [
    {
      label: "Blog Posts",
      name: "posts",
      path: "content/posts",
      format: "mdx",
      ui: {
        router: ({ document, collection }) => {
          return `/${collection.name}/${document._sys.filename}`;
        },
      },
      fields: [
        {
          label: "3 layer nesting",
          name: "pageBlocks3",
          type: "object",
          description:
            "This also works. It's a blockList > groupList > groupList",
          list: true,
          templates: [BlocksTemplate],
        },
        {
          type: "string",
          label: "Title",
          name: "title",
          required: true,
          isTitle: true,
        },
        {
          type: "image",
          name: "heroImg",
          label: "Hero Image",
        },
        {
          type: "rich-text",
          label: "Excerpt",
          name: "excerpt",
        },
        {
          type: "reference",
          label: "Author",
          name: "author",
          collections: ["authors"],
        },
        {
          type: "datetime",
          label: "Posted Date",
          name: "date",
          ui: {
            dateFormat: "MMMM DD YYYY",
            timeFormat: "hh:mm A",
          },
        },
        {
          type: "rich-text",
          label: "Body",
          name: "_body",
          templates: [
            {
              name: "DateTime",
              label: "Date & Time",
              inline: true,
              fields: [
                {
                  name: "format",
                  label: "Format",
                  type: "string",
                  options: ["utc", "iso", "local"],
                },
              ],
            },
            {
              name: "BlockQuote",
              label: "Block Quote",
              fields: [
                {
                  name: "children",
                  label: "Quote",
                  type: "rich-text",
                },
                {
                  name: "authorName",
                  label: "Author",
                  type: "string",
                },
              ],
            },
            {
              name: "NewsletterSignup",
              label: "Newsletter Sign Up",
              fields: [
                {
                  name: "children",
                  label: "CTA",
                  type: "rich-text",
                },
                {
                  name: "placeholder",
                  label: "Placeholder",
                  type: "string",
                },
                {
                  name: "buttonText",
                  label: "Button Text",
                  type: "string",
                },
                {
                  name: "disclaimer",
                  label: "Disclaimer",
                  type: "rich-text",
                },
              ],
              ui: {
                defaultItem: {
                  placeholder: "Enter your email",
                  buttonText: "Notify Me",
                },
              },
            },
            {
              name: "Shortcode1",
              label: "Shortcode 1",
              inline: true,
              match: {
                start: "{{<",
                end: ">}}",
              },
              fields: [
                {
                  name: "text",
                  label: "Text",
                  type: "string",
                  required: true,
                  isTitle: true,
                  ui: {
                    component: "textarea",
                  },
                },
              ],
            },
            {
              name: "Shortcode2",
              label: "Shortcode 2",
              inline: true,
              match: {
                start: "{{%",
                end: "%}}",
              },
              fields: [
                {
                  name: "text",
                  required: true,
                  isTitle: true,
                  label: "Text",
                  type: "string",
                  ui: {
                    component: "textarea",
                  },
                },
              ],
            },
          ],
          isBody: true,
        },
      ],
    },
    {
      label: "Global",
      name: "global",
      path: "content/global",
      ui: {
        global: true,
      },
      format: "json",
      fields: [
        {
          type: "object",
          label: "Header",
          name: "header",
          fields: [
            iconSchema,
            {
              type: "string",
              label: "Color",
              name: "color",
              options: [
                { label: "Default", value: "default" },
                { label: "Primary", value: "primary" },
              ],
            },
            {
              type: "object",
              label: "Nav Links",
              name: "nav",
              list: true,
              ui: {
                defaultItem: {
                  href: "home",
                  label: "Home",
                },
              },
              fields: [
                {
                  type: "string",
                  label: "Link",
                  name: "href",
                },
                {
                  type: "string",
                  label: "Label",
                  name: "label",
                },
              ],
            },
          ],
        },
        {
          type: "object",
          label: "Footer",
          name: "footer",
          fields: [
            {
              type: "string",
              label: "Color",
              name: "color",
              options: [
                { label: "Default", value: "default" },
                { label: "Primary", value: "primary" },
              ],
            },
            {
              type: "object",
              label: "Social Links",
              name: "social",
              fields: [
                {
                  type: "string",
                  label: "Facebook",
                  name: "facebook",
                },
                {
                  type: "string",
                  label: "Twitter",
                  name: "twitter",
                },
                {
                  type: "string",
                  label: "Instagram",
                  name: "instagram",
                },
                {
                  type: "string",
                  label: "Github",
                  name: "github",
                },
              ],
            },
          ],
        },
        {
          type: "object",
          label: "Theme",
          name: "theme",
          fields: [
            {
              type: "string",
              label: "Primary Color",
              name: "color",
              options: [
                {
                  label: "Blue",
                  value: "blue",
                },
                {
                  label: "Teal",
                  value: "teal",
                },
                {
                  label: "Green",
                  value: "green",
                },
                {
                  label: "Red",
                  value: "red",
                },
                {
                  label: "Pink",
                  value: "pink",
                },
                {
                  label: "Purple",
                  value: "purple",
                },
                {
                  label: "Orange",
                  value: "orange",
                },
                {
                  label: "Yellow",
                  value: "yellow",
                },
              ],
            },
            {
              type: "string",
              name: "font",
              label: "Font Family",
              options: [
                {
                  label: "System Sans",
                  value: "sans",
                },
                {
                  label: "Nunito",
                  value: "nunito",
                },
                {
                  label: "Lato",
                  value: "lato",
                },
              ],
            },
            {
              type: "string",
              name: "icon",
              label: "Icon Set",
              options: [
                {
                  label: "Boxicons",
                  value: "boxicon",
                },
                {
                  label: "Heroicons",
                  value: "heroicon",
                },
              ],
            },
            {
              type: "string",
              name: "darkMode",
              label: "Dark Mode",
              options: [
                {
                  label: "System",
                  value: "system",
                },
                {
                  label: "Light",
                  value: "light",
                },
                {
                  label: "Dark",
                  value: "dark",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      label: "Authors",
      name: "authors",
      path: "content/authors",
      format: "md",
      fields: [
        {
          type: "string",
          label: "Name",
          name: "name",
          required: true,
          isTitle: true,
        },
        {
          type: "string",
          label: "Avatar",
          name: "avatar",
        },
      ],
    },
    {
      label: "Pages",
      name: "pages",
      path: "content/pages",
      ui: {
        router: ({ document }) => {
          if (document._sys.filename === "home") {
            return "/";
          }
          if (document._sys.filename === "about") {
            return `/about`;
          }
          return undefined;
        },
      },
      fields: [
        {
          type: "object",
          list: true,
          name: "blocks",
          label: "Sections",
          ui: {
            visualSelector: true,
          },
          templates: [
            heroBlockSchema,
            featureBlockShema,
            contentBlockSchema,
            testimonialBlockSchema,
          ],
        },
      ],
    },
  ],
});

export default schema;
