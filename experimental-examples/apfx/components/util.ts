import { InputType, GraphQLTypes, ValueTypes } from "../zeus";

export type Response<
  T extends keyof GraphQLTypes,
  O extends object
> = InputType<GraphQLTypes[T], O>;
