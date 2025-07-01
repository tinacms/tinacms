// @ts-expect-error
import schemaJson from 'SCHEMA_IMPORT';
import { getIn } from 'final-form';
import * as G from 'graphql';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Client,
  Collection,
  ErrorDialog,
  Form,
  GlobalFormPlugin,
  NAMER,
  Template,
  TinaCMS,
  TinaField,
  TinaSchema,
  TinaState,
  resolveField,
  useCMS,
} from 'tinacms';
import { z } from 'zod';
import { FormifyCallback, createForm, createGlobalForm } from './build-form';
import { showErrorModal } from './errors';
import { expandQuery, isConnectionType, isNodeType } from './expand-query';
import type {
  Payload,
  PostMessage,
  ResolvedDocument,
  SystemInfo,
} from './types';
import { getFormAndFieldNameFromMetadata } from './util';

const sysSchema = z.object({
  breadcrumbs: z.array(z.string()),
  basename: z.string(),
  filename: z.string(),
  path: z.string(),
  extension: z.string(),
  relativePath: z.string(),
  title: z.string().optional().nullable(),
  template: z.string(),
  hasReferences: z.boolean().optional().nullable(),
  collection: z.object({
    name: z.string(),
    slug: z.string(),
    label: z.string().optional().nullable(),
    path: z.string(),
    format: z.string().optional().nullable(),
    matches: z.string().optional().nullable(),
  }),
});

//@ts-ignore TODO: sysSchema label optional type issue
const documentSchema: z.ZodType<ResolvedDocument> = z.object({
  _internalValues: z.record(z.unknown()),
  _internalSys: sysSchema,
});

const astNode = schemaJson as G.DocumentNode;
const astNodeWithMeta: G.DocumentNode = {
  ...astNode,
  definitions: astNode.definitions.map((def) => {
    if (def.kind === 'InterfaceTypeDefinition') {
      return {
        ...def,
        fields: [
          ...(def.fields || []),
          {
            kind: 'FieldDefinition',
            name: {
              kind: 'Name',
              value: '_tina_metadata',
            },
            arguments: [],
            type: {
              kind: 'NonNullType',
              type: {
                kind: 'NamedType',
                name: {
                  kind: 'Name',
                  value: 'JSON',
                },
              },
            },
          },
          {
            kind: 'FieldDefinition',
            name: {
              kind: 'Name',
              value: '_content_source',
            },
            arguments: [],
            type: {
              kind: 'NonNullType',
              type: {
                kind: 'NamedType',
                name: {
                  kind: 'Name',
                  value: 'JSON',
                },
              },
            },
          },
        ],
      };
    }
    if (def.kind === 'ObjectTypeDefinition') {
      return {
        ...def,
        fields: [
          ...(def.fields || []),
          {
            kind: 'FieldDefinition',
            name: {
              kind: 'Name',
              value: '_tina_metadata',
            },
            arguments: [],
            type: {
              kind: 'NonNullType',
              type: {
                kind: 'NamedType',
                name: {
                  kind: 'Name',
                  value: 'JSON',
                },
              },
            },
          },
          {
            kind: 'FieldDefinition',
            name: {
              kind: 'Name',
              value: '_content_source',
            },
            arguments: [],
            type: {
              kind: 'NonNullType',
              type: {
                kind: 'NamedType',
                name: {
                  kind: 'Name',
                  value: 'JSON',
                },
              },
            },
          },
        ],
      };
    }
    return def;
  }),
};
const schema = G.buildASTSchema(astNode);
const schemaForResolver = G.buildASTSchema(astNodeWithMeta);

const isRejected = (
  input: PromiseSettledResult<unknown>
): input is PromiseRejectedResult => input.status === 'rejected';

const isFulfilled = <T>(
  input: PromiseSettledResult<T>
): input is PromiseFulfilledResult<T> => input.status === 'fulfilled';

