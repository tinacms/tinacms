import { Schema, Collection, Template, Collectable, CollectionTemplateable, TinaField } from '../types/index';
declare type Version = {
    fullVersion: string;
    major: string;
    minor: string;
    patch: string;
};
declare type Meta = {
    flags?: string[];
};
/**
 * TinaSchema is responsible for allowing you to look up certain
 * properties of the user-provided schema with ease.
 *
 */
export declare class TinaSchema {
    config: {
        version?: Version;
        meta?: Meta;
    } & Schema;
    schema: Schema<true>;
    /**
     * Create a schema class from a user defined schema object
     */
    constructor(config: {
        version?: Version;
        meta?: Meta;
    } & Schema);
    getIsTitleFieldName: (collection: string) => string;
    getCollectionsByName: (collectionNames: string[]) => Collection<true>[];
    getCollection: (collectionName: string) => Collection<true>;
    getCollections: () => Collection<true>[];
    getCollectionByFullPath: (filepath: string) => Collection<true>;
    getCollectionAndTemplateByFullPath: (filepath: string, templateName?: string) => {
        collection: Collection<true>;
        template: Template<true>;
    };
    getTemplateForData: ({ data, collection, }: {
        data?: unknown;
        collection: Collectable;
    }) => Template<true>;
    transformPayload: (collectionName: string, payload: object) => {
        [x: string]: {
            [x: string]: {};
        };
    };
    private transformCollectablePayload;
    private transformField;
    isMarkdownCollection: (collectionName: string) => boolean;
    /**
     * Gets the template or templates from the item.
     * Both `object` fields and collections support
     * the ability for an object to be polymorphic,
     * and if it is, we need to build unions, which
     * are more of a headache for non-polymorphic
     * needs, so we also need the ability to just
     * build object types
     *
     *
     */
    getTemplatesForCollectable: (collection: Collectable) => CollectionTemplateable;
    walkFields: (cb: (args: {
        field: TinaField;
        collection: Collection;
        path: string[];
    }) => void) => void;
    /**
     * This function returns an array of glob matches for a given collection.
     *
     * @param collection The collection to get the matches for. Can be a string or a collection object.
     * @returns An array of glob matches.
     */
    getMatches({ collection: collectionOrString, }: {
        collection: string | Collection;
    }): string[];
    matchFiles({ collection, files, }: {
        collection: string | Collection;
        files: string[];
    }): string[];
}
export {};
