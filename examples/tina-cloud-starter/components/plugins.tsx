import { FieldPlugin } from "tinacms";

export const MyPlugin: FieldPlugin = {
  __type: "field",
  Component: "text",
  name: "test",
  validate: (val: string) =>
    val?.startsWith("test") ? "" : "The input MUST start with test",
  defaultValue: "this is not a valid",
};
