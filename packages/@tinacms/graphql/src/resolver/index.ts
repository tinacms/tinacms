/**

*/

import path from 'path';
import isValid from 'date-fns/isValid/index.js';
import { JSONPath } from 'jsonpath-plus';
import { NAMER } from '../ast-builder';
import { Database } from '../database';
import { parseMDX, serializeMDX } from '../mdx';
import { assertShape, lastItem, sequential } from '../util';

import type {
  Collectable,
  Collection,
  ReferenceType,
  Template,
  TinaField,
  TinaSchema,
} from '@tinacms/schema-tools';

import type { GraphQLConfig } from '../types';

import { GraphQLError } from 'graphql';
import { generatePasswordHash } from '../auth/utils';
import {
  FilterCondition,
  REFS_COLLECTIONS_SORT_KEY,
  REFS_PATH_FIELD,
  REFS_REFERENCE_FIELD,
  makeFilterChain,
} from '../database/datalayer';
import { TinaGraphQLError, TinaParseDocumentError } from './error';
import { collectConditionsForField, resolveReferences } from './filter-utils';
import {
  resolveMediaCloudToRelative,
  resolveMediaRelativeToCloud,
} from './media-utils';

interface ResolverConfig {
  config?: GraphQLConfig;
  database: Database;
  tinaSchema: TinaSchema;
  isAudit: boolean;
}

export const createResolver = (args: ResolverConfig) => {
  return new Resolver(args);
};

const resolveFieldData = async (
  { namespace, ...field }: TinaField<true>,
  rawData: unknown,
  accumulator: { [key: string]: unknown },
  tinaSchema: TinaSchema,
  config?: GraphQLConfig,
  isAudit?: boolean
) => {
  if (!rawData) {
    return undefined;
  }
  assertShape<{ [key: string]: unknown }>(rawData, (yup) => yup.object());
  const value = rawData[field.name];
  switch (field.type) {
    case 'datetime':
      // See you in March ;)
      if (value instanceof Date) {
        accumulator[field.name] = value.toISOString();
      } else {
        accumulator[field.name] = value;
      }
      break;
    case 'string':
    case 'boolean':
    case 'number':
      accumulator[field.name] = value;
      break;
    case 'reference':
      if (value) {
        accumulator[field.name] = value;
      }
      break;
    case 'password':
      accumulator[field.name] = {
        value: undefined, // never resolve the password hash
        passwordChangeRequired: value['passwordChangeRequired'] ?? false,
      };
      break;
    case 'image':
      accumulator[field.name] = resolveMediaRelativeToCloud(
        value as string,
        config,
        tinaSchema.schema
      );
      break;
    case 'rich-text':
      // @ts-ignore value is unknown
      const tree = parseMDX(value, field, (value) =>
        resolveMediaRelativeToCloud(value, config, tinaSchema.schema)
      );
      if (tree?.children[0]?.type === 'invalid_markdown') {
        if (isAudit) {
          const invalidNode = tree?.children[0];
          throw new GraphQLError(
            `${invalidNode?.message}${
              invalidNode.position
                ? ` at line ${invalidNode.position.start.line}, column ${invalidNode.position.start.column}`
                : ''
            }`
          );
        }
      }
      accumulator[field.name] = tree;
      break;
    case 'object':
      if (field.list) {
        if (!value) {
          return;
        }

        assertShape<{ [key: string]: unknown }[]>(value, (yup) =>
          yup.array().of(yup.object().required())
        );
        accumulator[field.name] = await sequential(value, async (item) => {
          const template = tinaSchema.getTemplateForData({
            data: item,
            collection: {
              namespace,
              ...field,
            },
          });
          const payload = {};
          await sequential(template.fields, async (field) => {
            await resolveFieldData(
              field,
              item,
              payload,
              tinaSchema,
              config,
              isAudit
            );
          });
          const isUnion = !!field.templates;
          return isUnion
            ? {
                _template: lastItem(template.namespace),
                ...payload,
              }
            : payload;
        });
      } else {
        if (!value) {
          return;
        }

        const template = tinaSchema.getTemplateForData({
          data: value,
          collection: {
            namespace,
            ...field,
          },
        });
        const payload = {};
        await sequential(template.fields, async (field) => {
          await resolveFieldData(
            field,
            value,
            payload,
            tinaSchema,
            config,
            isAudit
          );
        });
        const isUnion = !!field.templates;
        accumulator[field.name] = isUnion
          ? {
              _template: lastItem(template.namespace),
              ...payload,
            }
          : payload;
      }

      break;
    default:
      return field;
  }
  return accumulator;
};