export const useGraphQLReducer = (
  iframe: React.MutableRefObject<HTMLIFrameElement>,
  url: string
) => {
  const cms = useCMS();
  const tinaSchema = cms.api.tina.schema as TinaSchema;
  const [payloads, setPayloads] = React.useState<Payload[]>([]);
  const [requestErrors, setRequestErrors] = React.useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = React.useState<
    {
      id: string;
      data:
        | {
            [key: string]: any;
          }
        | null
        | undefined;
    }[]
  >([]);
  const [documentsToResolve, setDocumentsToResolve] = React.useState<string[]>(
    []
  );
  const [resolvedDocuments, setResolvedDocuments] = React.useState<
    ResolvedDocument[]
  >([]);
  const [operationIndex, setOperationIndex] = React.useState(0);

  const activeField = searchParams.get('active-field');

  React.useEffect(() => {
    const run = async () => {
      return Promise.all(
        documentsToResolve.map(async (documentId) => {
          return await getDocument(documentId, cms.api.tina);
        })
      );
    };
    if (documentsToResolve.length) {
      run().then((docs) => {
        setResolvedDocuments((resolvedDocs) => [...resolvedDocs, ...docs]);
        setDocumentsToResolve([]);
        setOperationIndex((i) => i + 1);
      });
    }
  }, [documentsToResolve.join('.')]);

  const extractRichTextReferences = (data: any, tinaSchema: TinaSchema) => {
    const referencedDocuments: { path: string; refPath: string }[] = [];

    // Helper function to check if a string is a valid document reference
    const isValidDocumentReference = (str: string): boolean => {
      if (typeof str !== 'string') return false;

      // Must contain forward slashes (basic path check)
      if (!str.includes('/')) return false;

      try {
        // Try to get the collection for this path
        const collection = tinaSchema.getCollectionByFullPath(str);
        return !!collection;
      } catch (e) {
        // If getCollectionByFullPath throws, it's not a valid document path
        return false;
      }
    };

    const traverseData = (obj: any, path: string[] = []) => {
      if (!obj || typeof obj !== 'object') {
        return;
      }

      if (Array.isArray(obj)) {
        obj.forEach((item, index) =>
          traverseData(item, [...path, index.toString()])
        );
        return;
      }

      // Check if this is a rich text JSX node with references
      if (
        obj.type === 'mdxJsxFlowElement' ||
        obj.type === 'mdxJsxTextElement'
      ) {
        // Look for reference properties in JSX props
        if (obj.props) {
          Object.keys(obj.props).forEach((propName) => {
            const propValue = obj.props[propName];

            // Check if this prop value is a valid document reference
            if (isValidDocumentReference(propValue)) {
              const fullPath = [...path, propName].join('.');
              referencedDocuments.push({
                path: fullPath,
                refPath: propValue,
              });
            }
          });
        }

        // Also check for legacy attributes format (just in case)
        if (obj.attributes) {
          obj.attributes.forEach((attr: any) => {
            if (isValidDocumentReference(attr.value)) {
              const fullPath = [...path, attr.name].join('.');
              referencedDocuments.push({
                path: fullPath,
                refPath: attr.value,
              });
            }
          });
        }
      }

      // Check for template references in rich text content
      if (obj._template && obj.reference) {
        if (isValidDocumentReference(obj.reference)) {
          const fullPath = [...path, 'reference'].join('.');
          referencedDocuments.push({
            path: fullPath,
            refPath: obj.reference,
          });
        }
      }

      // Check any string value that might be a document reference
      if (typeof obj === 'string' && isValidDocumentReference(obj)) {
        const fullPath = path.join('.');
        referencedDocuments.push({
          path: fullPath,
          refPath: obj,
        });
      }

      // Recursively traverse all object properties
      Object.keys(obj).forEach((key) => {
        traverseData(obj[key], [...path, key]);
      });
    };

    traverseData(data);
    return referencedDocuments;
  };

  /**
   * Note: since React runs effects twice in development this will run twice for a given query
   * which results in duplicate network requests in quick succession
   */
  React.useEffect(() => {
    const run = async () => {
      setRequestErrors([]);
      // gather the errors and display an error message containing each error unique message
      return Promise.allSettled(
        payloads.map(async (payload) => {
          // This payload has already been expanded, skip it.
          if (payload.expandedQuery) {
            return payload;
          } else {
            const expandedPayload = await expandPayload(payload, cms);
            processPayload(expandedPayload);
            return expandedPayload;
          }
        })
      );
    };
    if (payloads.length) {
      run().then((updatedPayloads) => {
        setPayloads(updatedPayloads.filter(isFulfilled).map((p) => p.value));
        setRequestErrors(
          updatedPayloads.filter(isRejected).map((p) => String(p.reason))
        );
      });
    }
  }, [JSON.stringify(payloads), cms]);

  const processPayload = React.useCallback(
    (payload: Payload) => {
      const { expandedQueryForResolver, variables, expandedData } = payload;
      if (!expandedQueryForResolver || !expandedData) {
        throw new Error(
          `Unable to process payload which has not been expanded`
        );
      }

      // Extract rich text references first to determine if we need to process
      const richTextRefs = extractRichTextReferences(
        payload.expandedData,
        tinaSchema
      );

      // Check if this payload has already been fully processed
      const existingFormList = cms.state.formLists.find(
        (fl) => fl.id === payload.id
      );

      // More specific check: if we have an existing form list and all rich text refs are already processed
      if (existingFormList) {
        const allRichTextRefsProcessed = richTextRefs.every(({ refPath }) =>
          existingFormList.formIds.includes(refPath)
        );

        if (allRichTextRefsProcessed && existingFormList.formIds.length > 1) {
          return;
        }
      }

      // Extract common form creation logic
      const createOrGetForm = (
        resolvedDocument: ResolvedDocument,
        tinaSchema: TinaSchema,
        payloadId: string,
        cms: TinaCMS,
        pathString: string
      ) => {
        const id = resolvedDocument._internalSys.path;
        const existingForm = cms.state.forms.find((f) => f.tinaForm.id === id);

        if (!existingForm) {
          const { form, template } = buildForm({
            resolvedDocument,
            tinaSchema,
            payloadId,
            cms,
          });
          form.subscribe(
            () => {
              setOperationIndex((i) => i + 1);
            },
            { values: true }
          );
          return {
            form,
            template,
            isNew: true,
          };
        } else {
          existingForm.tinaForm.addQuery(payloadId);
          const { template } = getTemplateForDocument(
            resolvedDocument,
            tinaSchema
          );
          return {
            form: existingForm.tinaForm,
            template,
            isNew: false,
          };
        }
      };

      // Extract form list item creation logic
      const addDocumentToFormList = (
        formListItems: TinaState['formLists'][number]['items'],
        pathString: string,
        formId: string
      ) => {
        // Check if this exact path already exists (not just the formId)
        const alreadyExists = formListItems.some((item) => {
          if (item.type === 'document' && item.path === pathString) {
            return true;
          }
          if (item.type === 'document' && item.subItems) {
            return item.subItems.some(
              (subItem) =>
                subItem.type === 'document' && subItem.path === pathString
            );
          }
          return false;
        });

        if (alreadyExists) {
          return;
        }

        const ancestors = formListItems.filter((item) => {
          if (item.type === 'document') {
            return pathString.startsWith(item.path);
          }
        });
        const parent = ancestors[ancestors.length - 1];

        if (parent && parent.type === 'document') {
          parent.subItems.push({
            type: 'document',
            path: pathString,
            formId,
            subItems: [],
          });
        } else {
          formListItems.push({
            type: 'document',
            path: pathString,
            formId,
            subItems: [],
          });
        }
      };

      // In the processDocument function, make sure we're not returning early:
      const processDocument = (
        resolvedDocument: ResolvedDocument,
        tinaSchema: TinaSchema,
        payloadId: string,
        cms: TinaCMS,
        pathString: string,
        formListItems: TinaState['formLists'][number]['items'],
        formIds: string[]
      ) => {
        const id = resolvedDocument._internalSys.path;

        // DON'T return early - we still need to add to formListItems even if form exists
        if (!formIds.includes(id)) {
          formIds.push(id);
        }

        const { form, template } = createOrGetForm(
          resolvedDocument,
          tinaSchema,
          payloadId,
          cms,
          pathString
        );

        // Always add to form list (this was the missing piece!)
        addDocumentToFormList(formListItems, pathString, id);
        return resolveDocument(resolvedDocument, template, form, pathString);
      };

      // Initialize with existing form list items if they exist, otherwise start fresh
      const formListItems: TinaState['formLists'][number]['items'] =
        existingFormList ? [...existingFormList.items] : [];
      const formIds: string[] = existingFormList
        ? [...existingFormList.formIds]
        : [];

      const result = G.graphqlSync({
        schema: schemaForResolver,
        source: expandedQueryForResolver,
        variableValues: variables,
        rootValue: expandedData,
        fieldResolver: (source, args, context, info) => {
          const fieldName = info.fieldName;
          /**
           * Since the `source` for this resolver is the query that
           * ran before passing it into `useTina`, we need to take aliases
           * into consideration, so if an alias is provided we try to
           * see if that has the value we're looking for. This isn't a perfect
           * solution as the `value` gets overwritten depending on the alias
           * query.
           */
          const aliases: string[] = [];
          info.fieldNodes.forEach((fieldNode) => {
            if (fieldNode.alias) {
              aliases.push(fieldNode.alias.value);
            }
          });
          let value = source[fieldName] as unknown;
          aliases.forEach((alias) => {
            const aliasValue = source[alias];
            if (aliasValue) {
              value = aliasValue;
            }
          });

          // Handle special fields
          if (fieldName === '_sys') {
            return source._internalSys;
          }
          if (fieldName === '_values') {
            return source._internalValues;
          }
          if (info.fieldName === '_content_source') {
            const pathArray = G.responsePathAsArray(info.path);
            return {
              queryId: payload.id,
              path: pathArray.slice(0, pathArray.length - 1),
            };
          }
          if (info.fieldName === '_tina_metadata') {
            if (value) {
              return value;
            }
            return {
              id: null,
              fields: [],
              prefix: '',
            };
          }

          // Handle connection types
          if (isConnectionType(info.returnType)) {
            const name = G.getNamedType(info.returnType).name;
            const connectionCollection = tinaSchema
              .getCollections()
              .find((collection) => {
                const collectionName = NAMER.referenceConnectionType(
                  collection.namespace
                );
                return collectionName === name;
              });
            if (connectionCollection) {
              formListItems.push({
                type: 'list',
                label: connectionCollection.label || connectionCollection.name,
              });
            }
          }

          // Handle node types (regular references)
          if (isNodeType(info.returnType)) {
            if (!value) {
              return;
            }

            let resolvedDocument: ResolvedDocument;

            // Handle string references (from other forms)
            if (typeof value === 'string') {
              const valueFromSetup = getIn(
                expandedData,
                G.responsePathAsArray(info.path).join('.')
              );
              const maybeResolvedDocument = resolvedDocuments.find(
                (doc) => doc._internalSys.path === value
              );

              // If we already have this document, use it.
              if (maybeResolvedDocument) {
                resolvedDocument = maybeResolvedDocument;
              } else if (valueFromSetup) {
                // Else, even though in this context the value is a string because it's
                // resolved from a parent form, if the reference hasn't changed
                // from when we ran the setup query, we can avoid a data fetch
                // here and just grab it from the response
                const maybeResolvedDocument =
                  documentSchema.parse(valueFromSetup);
                if (maybeResolvedDocument._internalSys.path === value) {
                  resolvedDocument = maybeResolvedDocument;
                } else {
                  throw new NoFormError(`No form found`, value);
                }
              } else {
                throw new NoFormError(`No form found`, value);
              }
            } else {
              resolvedDocument = documentSchema.parse(value);
            }

            const pathArray = G.responsePathAsArray(info.path);
            const pathString = pathArray.join('.');

            return processDocument(
              resolvedDocument,
              tinaSchema,
              payload.id,
              cms,
              pathString,
              formListItems,
              formIds
            );
          }

          return value;
        },
      });

      if (result.errors) {
        result.errors.forEach((error) => {
          if (
            error instanceof G.GraphQLError &&
            error.originalError instanceof NoFormError
          ) {
            const id = error.originalError.id;
            setDocumentsToResolve((docs) => [
              ...docs.filter((doc) => doc !== id),
              id,
            ]);
          } else {
            console.log(error);
          }
        });
      } else {
        if (result.data) {
          setResults((results) => [
            ...results.filter((result) => result.id !== payload.id),
            { id: payload.id, data: result.data },
          ]);
        }
        // Process rich text references - but filter out duplicates first
        const uniqueRichTextRefs = richTextRefs.filter(
          (ref, index, self) =>
            index === self.findIndex((r) => r.refPath === ref.refPath)
        );

        uniqueRichTextRefs.forEach(({ path: refGraphQLPath, refPath }) => {
          const resolvedDoc = resolvedDocuments.find(
            (doc) => doc._internalSys.path === refPath
          );

          if (resolvedDoc && !formIds.includes(refPath)) {
            try {
              processDocument(
                resolvedDoc,
                tinaSchema,
                payload.id,
                cms,
                refGraphQLPath,
                formListItems,
                formIds
              );
            } catch (error) {
              console.error(
                '[DEBUG] Error processing rich text document:',
                refPath,
                error
              );
            }
          } else if (!resolvedDoc) {
            setDocumentsToResolve((docs) => {
              if (!docs.includes(refPath)) {
                return [...docs, refPath];
              }
              return docs;
            });
          } else {
            // Already processed this document, skip it
          }
        });
        if (activeField) {
          setSearchParams({});
          const [queryId, eventFieldName] = activeField.split('---');
          if (queryId === payload.id) {
            if (result?.data) {
              cms.dispatch({
                type: 'forms:set-active-field-name',
                value: getFormAndFieldNameFromMetadata(
                  result.data,
                  eventFieldName
                ),
              });
            }
            cms.dispatch({
              type: 'sidebar:set-display-state',
              value: 'openOrFull',
            });
          }
          iframe.current?.contentWindow?.postMessage({
            type: 'updateData',
            id: payload.id,
            data: result.data,
          });
        }

        cms.dispatch({
          type: 'form-lists:add',
          value: {
            id: payload.id,
            label: 'Anonymous Query', // TODO: grab the name of the query if it exists
            items: formListItems,
            formIds,
          },
        });
      }
    },
    [
      resolvedDocuments.map((doc) => doc._internalSys.path).join('.'),
      activeField,
    ]
  );

  const handleMessage = React.useCallback(
    (event: MessageEvent<PostMessage>) => {
      if (event.data.type === 'user-select-form') {
        cms.dispatch({
          type: 'forms:set-active-form-id',
          value: event.data.formId,
        });
      }

      if (event?.data?.type === 'quick-edit') {
        cms.dispatch({
          type: 'set-quick-editing-supported',
          value: event.data.value,
        });
        iframe.current?.contentWindow?.postMessage({
          type: 'quickEditEnabled',
          value: cms.state.sidebarDisplayState === 'open',
        });
      }
      if (event?.data?.type === 'isEditMode') {
        iframe?.current?.contentWindow?.postMessage({
          type: 'tina:editMode',
        });
      }
      if (event.data.type === 'field:selected') {
        const [queryId, eventFieldName] = event.data.fieldName.split('---');
        const result = results.find((res) => res.id === queryId);
        if (result?.data) {
          cms.dispatch({
            type: 'forms:set-active-field-name',
            value: getFormAndFieldNameFromMetadata(result.data, eventFieldName),
          });
        }
        cms.dispatch({
          type: 'sidebar:set-display-state',
          value: 'openOrFull',
        });
      }
      if (event.data.type === 'close') {
        const payloadSchema = z.object({ id: z.string() });
        const { id } = payloadSchema.parse(event.data);
        setPayloads((previous) =>
          previous.filter((payload) => payload.id !== id)
        );
        setResults((previous) => previous.filter((result) => result.id !== id));
        cms.forms.all().map((form: { removeQuery: (arg0: string) => void }) => {
          form.removeQuery(id);
        });
        cms.removeOrphanedForms();
        cms.dispatch({ type: 'form-lists:remove', value: id });
      }
      if (event.data.type === 'open') {
        const payloadSchema = z.object({
          id: z.string(),
          query: z.string(),
          variables: z.record(z.unknown()),
          data: z.record(z.unknown()),
        });
        const payload = payloadSchema.parse(event.data);
        setPayloads((payloads) => [
          ...payloads.filter(({ id }) => id !== payload.id),
          payload,
        ]);
      }
      if (event.data.type === 'url-changed') {
        cms.dispatch({
          type: 'sidebar:set-loading-state',
          value: true,
        });
      }
    },
    [cms, JSON.stringify(results)]
  );

  React.useEffect(() => {
    payloads.forEach((payload) => {
      if (payload.expandedData) {
        // Only process if we haven't already processed this payload completely
        const existingFormList = cms.state.formLists.find(
          (fl: { id: string }) => fl.id === payload.id
        );
        const richTextRefs = extractRichTextReferences(
          payload.expandedData,
          tinaSchema
        );

        const shouldProcess =
          !existingFormList ||
          (richTextRefs.length > 0 &&
            !richTextRefs.every(({ refPath }) =>
              existingFormList.formIds.includes(refPath)
            ));

        if (shouldProcess) {
          processPayload(payload);
        } else {
          // Skipping already processed payload
        }
      }
    });
  }, [operationIndex]);

  React.useEffect(() => {
    return () => {
      setPayloads([]);
      setResults([]);
      cms.removeAllForms();
      cms.dispatch({ type: 'form-lists:clear' });
    };
  }, [url]);

  React.useEffect(() => {
    iframe.current?.contentWindow?.postMessage({
      type: 'quickEditEnabled',
      value: cms.state.sidebarDisplayState === 'open',
    });
  }, [cms.state.sidebarDisplayState]);

  React.useEffect(() => {
    cms.dispatch({ type: 'set-edit-mode', value: 'visual' });
    if (iframe) {
      window.addEventListener('message', handleMessage);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
      cms.removeAllForms();
      cms.dispatch({ type: 'set-edit-mode', value: 'basic' });
    };
  }, [iframe.current, JSON.stringify(results)]);

  React.useEffect(() => {
    if (requestErrors.length) {
      showErrorModal('Unexpected error querying content', requestErrors, cms);
    }
  }, [requestErrors]);
};

