/**

*/
import { z } from 'zod';
export declare const CollectionBaseSchema: z.ZodObject<{
    label: z.ZodOptional<z.ZodString>;
    name: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    path: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
    format: z.ZodOptional<z.ZodEnum<["json", "md", "markdown", "mdx", "toml", "yaml", "yml"]>>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    label?: string;
    path?: string;
    format?: "markdown" | "mdx" | "json" | "md" | "yaml" | "yml" | "toml";
}, {
    name?: string;
    label?: string;
    path?: string;
    format?: "markdown" | "mdx" | "json" | "md" | "yaml" | "yml" | "toml";
}>;
export declare const TinaCloudSchemaZod: z.ZodEffects<z.ZodObject<{
    collections: z.ZodArray<z.ZodEffects<z.ZodObject<z.extendShape<{
        label: z.ZodOptional<z.ZodString>;
        name: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
        path: z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>;
        format: z.ZodOptional<z.ZodEnum<["json", "md", "markdown", "mdx", "toml", "yaml", "yml"]>>;
    }, {
        fields: z.ZodEffects<z.ZodEffects<z.ZodOptional<z.ZodArray<z.ZodType<import("..").TinaField<false>, z.ZodTypeDef, import("..").TinaField<false>>, "many">>, import("..").TinaField<false>[], import("..").TinaField<false>[]>, import("..").TinaField<false>[], import("..").TinaField<false>[]>;
        templates: z.ZodEffects<z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
            label: z.ZodString;
            name: z.ZodEffects<z.ZodString, string, string>;
            fields: z.ZodArray<z.ZodType<import("..").TinaField<false>, z.ZodTypeDef, import("..").TinaField<false>>, "many">;
        }, "strip", z.ZodTypeAny, {
            name?: string;
            fields?: import("..").TinaField<false>[];
            label?: string;
        }, {
            name?: string;
            fields?: import("..").TinaField<false>[];
            label?: string;
        }>, {
            name?: string;
            fields?: import("..").TinaField<false>[];
            label?: string;
        }, {
            name?: string;
            fields?: import("..").TinaField<false>[];
            label?: string;
        }>, "many">>, {
            name?: string;
            fields?: import("..").TinaField<false>[];
            label?: string;
        }[], {
            name?: string;
            fields?: import("..").TinaField<false>[];
            label?: string;
        }[]>;
    }>, "strip", z.ZodTypeAny, {
        name?: string;
        templates?: {
            name?: string;
            fields?: import("..").TinaField<false>[];
            label?: string;
        }[];
        fields?: import("..").TinaField<false>[];
        label?: string;
        path?: string;
        format?: "markdown" | "mdx" | "json" | "md" | "yaml" | "yml" | "toml";
    }, {
        name?: string;
        templates?: {
            name?: string;
            fields?: import("..").TinaField<false>[];
            label?: string;
        }[];
        fields?: import("..").TinaField<false>[];
        label?: string;
        path?: string;
        format?: "markdown" | "mdx" | "json" | "md" | "yaml" | "yml" | "toml";
    }>, {
        name?: string;
        templates?: {
            name?: string;
            fields?: import("..").TinaField<false>[];
            label?: string;
        }[];
        fields?: import("..").TinaField<false>[];
        label?: string;
        path?: string;
        format?: "markdown" | "mdx" | "json" | "md" | "yaml" | "yml" | "toml";
    }, {
        name?: string;
        templates?: {
            name?: string;
            fields?: import("..").TinaField<false>[];
            label?: string;
        }[];
        fields?: import("..").TinaField<false>[];
        label?: string;
        path?: string;
        format?: "markdown" | "mdx" | "json" | "md" | "yaml" | "yml" | "toml";
    }>, "many">;
    config: z.ZodOptional<z.ZodObject<{
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
    }>>;
}, "strip", z.ZodTypeAny, {
    collections?: {
        name?: string;
        templates?: {
            name?: string;
            fields?: import("..").TinaField<false>[];
            label?: string;
        }[];
        fields?: import("..").TinaField<false>[];
        label?: string;
        path?: string;
        format?: "markdown" | "mdx" | "json" | "md" | "yaml" | "yml" | "toml";
    }[];
    config?: {
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
    };
}, {
    collections?: {
        name?: string;
        templates?: {
            name?: string;
            fields?: import("..").TinaField<false>[];
            label?: string;
        }[];
        fields?: import("..").TinaField<false>[];
        label?: string;
        path?: string;
        format?: "markdown" | "mdx" | "json" | "md" | "yaml" | "yml" | "toml";
    }[];
    config?: {
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
    };
}>, {
    collections?: {
        name?: string;
        templates?: {
            name?: string;
            fields?: import("..").TinaField<false>[];
            label?: string;
        }[];
        fields?: import("..").TinaField<false>[];
        label?: string;
        path?: string;
        format?: "markdown" | "mdx" | "json" | "md" | "yaml" | "yml" | "toml";
    }[];
    config?: {
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
    };
}, {
    collections?: {
        name?: string;
        templates?: {
            name?: string;
            fields?: import("..").TinaField<false>[];
            label?: string;
        }[];
        fields?: import("..").TinaField<false>[];
        label?: string;
        path?: string;
        format?: "markdown" | "mdx" | "json" | "md" | "yaml" | "yml" | "toml";
    }[];
    config?: {
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
    };
}>;
