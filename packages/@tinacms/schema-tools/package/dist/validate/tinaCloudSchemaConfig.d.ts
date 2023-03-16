/**

*/
import { Config } from '../types/index';
import z from 'zod';
export declare const tinaConfigZod: z.ZodObject<{
    client: z.ZodOptional<z.ZodObject<{
        referenceDepth: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        referenceDepth?: number;
    }, {
        referenceDepth?: number;
    }>>;
    media: z.ZodOptional<z.ZodObject<{
        tina: z.ZodOptional<z.ZodObject<{
            publicFolder: z.ZodString;
            mediaRoot: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            publicFolder?: string;
            mediaRoot?: string;
        }, {
            publicFolder?: string;
            mediaRoot?: string;
        }>>;
        loadCustomStore: z.ZodOptional<z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        tina?: {
            publicFolder?: string;
            mediaRoot?: string;
        };
        loadCustomStore?: (...args: unknown[]) => unknown;
    }, {
        tina?: {
            publicFolder?: string;
            mediaRoot?: string;
        };
        loadCustomStore?: (...args: unknown[]) => unknown;
    }>>;
}, "strip", z.ZodTypeAny, {
    client?: {
        referenceDepth?: number;
    };
    media?: {
        tina?: {
            publicFolder?: string;
            mediaRoot?: string;
        };
        loadCustomStore?: (...args: unknown[]) => unknown;
    };
}, {
    client?: {
        referenceDepth?: number;
    };
    media?: {
        tina?: {
            publicFolder?: string;
            mediaRoot?: string;
        };
        loadCustomStore?: (...args: unknown[]) => unknown;
    };
}>;
export declare const validateTinaCloudSchemaConfig: (config: unknown) => Config;