const onSubmit = async (
  collection: Collection<true>,
  relativePath: string,
  payload: Record<string, unknown>,
  cms: TinaCMS
) => {
  const tinaSchema = cms.api.tina.schema;
  try {
    const mutationString = `#graphql
      mutation UpdateDocument($collection: String!, $relativePath: String!, $params: DocumentUpdateMutation!) {
        updateDocument(collection: $collection, relativePath: $relativePath, params: $params) {
          __typename
        }
      }
    `;

    await cms.api.tina.request(mutationString, {
      variables: {
        collection: collection.name,
        relativePath: relativePath,
        params: tinaSchema.transformPayload(collection.name, payload),
      },
    });
    cms.alerts.success('Document saved!');
  } catch (e) {
    cms.alerts.error(() =>
      ErrorDialog({
        title: 'There was a problem saving your document',
        message: 'Tina caught an error while updating the page',
        error: e,
      })
    );
    console.error(e);
  }
};

type Path = (string | number)[];

const resolveDocument = (
  doc: ResolvedDocument,
  template: Template<true>,
  form: Form,
  pathToDocument: string
): ResolvedDocument => {
  // @ts-ignore AnyField and TinaField don't mix
  const fields = form.fields as TinaField<true>[];
  const id = doc._internalSys.path;
  const path: Path = [];
  const formValues = resolveFormValue({
    fields: fields,
    values: form.values,
    path,
    id,
    pathToDocument,
  });
  const metadataFields: Record<string, string> = {};
  Object.keys(formValues).forEach((key) => {
    metadataFields[key] = [...path, key].join('.');
  });

  return {
    ...formValues,
    id,
    sys: doc._internalSys,
    values: form.values,
    _tina_metadata: {
      prefix: pathToDocument,
      id: doc._internalSys.path,
      name: '',
      fields: metadataFields,
    },
    _internalSys: doc._internalSys,
    _internalValues: doc._internalValues,
    __typename: NAMER.dataTypeName(template.namespace),
  };
};

