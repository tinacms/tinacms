import React from "react";
import {
  TinaAdmin,
  TinaCMSProvider2,
  defineSchema,
} from "../../../../../../../tinacms/dist/index.es";
import { TinaEditProvider, setEditing } from "tinacms/dist/edit-state";
const schema = defineSchema({
  collections: [
    {
      label: "Link page",
      name: "linkPage",
      path: "content/linkPage",
      format: "json",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Title",
        },
        {
          type: "object",
          list: true,
          name: "links",
          label: "Links",
          description: "A list of links",
          ui: {
            itemProps: (val) => {
              return { label: val?.label || "A new link" };
            },
          },
          fields: [
            {
              label: "Label",
              description: "The Label that is shown for the user to click",
              name: "label",
              required: true,
              type: "string",
            },
            {
              label: "Link URL",
              description: "The URL that will be open when clicked",
              name: "url",
              required: true,
              type: "string",
            },
            {
              label: "Link description",
              description: "The description of the link",
              name: "description",
              type: "string",
            },
            {
              label: "Image URL",
              description: "The url of the imasge that will be shown",
              name: "imageURL",
              type: "string",
            },
          ],
        },
      ],
    },
    {
      label: "Disc",
      name: "disc",
      path: "content/discs",
      format: "json",
      fields: [
        {
          type: "string",
          label: "Name",
          name: "name",
          required: true,
        },
        {
          type: "object",
          name: "numbers",
          fields: [
            {
              name: "speed",
              type: "number",
              required: true,
            },
            {
              name: "glide",
              type: "number",
              required: true,
            },
            {
              name: "turn",
              type: "number",
              required: true,
            },
            {
              name: "fade",
              type: "number",
              required: true,
            },
          ],
        },
        {
          name: "condition",
          type: "string",
          required: true,
        },
        {
          name: "conditionNumber",
          type: "number",
          required: true,
        },

        {
          name: "imgSrc",
          type: "string",
          required: true,
          ui: {
            component: "image",
          },
        },
        {
          name: "description",
          type: "string",
        },
        {
          name: "bag",
          type: "string",
          required: true,
          options: ["foo"],
        },
      ],
    },
  ],
});
console.log({ schema });

function App() {
  setEditing(true);

  return (
    <TinaEditProvider
      editMode={
        <TinaCMSProvider2
          apiURL="https://content.tinajs.io/content/05477644-3e42-44dd-87ea-ab81992db347/github/main"
          schema={schema}
        >
          <TinaAdmin />
        </TinaCMSProvider2>
      }
    >
      <div>Need to be in edit mode!</div>
    </TinaEditProvider>
  );
}

export default App;