export const transformDocumentIntoPayload = async (
  fullPath: string,
  rawData: { _collection; _template },
  tinaSchema: TinaSchema,
  config?: GraphQLConfig,
  isAudit?: boolean,
  hasReferences?: boolean
) => {
  const collection = tinaSchema.getCollection(rawData._collection);
  try {
    const template = tinaSchema.getTemplateForData({
      data: rawData,
      collection,
    });

    const {
      base: basename,
      ext: extension,
      name: filename,
    } = path.parse(fullPath);

    const relativePath = fullPath
      .replace(/\\/g, '/')
      .replace(collection.path, '')
      .replace(/^\/|\/$/g, '');

    const breadcrumbs = relativePath.replace(extension, '').split('/');

    const data = {
      _collection: rawData._collection,
      _template: rawData._template,
    };
    try {
      await sequential(template.fields, async (field) => {
        return resolveFieldData(
          field,
          rawData,
          data,
          tinaSchema,
          config,
          isAudit
        );
      });
    } catch (e) {
      throw new TinaParseDocumentError({
        originalError: e,
        collection: collection.name,
        includeAuditMessage: !isAudit,
        file: relativePath,
      });
    }

    const titleField = template.fields.find((x) => {
      // @ts-ignore
      if (x.type === 'string' && x?.isTitle) {
        return true;
      }
    });
    const titleFieldName = titleField?.name;
    const title = data[titleFieldName || ' '] || null;

    return {
      __typename: collection.fields
        ? NAMER.documentTypeName(collection.namespace)
        : NAMER.documentTypeName(template.namespace),
      id: fullPath,
      ...data,
      _sys: {
        title: title || '',
        basename,
        filename,
        extension,
        hasReferences,
        path: fullPath,
        relativePath,
        breadcrumbs,
        collection,
        template: lastItem(template.namespace),
      },
      _values: data,
      _rawData: rawData,
    };
  } catch (e) {
    if (e instanceof TinaGraphQLError) {
      // Attach additional information
      throw new TinaGraphQLError(e.message, {
        requestedDocument: fullPath,
        ...e.extensions,
      });
    }
    throw e;
  }
};

/**
 * Updates a property in an object using a JSONPath.
 * @param obj - The object to update.
 * @param path - The JSONPath string.
 * @param newValue - The new value to set at the specified path.
 * @returns the updated object.
 */
export const updateObjectWithJsonPath = (
  obj: any,
  path: string,
  oldValue: any,
  newValue: any
) => {
  let updated = false;
  // Handle the case where path is a simple top-level property
  if (!path.includes('.') && !path.includes('[')) {
    if (path in obj && obj[path] === oldValue) {
      obj[path] = newValue;
      updated = true;
    }
    return { object: obj, updated };
  }

  // Extract the parent path (everything except the last segment)
  const parentPath = path.replace(/\.[^.\[\]]+$/, '');
  const keyToUpdate = path.match(/[^.\[\]]+$/)[0];

  // Use JSONPath to locate all parent objects
  const parents = JSONPath({
    path: parentPath,
    json: obj,
    resultType: 'value',
  });

  if (parents.length > 0) {
    parents.forEach((parent) => {
      if (parent && typeof parent === 'object' && keyToUpdate in parent) {
        // Check if the current value matches the oldValue
        if (parent[keyToUpdate] === oldValue) {
          // Update the property with the new value
          parent[keyToUpdate] = newValue;
          updated = true;
        }
      }
    });
  }

  return { object: obj, updated };
};

/**
 * The resolver provides functions for all possible types of lookup
 * values and retrieves them from the database
 */
export class Resolver {
  public config: GraphQLConfig;
  public database: Database;
  public tinaSchema: TinaSchema;
  public isAudit: boolean;

  constructor(public init: ResolverConfig) {
    this.config = init.config;
    this.database = init.database;
    this.tinaSchema = init.tinaSchema;
    this.isAudit = init.isAudit;
  }

  public resolveCollection = async (
    _args,
    collectionName: string,
    hasDocuments?: boolean
  ) => {
    const collection = this.tinaSchema.getCollection(collectionName);
    const extraFields = {};
    // const res = this.tinaSchema.getTemplatesForCollectable(collection);
    // if (res.type === "object") {
    //   extraFields["fields"] = res.template.fields;
    // }
    // if (res.type === "union") {
    //   extraFields["templates"] = res.templates;
    // }

    return {
      // return the collection and hasDocuments to resolve documents at a lower level
      documents: { collection: collection, hasDocuments },
      ...collection,
      ...extraFields,
    };
  };

  public getRaw = async (fullPath: unknown) => {
    if (typeof fullPath !== 'string') {
      throw new Error(
        `fullPath must be of type string for getDocument request`
      );
    }

    return this.database.get<{
      _collection: string;
      _template: string;
    }>(fullPath);
  };

  public getDocumentOrDirectory = async (fullPath: unknown) => {
    if (typeof fullPath !== 'string') {
      throw new Error(
        `fullPath must be of type string for getDocumentOrDirectory request`
      );
    }
    const rawData = await this.getRaw(fullPath);
    if (rawData['__folderBasename']) {
      return {
        __typename: 'Folder',
        name: rawData['__folderBasename'],
        path: rawData['__folderPath'],
      };
    } else {
      return transformDocumentIntoPayload(
        fullPath,
        rawData,
        this.tinaSchema,
        this.config,
        this.isAudit
      );
    }
  };

