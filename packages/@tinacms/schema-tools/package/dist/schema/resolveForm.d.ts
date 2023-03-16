/**

*/
import type { Template, Collection } from '../types/index';
import type { TinaSchema } from './TinaSchema';
/**
 *  Given a collection, basename, template and schema. This will transform the given information into a valid frontend form config
 */
export declare const resolveForm: ({ collection, basename, template, schema, }: ResolveFormArgs) => {
    id: string;
    label: string;
    name: string;
    fields: {
        [key: string]: unknown;
        name: string;
        component: string | ((props: {
            field: import("../types/index").TinaField<false> & {
                namespace: string[];
            };
            input: {
                name: string;
                onBlur: (event?: any) => void;
                onChange: (event: any) => void;
                onFocus: (event?: any) => void;
                type?: string;
                value: string[];
            };
            meta: {
                active?: boolean;
                dirty?: boolean;
                error?: any;
            };
        }) => any) | ((props: {
            field: import("../types/index").TinaField<false> & {
                namespace: string[];
            };
            input: {
                name: string;
                onBlur: (event?: any) => void;
                onChange: (event: any) => void;
                onFocus: (event?: any) => void;
                type?: string;
                value: number[];
            };
            meta: {
                active?: boolean;
                dirty?: boolean;
                error?: any;
            };
        }) => any) | ((props: {
            field: import("../types/index").TinaField<false> & {
                namespace: string[];
            };
            input: {
                name: string;
                onBlur: (event?: any) => void;
                onChange: (event: any) => void;
                onFocus: (event?: any) => void;
                type?: string;
                value: boolean[];
            };
            meta: {
                active?: boolean;
                dirty?: boolean;
                error?: any;
            };
        }) => any) | ((props: {
            field: import("../types/index").TinaField<false> & {
                namespace: string[];
            };
            input: {
                name: string;
                onBlur: (event?: any) => void;
                onChange: (event: any) => void;
                onFocus: (event?: any) => void;
                type?: string;
                value: {
                    type: "root";
                    children: Record<string, unknown>[];
                }[];
            };
            meta: {
                active?: boolean;
                dirty?: boolean;
                error?: any;
            };
        }) => any) | ((props: {
            field: import("../types/index").TinaField<false> & {
                namespace: string[];
            };
            input: {
                name: string;
                onBlur: (event?: any) => void;
                onChange: (event: any) => void;
                onFocus: (event?: any) => void;
                type?: string;
                value: string;
            };
            meta: {
                active?: boolean;
                dirty?: boolean;
                error?: any;
            };
        }) => any) | ((props: {
            field: import("../types/index").TinaField<false> & {
                namespace: string[];
            };
            input: {
                name: string;
                onBlur: (event?: any) => void;
                onChange: (event: any) => void;
                onFocus: (event?: any) => void;
                type?: string;
                value: number;
            };
            meta: {
                active?: boolean;
                dirty?: boolean;
                error?: any;
            };
        }) => any) | ((props: {
            field: import("../types/index").TinaField<false> & {
                namespace: string[];
            };
            input: {
                name: string;
                onBlur: (event?: any) => void;
                onChange: (event: any) => void;
                onFocus: (event?: any) => void;
                type?: string;
                value: boolean;
            };
            meta: {
                active?: boolean;
                dirty?: boolean;
                error?: any;
            };
        }) => any) | ((props: {
            field: import("../types/index").TinaField<false> & {
                namespace: string[];
            };
            input: {
                name: string;
                onBlur: (event?: any) => void;
                onChange: (event: any) => void;
                onFocus: (event?: any) => void;
                type?: string;
                value: {
                    type: "root";
                    children: Record<string, unknown>[];
                };
            };
            meta: {
                active?: boolean;
                dirty?: boolean;
                error?: any;
            };
        }) => any);
        type: string;
    }[];
};
declare type ResolveFormArgs = {
    collection: Collection<true>;
    basename: string;
    template: Template<true>;
    schema: TinaSchema;
};
export {};
