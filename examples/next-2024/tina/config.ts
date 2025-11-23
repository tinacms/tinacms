import { defineConfig } from "tinacms";
import PathwaySchema, { contentBlock } from "./collection/bugReproduction";

// Your hosting provider likely exposes this as an environment variable
const branch =
	process.env.GITHUB_BRANCH ||
	process.env.VERCEL_GIT_COMMIT_REF ||
	process.env.HEAD ||
	"main";

export default defineConfig({
	branch,

	// Get this from tina.io
	clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
	// Get this from tina.io
	token: process.env.TINA_TOKEN,

	build: {
		outputFolder: "admin",
		publicFolder: "public",
	},
	media: {
		tina: {
			mediaRoot: "",
			publicFolder: "public",
		},
	},
	// See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
	schema: {
		collections: [
			{
				name: "slateJson",
				path: "content/slate-json",
				format: "json",
				fields: [
					{
						name: "title",
						type: "string",
						label: "Title",
					},
					{
						type: "rich-text",
						name: "body",
						label: "Body",
						parser: { type: "slatejson" },
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
						],
					},
				],
			},
			{
				name: "simpleRef",
				path: "content/refs",
				fields: [
					{
						name: "title",
						type: "string",
					},
				],
			},
			{
				name: "post",
				label: "Posts",
				format: "mdx",
				path: "content/posts",
				ui: {
					router({ document }) {
						return `/posts/${document._sys.filename}`;
					},
				},
				fields: [
					{
						type: "string",
						name: "title",
						label: "Title",
						isTitle: true,
						required: true,
					},
					{
						type: "rich-text",
						name: "body",
						label: "Body",
						isBody: true,
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
						],
					},
					{
						name: "items",
						type: "object",
						ui: {
							itemProps: (values) => ({
								label: values?.title || "Showcase Item",
							}),
						},
						list: true,
						fields: [
							{
								name: "title",
								type: "string",
								required: true,
								isTitle: true,
							},
							{
								name: "description",
								type: "rich-text",
							},
							{
								name: "image",
								type: "image",
							},

							{
								name: "ref",
								type: "reference",
								collections: ["simpleRef"],
							},
						],
					},
					{
						type: "rich-text",
						label: "Test Templates",
						name: "template",
						isBody: true,
						toolbarOverride: [
							"heading",
							"bold",
							"italic",
							"image",
							"link",
							"embed",
						],
						overrides: {
							toolbar: ["heading", "bold", "italic", "image", "link", "embed"],
							showFloatingToolbar: false,
						},
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
								name: "ref",
								fields: [
									{
										name: "ref",
										type: "reference",
										collections: ["simpleRef"],
									},
								],
							},
						],
					},
				],
			},
		],
	},
});