const resolveFormValue = <T extends Record<string, unknown>>({
  fields,
  values,
  path,
  id,
  pathToDocument,
}: // tinaSchema,
{
  fields: TinaField<true>[];
  values: T;
  path: Path;
  id: string;
  pathToDocument: string;
  // tinaSchema: TinaSchema
}): T & { __typename?: string } => {
  const accum: Record<string, unknown> = {};
  fields.forEach((field) => {
    const v = values[field.name];
    if (typeof v === 'undefined') {
      return;
    }
    if (v === null) {
      return;
    }
    accum[field.name] = resolveFieldValue({
      field,
      value: v,
      path,
      id,
      pathToDocument,
    });
  });
  return accum as T & { __typename?: string };
};
const resolveFieldValue = ({
  field,
  value,
  path,
  id,
  pathToDocument,
}: {
  field: TinaField<true>;
  value: unknown;
  path: Path;
  id: string;
  pathToDocument: string;
}) => {
  switch (field.type) {
    case 'object': {
      if (field.templates) {
        if (field.list) {
          if (Array.isArray(value)) {
            return value.map((item, index) => {
              const template = field.templates[item._template];
              if (typeof template === 'string') {
                throw new Error('Global templates not supported');
              }
              const nextPath = [...path, field.name, index];
              const metadataFields: Record<string, string> = {};
              template.fields.forEach((field) => {
                metadataFields[field.name] = [...nextPath, field.name].join(
                  '.'
                );
              });
              return {
                __typename: NAMER.dataTypeName(template.namespace),
                _tina_metadata: {
                  id,
                  name: nextPath.join('.'),
                  fields: metadataFields,
                  prefix: pathToDocument,
                },
                ...resolveFormValue({
                  fields: template.fields,
                  values: item,
                  path: nextPath,
                  id,
                  pathToDocument,
                }),
              };
            });
          }
        } else {
          // not implemented
        }
      }

      const templateFields = field.fields;
      if (typeof templateFields === 'string') {
        throw new Error('Global templates not supported');
      }
      if (!templateFields) {
        throw new Error(`Expected to find sub-fields on field ${field.name}`);
      }
      if (field.list) {
        if (Array.isArray(value)) {
          return value.map((item, index) => {
            const nextPath = [...path, field.name, index];
            const metadataFields: Record<string, string> = {};
            templateFields.forEach((field) => {
              metadataFields[field.name] = [...nextPath, field.name].join('.');
            });
            return {
              __typename: NAMER.dataTypeName(field.namespace),
              _tina_metadata: {
                id,
                name: nextPath.join('.'),
                fields: metadataFields,
                prefix: pathToDocument,
              },
              ...resolveFormValue({
                fields: templateFields,
                values: item,
                path: nextPath,
                id,
                pathToDocument,
              }),
            };
          });
        }
      } else {
        const nextPath = [...path, field.name];
        const metadataFields: Record<string, string> = {};
        templateFields.forEach((field) => {
          metadataFields[field.name] = [...nextPath, field.name].join('.');
        });
        return {
          __typename: NAMER.dataTypeName(field.namespace),
          _tina_metadata: {
            id,
            name: nextPath.join('.'),
            fields: metadataFields,
            prefix: pathToDocument,
          },
          ...resolveFormValue({
            fields: templateFields,
            values: value as any,
            path: nextPath,
            id,
            pathToDocument,
          }),
        };
      }
    }
    default: {
      return value;
    }
  }
};