  public getDocument = async (
    fullPath: unknown,
    opts: {
      collection?: Collection<true>;
      checkReferences?: boolean;
    } = {}
  ) => {
    if (typeof fullPath !== 'string') {
      throw new Error(
        `fullPath must be of type string for getDocument request`
      );
    }

    const rawData = await this.getRaw(fullPath);
    const hasReferences = opts?.checkReferences
      ? await this.hasReferences(fullPath, opts.collection)
      : undefined;
    return transformDocumentIntoPayload(
      fullPath,
      rawData,
      this.tinaSchema,
      this.config,
      this.isAudit,
      hasReferences
    );
  };

  public deleteDocument = async (fullPath: unknown) => {
    if (typeof fullPath !== 'string') {
      throw new Error(
        `fullPath must be of type string for getDocument request`
      );
    }

    await this.database.delete(fullPath);
  };

  public buildObjectMutations = async (
    fieldValue: any,
    field: Collectable,
    existingData?: Record<string, any> | Record<string, any>[]
  ) => {
    if (field.fields) {
      const objectTemplate = field;
      if (Array.isArray(fieldValue)) {
        const idField = objectTemplate.fields.find((field) => field.uid);
        if (idField) {
          // check for duplicate ids in the data array
          const ids = fieldValue.map((d) => d[idField.name]);
          const duplicateIds = ids.filter(
            (id, index) => ids.indexOf(id) !== index
          );
          if (duplicateIds.length > 0) {
            throw new Error(
              `Duplicate ids found in array for field marked as identifier: ${idField.name}`
            );
          }
        }
        return Promise.all(
          fieldValue.map(async (item) =>
            // @ts-ignore FIXME Argument of type 'string | object' is not assignable to parameter of type '{ [fieldName: string]: string | object | (string | object)[]; }'
            {
              return this.buildFieldMutations(
                item,
                objectTemplate as any,
                idField &&
                  existingData &&
                  existingData?.find(
                    (d) => d[idField.name] === item[idField.name]
                  )
              );
            }
          )
        );
      } else {
        return this.buildFieldMutations(
          // @ts-ignore FIXME Argument of type 'string | object' is not assignable to parameter of type '{ [fieldName: string]: string | object | (string | object)[]; }'
          fieldValue,
          //@ts-ignore
          objectTemplate,
          existingData
        );
      }
    }
    if (field.templates) {
      if (Array.isArray(fieldValue)) {
        return Promise.all(
          fieldValue.map(async (item) => {
            if (typeof item === 'string') {
              throw new Error(
                //@ts-ignore
                `Expected object for template value for field ${field.name}`
              );
            }
            const templates = field.templates.map((templateOrTemplateName) => {
              return templateOrTemplateName;
            });
            const [templateName] = Object.entries(item)[0];
            const template = templates.find(
              //@ts-ignore
              (template) => template.name === templateName
            );
            if (!template) {
              throw new Error(`Expected to find template ${templateName}`);
            }
            return {
              // @ts-ignore FIXME Argument of type 'unknown' is not assignable to parameter of type '{ [fieldName: string]: string | { [key: string]: unknown; } | (string | { [key: string]: unknown; })[]; }'
              ...(await this.buildFieldMutations(
                item[template.name],
                template
              )),
              //@ts-ignore
              _template: template.name,
            };
          })
        );
      } else {
        if (typeof fieldValue === 'string') {
          throw new Error(
            //@ts-ignore
            `Expected object for template value for field ${field.name}`
          );
        }
        const templates = field.templates.map((templateOrTemplateName) => {
          return templateOrTemplateName;
        });
        const [templateName] = Object.entries(fieldValue)[0];
        const template = templates.find(
          //@ts-ignore
          (template) => template.name === templateName
        );
        if (!template) {
          throw new Error(`Expected to find template ${templateName}`);
        }
        return {
          // @ts-ignore FIXME Argument of type 'unknown' is not assignable to parameter of type '{ [fieldName: string]: string | { [key: string]: unknown; } | (string | { [key: string]: unknown; })[]; }'
          ...(await this.buildFieldMutations(
            fieldValue[template.name],
            template
          )),
          //@ts-ignore
          _template: template.name,
        };
      }
    }
  };

  public resolveAddPendingDocument = async ({
    collectionName,
    relativePath,
    templateName,
  }: {
    collectionName: string;
    relativePath: string;
    templateName: string;
  }) => {
    const collection = this.getCollectionWithName(collectionName);
    const realPath = path.join(collection.path, relativePath);

    const alreadyExists = await this.database.documentExists(realPath);
    if (alreadyExists) {
      throw new Error(`Unable to add document, ${realPath} already exists`);
    }

    const templateInfo = this.tinaSchema.getTemplatesForCollectable(collection);
    switch (templateInfo.type) {
      case 'object':
        await this.database.addPendingDocument(realPath, {});
        break;
      case 'union':
        if (!templateName) {
          throw new Error(
            `Must specify a template when creating content for a collection with multiple templates. Possible templates are: ${templateInfo.templates
              .map((t) => lastItem(t.namespace))
              .join(' ')}`
          );
        }

        const template = templateInfo.templates.find(
          (template) => lastItem(template.namespace) === templateName
        );
        if (!template) {
          throw new Error(
            `Expected to find template named ${templateName} in collection "${
              collection.name
            }" but none was found. Possible templates are: ${templateInfo.templates
              .map((t) => lastItem(t.namespace))
              .join(' ')}`
          );
        }
        await this.database.addPendingDocument(realPath, {
          _template: lastItem(template.namespace),
        });
    }
    return this.getDocument(realPath);
  };

