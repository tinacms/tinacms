import type { Schema } from '../types/index';
export { validateTinaCloudSchemaConfig } from './tinaCloudSchemaConfig';
export declare class TinaSchemaValidationError extends Error {
    constructor(message: any);
}
export declare const validateSchema: ({ schema }: {
    schema: Schema;
}) => void;