const getDocument = async (id: string, tina: Client) => {
  const response = await tina.request<{
    node: {
      _internalSys: SystemInfo;
      _internalValues: Record<string, unknown>;
    };
  }>(
    `query GetNode($id: String!) {
node(id: $id) {
...on Document {
  _internalValues: _values
_internalSys: _sys {
  breadcrumbs
  basename
  filename
  path
  extension
  relativePath
  title
  hasReferences
  template
  collection {
    name
    slug
    label
    path
    format
    matches
    templates
    fields
    __typename
  }
  __typename
}
}
}
}`,
    { variables: { id: id } }
  );
  return response.node;
};

const expandPayload = async (
  payload: Payload,
  cms: TinaCMS
): Promise<Payload> => {
  const { query, variables } = payload;
  const documentNode = G.parse(query);
  const expandedDocumentNode = expandQuery({ schema, documentNode });
  const expandedQuery = G.print(expandedDocumentNode);
  const expandedData = await cms.api.tina.request<object>(expandedQuery, {
    variables,
  });

  const expandedDocumentNodeForResolver = expandQuery({
    schema: schemaForResolver,
    documentNode,
  });
  const expandedQueryForResolver = G.print(expandedDocumentNodeForResolver);
  return { ...payload, expandedQuery, expandedData, expandedQueryForResolver };
};