  /**
   * Returns top-level fields which are not defined in the collection, so their
   * values are not eliminated from Tina when new values are saved
   */
  public resolveLegacyValues = (oldDoc, collection: Collection<true>) => {
    const legacyValues = {};
    Object.entries(oldDoc).forEach(([key, value]) => {
      const reservedKeys = [
        '$_body',
        '_collection',
        '_keepTemplateKey',
        '_template',
        '_relativePath',
        '_id',
      ];
      // ignore reserved keys
      if (reservedKeys.includes(key)) {
        return;
      }
      // if we have a template key and templates in the collection
      if (oldDoc._template && collection.templates) {
        const template = collection.templates?.find(
          ({ name }) => name === oldDoc._template
        );
        if (template) {
          if (!template.fields.find(({ name }) => name === key)) {
            legacyValues[key] = value;
          }
        }
      }
      // if we have a collection key and fields in the collection
      if (oldDoc._collection && collection.fields) {
        if (!collection.fields.find(({ name }) => name === key)) {
          legacyValues[key] = value;
        }
      }
    });
    return legacyValues;
  };

  private getCollectionWithName = (collectionName: string) => {
    const collectionNames = this.tinaSchema
      .getCollections()
      .map((item) => item.name);

    if (!collectionNames.includes(collectionName)) {
      throw new Error(
        `"collection" must be one of: [${collectionNames.join(
          ', '
        )}] but got ${collectionName}`
      );
    }

    return this.tinaSchema.getCollection(collectionName);
  };

  /*
   * Used for getDocument, get<Collection>Document.
   */
  public resolveRetrievedDocument = async ({
    collectionName,
    relativePath,
  }: {
    collectionName: string;
    relativePath: string;
  }) => {
    const collection = this.getCollectionWithName(collectionName);
    const realPath = path.join(collection.path, relativePath);
    return this.getDocument(realPath, {
      collection,
      checkReferences: true,
    });
  };

  /*
   * Used for createFolder, create<Collection>Folder
   */
  public resolveCreateFolder = async ({
    collectionName,
    relativePath,
  }: {
    collectionName: string;
    relativePath: string;
  }) => {
    const collection = this.getCollectionWithName(collectionName);
    const realPath = path.join(
      collection.path,
      relativePath,
      `.gitkeep.${collection.format || 'md'}`
    );
    const alreadyExists = await this.database.documentExists(realPath);
    if (alreadyExists) {
      throw new Error(`Unable to add folder, ${realPath} already exists`);
    }
    await this.database.put(
      realPath,
      { _is_tina_folder_placeholder: true },
      collection.name
    );
    return this.getDocument(realPath);
  };

  public resolveCreateDocument = async ({
    collectionName,
    relativePath,
    body,
  }: {
    collectionName: string;
    relativePath: string;
    body: Record<string, unknown>;
  }) => {
    const collection = this.getCollectionWithName(collectionName);
    const realPath = path.join(collection.path, relativePath);
    const alreadyExists = await this.database.documentExists(realPath);
    if (alreadyExists) {
      throw new Error(`Unable to add document, ${realPath} already exists`);
    }

    const params = await this.buildObjectMutations(body, collection);
    // @ts-expect-error
    await this.database.put(realPath, params, collection.name);
    return this.getDocument(realPath);
  };

