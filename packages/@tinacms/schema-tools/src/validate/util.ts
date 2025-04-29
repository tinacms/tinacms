export const duplicateFieldErrorMessage = (fields: string): string =>
  `Fields must have unique names. Found duplicate field names: [${fields}]`;
export const duplicateTemplateErrorMessage = (templates: string): string =>
  `Templates must have unique names. Found duplicate template names: [${templates}]`;
export const duplicateCollectionErrorMessage = (collection: string): string =>
  `Collections must have unique names. Found duplicate collection names: [${collection}]`;