/**
 * When we resolve the graphql data we check for these errors,
 * if we find one we enqueue the document to be generated, and then
 * process it once we have that document
 */
class NoFormError extends Error {
  id: string;
  constructor(msg: string, id: string) {
    super(msg);
    this.id = id;
    Object.setPrototypeOf(this, NoFormError.prototype);
  }
}

const getTemplateForDocument = (
  resolvedDocument: ResolvedDocument,
  tinaSchema: TinaSchema
) => {
  const id = resolvedDocument._internalSys.path;
  let collection: Collection<true> | undefined;
  try {
    collection = tinaSchema.getCollectionByFullPath(id);
  } catch (e) {}

  if (!collection) {
    throw new Error(`Unable to determine collection for path ${id}`);
  }

  const template = tinaSchema.getTemplateForData({
    data: resolvedDocument._internalValues,
    collection,
  });
  return { template, collection };
};

const buildForm = ({
  resolvedDocument,
  tinaSchema,
  payloadId,
  cms,
}: {
  resolvedDocument: ResolvedDocument;
  tinaSchema: TinaSchema;
  payloadId: string;
  cms: TinaCMS;
}) => {
  const { template, collection } = getTemplateForDocument(
    resolvedDocument,
    tinaSchema
  );
  const id = resolvedDocument._internalSys.path;
  let form: Form | undefined;
  let shouldRegisterForm = true;
  const formConfig: FormOptions<any> = {
    id,
    initialValues: resolvedDocument._internalValues,
    fields: template.fields.map((field) => resolveField(field, tinaSchema)),
    onSubmit: (payload) =>
      onSubmit(
        collection,
        resolvedDocument._internalSys.relativePath,
        payload,
        cms
      ),
    label: collection.label || collection.name,
  };
  if (tinaSchema.config.config?.formifyCallback) {
    const callback = tinaSchema.config.config
      ?.formifyCallback as FormifyCallback;
    form =
      callback(
        {
          createForm: createForm,
          createGlobalForm: createGlobalForm,
          skip: () => {},
          formConfig,
        },
        cms
      ) || undefined;
    if (!form) {
      // If the form isn't created from formify, we still
      // need it, just don't show it to the user.
      shouldRegisterForm = false;
      form = new Form(formConfig);
    }
  } else {
    if (collection.ui?.global) {
      form = createGlobalForm(formConfig);
    } else {
      form = createForm(formConfig);
    }
  }
  if (form) {
    if (shouldRegisterForm) {
      if (collection.ui?.global) {
        cms.plugins.add(new GlobalFormPlugin(form));
      }
      cms.dispatch({ type: 'forms:add', value: form });
    }
  }
  if (!form) {
    throw new Error(`No form registered for ${id}.`);
  }
  return { template, form };
};