  public resolveUpdateDocument = async ({
    collectionName,
    relativePath,
    newRelativePath,
    newBody,
  }: {
    collectionName: string;
    relativePath: string;
    newRelativePath?: string;
    newBody?: Record<string, unknown>;
  }) => {
    const collection = this.getCollectionWithName(collectionName);
    const realPath = path.join(collection.path, relativePath);
    const alreadyExists = await this.database.documentExists(realPath);
    if (!alreadyExists) {
      throw new Error(`Unable to update document, ${realPath} does not exist`);
    }

    const doc = await this.getDocument(realPath);

    if (newRelativePath) {
      const newRealPath = path.join(collection?.path, newRelativePath);

      // don't update if the paths are the same
      if (newRealPath === realPath) {
        return doc;
      }

      // update the document
      await this.database.put(newRealPath, doc._rawData, collection.name);
      // delete the old document
      await this.deleteDocument(realPath);
      // update references to the document
      const collRefs = await this.findReferences(realPath, collection);
      for (const [_collection, docsWithRefs] of Object.entries(collRefs)) {
        for (const [pathToDocWithRef, referencePaths] of Object.entries(
          docsWithRefs
        )) {
          // load the document with the references
          let docWithRef = await this.getRaw(pathToDocWithRef);

          let hasUpdate = false;
          // update each reference to the updated document
          for (const path of referencePaths) {
            const { object, updated } = updateObjectWithJsonPath(
              docWithRef,
              path,
              realPath,
              newRealPath
            );
            docWithRef = object;
            hasUpdate = updated || hasUpdate;
          }

          // save the updated document
          if (hasUpdate) {
            // lookup collection for the document with the references
            const collectionWithRef =
              this.tinaSchema.getCollectionByFullPath(pathToDocWithRef);
            if (!collectionWithRef) {
              throw new Error(
                `Unable to find collection for ${pathToDocWithRef}`
              );
            }

            await this.database.put(
              pathToDocWithRef,
              docWithRef,
              collectionWithRef.name
            );
          }
        }
      }
      return this.getDocument(newRealPath);
    }

    if (!newBody) {
      throw new Error('Body not provided for updated document.');
    }
    const params = await this.buildObjectMutations(
      newBody,
      collection,
      doc?._rawData
    );
    const legacyValues = this.resolveLegacyValues(
      doc?._rawData || {},
      collection
    );
    await this.database.put(
      realPath,
      { ...legacyValues, ...params },
      collection.name
    );
    return this.getDocument(realPath);
  };

  public resolveDeleteDocument = async ({
    collectionName,
    relativePath,
  }: {
    collectionName: string;
    relativePath: string;
  }) => {
    const collection = this.getCollectionWithName(collectionName);
    const realPath = path.join(collection.path, relativePath);
    const alreadyExists = await this.database.documentExists(realPath);
    if (!alreadyExists) {
      throw new Error(`Unable to delete document, ${realPath} does not exist`);
    }

    const doc = await this.getDocument(realPath);
    await this.deleteDocument(realPath);
    if (await this.hasReferences(realPath, collection)) {
      const collRefs = await this.findReferences(realPath, collection);
      for (const [_collection, docsWithRefs] of Object.entries(collRefs)) {
        for (const [pathToDocWithRef, referencePaths] of Object.entries(
          docsWithRefs
        )) {
          // load the doc with the references
          let refDoc = await this.getRaw(pathToDocWithRef);

          let hasUpdate = false;
          // Update each reference to the deleted document
          for (const path of referencePaths) {
            const { object, updated } = updateObjectWithJsonPath(
              refDoc,
              path,
              realPath,
              null
            );
            refDoc = object;
            hasUpdate = updated || hasUpdate;
          }

          if (hasUpdate) {
            const collectionWithRef =
              this.tinaSchema.getCollectionByFullPath(pathToDocWithRef);
            if (!collectionWithRef) {
              throw new Error(
                `Unable to find collection for ${pathToDocWithRef}`
              );
            }
            // save the updated doc
            await this.database.put(
              pathToDocWithRef,
              refDoc,
              collectionWithRef.name
            );
          }
        }
      }
    }
    return doc;
  };

  private resolveAndValidateCollection = ({
    collectionName,
    args,
    isCollectionSpecific,
  }: {
    collectionName?: string;
    args: unknown;
    isCollectionSpecific?: boolean;
  }) => {
    /**
     * `collectionName` is passed in:
     *    * `addPendingDocument()` has `collection` on `args`
     *    * `getDocument()` provides a `collection` on `args`
     *    * `get<Collection>Document()` has `collection` on `lookup`
     */
    let collectionLookup = collectionName || undefined;

    /**
     * For generic functions (like `createDocument()` and `updateDocument()`), `collection` is the top key of the `params`
     */
    if (!collectionLookup && isCollectionSpecific === false) {
      assertShape<{ params: Record<string, unknown> }>(args, (yup) =>
        yup.object({
          params: yup.object().required(),
        })
      );
      collectionLookup = Object.keys(args.params)[0];
    }

    const collection = this.getCollectionWithName(collectionLookup);
    return { collection };
  };

  /**
   * @deprecated - To be removed in next major version.
   */
  public createResolveDocument = async ({
    collection,
    realPath,
    args,
    isAddPendingDocument,
  }: {
    collection: Collection<true>;
    realPath: string;
    args: unknown;
    isAddPendingDocument: boolean;
  }) => {
    /**
     * TODO: Remove when `addPendingDocument` is no longer needed.
     */
    if (isAddPendingDocument === true) {
      return this.resolveAddPendingDocument({
        collectionName: collection.name,
        relativePath: path.relative(collection.path, realPath),
        templateName: (args as { template?: string }).template,
      });
    }

    const params = await this.buildObjectMutations(
      // @ts-ignore
      args.params[collection.name],
      collection
    );

    // @ts-ignore
    await this.database.put(realPath, params, collection.name);
    return this.getDocument(realPath);
  };

  /**
   * @deprecated - To be removed in next major version.
   */
  public updateResolveDocument = async ({
    collection,
    realPath,
    args,
    isAddPendingDocument,
    isCollectionSpecific,
  }: {
    collection: Collection<true>;
    realPath: string;
    args: unknown;
    isAddPendingDocument: boolean;
    isCollectionSpecific: boolean;
  }) => {
    const doc = await this.getDocument(realPath);

    const oldDoc = this.resolveLegacyValues(doc?._rawData || {}, collection);
    /**
     * TODO: Remove when `addPendingDocument` is no longer needed.
     */
    if (isAddPendingDocument === true) {
      console.warn(
        '*** DEPRECATION: isAddPendingDocument functionality will be removed Resolver.updateResolveDocument in a future version. ***'
      );
      const templateInfo =
        this.tinaSchema.getTemplatesForCollectable(collection);

      const params = this.buildParams(args);
      switch (templateInfo.type) {
        case 'object':
          if (params) {
            const values = await this.buildFieldMutations(
              params,
              templateInfo.template,
              doc?._rawData
            );
            await this.database.put(
              realPath,
              { ...oldDoc, ...values },
              collection.name
            );
          }
          break;
        case 'union':
          // FIXME: ensure only one field is passed here
          await sequential(templateInfo.templates, async (template) => {
            const templateParams = params[lastItem(template.namespace)];
            if (templateParams) {
              if (typeof templateParams === 'string') {
                throw new Error(
                  `Expected to find an object for template params, but got string`
                );
              }
              const values = {
                ...oldDoc,
                ...(await this.buildFieldMutations(
                  // @ts-ignore FIXME: failing on unknown, which we don't need to know because it's recursive
                  templateParams,
                  template,
                  doc?._rawData
                )),
                _template: lastItem(template.namespace),
              };
              await this.database.put(realPath, values, collection.name);
            }
          });
      }
      return this.getDocument(realPath);
    }

    const params = await this.buildObjectMutations(
      //@ts-ignore
      isCollectionSpecific ? args.params : args.params[collection.name],
      collection,
      doc?._rawData
    );
    //@ts-ignore
    await this.database.put(
      realPath,
      { ...oldDoc, ...params },
      collection.name
    );
    return this.getDocument(realPath);
  };

  /**
   * @deprecated
   */
  public resolveDocument = async ({
    args,
    collection: collectionName,
    isMutation,
    isCreation,
    isDeletion,
    isFolderCreation,
    isAddPendingDocument,
    isCollectionSpecific,
    isUpdateName,
  }: {
    args: unknown;
    collection?: string;
    isMutation: boolean;
    isCreation?: boolean;
    isDeletion?: boolean;
    isFolderCreation?: boolean;
    isAddPendingDocument?: boolean;
    isCollectionSpecific?: boolean;
    isUpdateName?: boolean;
  }) => {
    const { collection } = this.resolveAndValidateCollection({
      collectionName,
      args,
      isCollectionSpecific,
    });

    assertShape<{ relativePath: string }>(args, (yup) =>
      yup.object({ relativePath: yup.string().required() })
    );

    if (isMutation) {
      if (isCreation) {
        if (isAddPendingDocument) {
          assertShape<{ template?: string }>(args, (yup) =>
            yup.object({ template: yup.string() })
          );
          return this.resolveAddPendingDocument({
            collectionName: collection.name,
            relativePath: args.relativePath,
            templateName: (args as { template?: string }).template || '',
          });
        } else {
          assertShape<{ params: Record<string, unknown> }>(args, (yup) =>
            yup.object({ params: yup.object().required() })
          );
          return this.resolveCreateDocument({
            collectionName: collection.name,
            relativePath: args.relativePath,
            body: args.params[collection.name] as Record<string, unknown>,
          });
        }
      } else if (isFolderCreation) {
        return this.resolveCreateFolder({
          collectionName: collection.name,
          relativePath: args.relativePath,
        });
      } else if (isDeletion) {
        return this.resolveDeleteDocument({
          collectionName: collection.name,
          relativePath: args.relativePath,
        });
      } else if (isUpdateName) {
        assertShape<{ params: { relativePath: string } }>(args, (yup) =>
          yup.object({
            params: yup
              .object({ relativePath: yup.string().required() })
              .required(),
          })
        );
        const realPath = path.join(collection.path, args.relativePath);
        return this.updateResolveDocument({
          collection,
          realPath,
          args,
          isAddPendingDocument,
          isCollectionSpecific,
        });
      } else {
        assertShape<{ params: Record<string, unknown> }>(args, (yup) =>
          yup.object({ params: yup.object().required() })
        );
        return this.resolveUpdateDocument({
          collectionName: collection.name,
          relativePath: args.relativePath,
          newBody: isCollectionSpecific
            ? (args.params as Record<string, unknown>)
            : (args.params[collection.name] as Record<string, unknown>),
        });
      }
    } else {
      const realPath = path.join(collection.path, args.relativePath);
      return this.getDocument(realPath, {
        collection,
        checkReferences: true,
      });
    }
  };

  public resolveCollectionConnections = async ({ ids }: { ids: string[] }) => {
    return {
      totalCount: ids.length,
      edges: await sequential(ids, async (filepath) => {
        const document = await this.getDocument(filepath);
        return {
          node: document,
        };
      }),
    };
  };

  private referenceResolver = async (
    filter: Record<string, object>,
    fieldDefinition: ReferenceType<true>
  ) => {
    const referencedCollection = this.tinaSchema.getCollection(
      fieldDefinition.collections[0]
    );
    if (!referencedCollection) {
      throw new Error(
        `Unable to find collection for ${fieldDefinition.collections[0]} querying ${fieldDefinition.name}`
      );
    }

    const sortKeys = Object.keys(
      filter[fieldDefinition.name][referencedCollection.name]
    );
    const resolvedCollectionConnection = await this.resolveCollectionConnection(
      {
        args: {
          sort: sortKeys.length === 1 ? sortKeys[0] : undefined,
          filter: {
            ...filter[fieldDefinition.name][referencedCollection.name],
          },
          first: -1,
        },
        collection: referencedCollection,
        hydrator: (path) => path, // just return the path
      }
    );

    const { edges } = resolvedCollectionConnection;
    const values = edges.map((edge) => edge.node);
    return { edges, values };
  };

  private async resolveFilterConditions(
    filter: Record<string, Record<string, object>>,
    fields: TinaField[],
    collectionName
  ) {
    const conditions: FilterCondition[] = [];
    const conditionCollector = (condition: FilterCondition) => {
      if (!condition.filterPath) {
        throw new Error('Error parsing filter - unable to generate filterPath');
      }
      if (!condition.filterExpression) {
        throw new Error(
          `Error parsing filter - missing expression for ${condition.filterPath}`
        );
      }
      conditions.push(condition);
    };

    await resolveReferences(filter, fields, this.referenceResolver);

    for (const fieldName of Object.keys(filter)) {
      const field = (fields as any[]).find(
        (field) => field.name === fieldName
      ) as any;
      if (!field) {
        throw new Error(
          `${fieldName} not found in collection ${collectionName}`
        );
      }
      collectConditionsForField(
        fieldName,
        field,
        filter[fieldName],
        '',
        conditionCollector
      );
    }

    return conditions;
  }

  public resolveCollectionConnection = async ({
    args,
    collection,
    hydrator,
  }: {
    args: Record<string, Record<string, object> | string | number>;
    collection: Collection<true>;
    hydrator?: (string) => any;
  }) => {
    let conditions: FilterCondition[];
    if (args.filter) {
      if (collection.fields) {
        conditions = await this.resolveFilterConditions(
          args.filter as Record<string, Record<string, object>>,
          collection.fields as TinaField[],
          collection.name
        );
      } else if (collection.templates) {
        for (const templateName of Object.keys(args.filter)) {
          const template = (collection.templates as Template[]).find(
            (template) => template.name === templateName
          );

          if (template) {
            conditions = await this.resolveFilterConditions(
              args.filter[templateName],
              template.fields as TinaField[],
              `${collection.name}.${templateName}`
            );
          } else {
            throw new Error(
              `Error template not found: ${templateName} in collection ${collection.name}`
            );
          }
        }
      }
    }

    const queryOptions = {
      filterChain: makeFilterChain({
        conditions: conditions || [],
      }),
      collection: collection.name,
      sort: args.sort as string,
      first: args.first as number,
      last: args.last as number,
      before: args.before as string,
      after: args.after as string,
      folder: args.folder as string,
    };

    const result = await this.database.query(
      queryOptions,
      hydrator ? hydrator : this.getDocumentOrDirectory
    );
    const edges = result.edges;
    const pageInfo = result.pageInfo;

    return {
      totalCount: edges.length,
      edges,
      pageInfo: pageInfo || {
        hasPreviousPage: false,
        hasNextPage: false,
        startCursor: '',
        endCursor: '',
      },
    };
  };

  /**
   * Checks if a document has references to it
   * @param id  The id of the document to check for references
   * @param c The collection to check for references
   * @returns true if the document has references, false otherwise
   */
  private hasReferences = async (id: string, c: Collection) => {
    let count = 0;
    await this.database.query(
      {
        collection: c.name,
        filterChain: makeFilterChain({
          conditions: [
            {
              filterPath: REFS_REFERENCE_FIELD,
              filterExpression: {
                _type: 'string',
                _list: false,
                eq: id,
              },
            },
          ],
        }),
        sort: REFS_COLLECTIONS_SORT_KEY,
      },
      (refId: string) => {
        count++;
        return refId;
      }
    );
    if (count) {
      return true;
    }

    return false;
  };

  /**
   * Finds references to a document
   * @param id the id of the document to find references to
   * @param c the collection to find references in
   * @returns a map of references to the document
   */
  private findReferences = async (id: string, c: Collection) => {
    const references: Record<string, Record<string, string[]>> = {};
    await this.database.query(
      {
        collection: c.name,
        filterChain: makeFilterChain({
          conditions: [
            {
              filterPath: REFS_REFERENCE_FIELD,
              filterExpression: {
                _type: 'string',
                _list: false,
                eq: id,
              },
            },
          ],
        }),
        sort: REFS_COLLECTIONS_SORT_KEY,
      },
      (refId: string, rawItem: Record<string, any>) => {
        if (!references[c.name]) {
          references[c.name] = {};
        }
        if (!references[c.name][refId]) {
          references[c.name][refId] = [];
        }
        const referencePath = rawItem?.[REFS_PATH_FIELD];
        if (referencePath) {
          references[c.name][refId].push(referencePath);
        }
        return refId;
      }
    );
    return references;
  };

  private buildFieldMutations = async (
    fieldParams: FieldParams,
    template: Template<true>,
    existingData?: Record<string, any>
  ) => {
    const accum: { [key: string]: unknown } = {};
    // since password fields may not always be set, we use the template fields to populate an empty string
    for (const passwordField of template.fields.filter(
      (f) => f.type === 'password'
    )) {
      if (!fieldParams[passwordField.name]['value']) {
        fieldParams[passwordField.name] = {
          ...(<object>fieldParams[passwordField.name]),
          value: '',
        };
      }
    }
    for (const [fieldName, fieldValue] of Object.entries(fieldParams)) {
      if (Array.isArray(fieldValue)) {
        if (fieldValue.length === 0) {
          accum[fieldName] = [];
          continue;
        }
      }
      const field = template.fields.find((field) => field.name === fieldName);
      if (!field) {
        throw new Error(`Expected to find field by name ${fieldName}`);
      }
      switch (field.type) {
        case 'datetime':
          // @ts-ignore FIXME: Argument of type 'string | { [key: string]: unknown; } | (string | { [key: string]: unknown; })[]' is not assignable to parameter of type 'string'
          accum[fieldName] = resolveDateInput(fieldValue, field);
          break;
        case 'string':
        case 'boolean':
        case 'number':
          accum[fieldName] = fieldValue;
          break;
        case 'image':
          accum[fieldName] = resolveMediaCloudToRelative(
            fieldValue as string,
            this.config,
            this.tinaSchema.schema
          );
          break;
        case 'object':
          accum[fieldName] = await this.buildObjectMutations(
            fieldValue,
            field,
            existingData?.[fieldName]
          );
          break;
        case 'password':
          if (typeof fieldValue !== 'object') {
            throw new Error(
              `Expected to find object for password field ${fieldName}. Found ${typeof accum[
                fieldName
              ]}`
            );
          }
          if (fieldValue['value']) {
            accum[fieldName] = {
              ...fieldValue,
              value: await generatePasswordHash({
                password: fieldValue['value'],
              }),
            };
          } else {
            accum[fieldName] = {
              ...fieldValue,
              value: existingData?.[fieldName]?.['value'],
            };
          }
          break;
        case 'rich-text':
          // @ts-ignore
          accum[fieldName] = serializeMDX(fieldValue, field, (fieldValue) =>
            resolveMediaCloudToRelative(
              fieldValue as string,
              this.config,
              this.tinaSchema.schema
            )
          );
          break;
        case 'reference':
          accum[fieldName] = fieldValue;
          break;
        default:
          // @ts-ignore
          throw new Error(`No mutation builder for field type ${field.type}`);
      }
    }
    return accum;
  };

  /**
   * A mutation looks nearly identical between updateDocument:
   * ```graphql
   * updateDocument(collection: $collection,relativePath: $path, params: {
   *   post: {
   *     title: "Hello, World"
   *   }
   * })`
   * ```
   * and `updatePostDocument`:
   * ```graphql
   * updatePostDocument(relativePath: $path, params: {
   *   title: "Hello, World"
   * })
   * ```
   * The problem here is that we don't know whether the payload came from `updateDocument`
   * or `updatePostDocument` (we could, but for now it's easier not to pipe those details through),
   * But we do know that when given a `args.collection` value, we can assume that
   * this was a `updateDocument` request, and thus - should grab the data
   * from the corresponding field name in the key
   */
  private buildParams = (args: unknown) => {
    try {
      assertShape<{
        collection: string;
        params: {
          [collectionName: string]: FieldParams;
        };
      }>(args, (yup) =>
        yup.object({
          collection: yup.string().required(),
          params: yup.object().required(),
        })
      );
      return args.params[args.collection];
    } catch (e) {
      // we're _not_ in a `updateDocument` request
    }
    assertShape<{
      params: FieldParams;
    }>(args, (yup) =>
      yup.object({
        params: yup.object().required(),
      })
    );
    return args.params;
  };
}

const resolveDateInput = (value: string) => {
  /**
   * Convert string to `new Date()`
   */
  const date = new Date(value);
  if (!isValid(date)) {
    throw 'Invalid Date';
  }

  return date;
};

type FieldParams = {
  [fieldName: string]: string | { [key: string]: unknown } | FieldParams[];
};
