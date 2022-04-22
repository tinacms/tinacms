import schema from "./__generated__/_schema.json";
type postsType<R extends postsReferences = {}> = {
  title?: string;
  heroImg?: string;
  excerpt?: object;
  author?: R["author"] extends true
    ? authorsType
    : R["author"] extends { authors: authorsOptions }
    ? authorsReturn<
        R["author"]["authors"]["fields"],
        R["author"]["authors"]["include"]
      >
    : { id: string };
  date?: string;
  _body?: object;
  _collection: "posts";
  _template: "posts";
};
type globalType<R extends globalReferences = {}> = {
  header?: {
    icon?: {
      color?:
        | "primary"
        | "blue"
        | "teal"
        | "green"
        | "red"
        | "pink"
        | "purple"
        | "orange"
        | "yellow";
      style?: "circle" | "float";
      name?:
        | ""
        | "aperture"
        | "code"
        | "like"
        | "map"
        | "palette"
        | "chart"
        | "pin"
        | "shield"
        | "settings"
        | "store"
        | "ball"
        | "tube"
        | "trophy"
        | "user"
        | "beer"
        | "chat"
        | "cloud"
        | "coffee"
        | "world"
        | "tina";
      _collection: "icon";
      _template: "icon";
    };
    color?: "default" | "primary";
    nav?: {
      href?: string;
      label?: string;
      _collection: "nav";
      _template: "nav";
    }[];
    _collection: "header";
    _template: "header";
  };
  footer?: {
    color?: "default" | "primary";
    social?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      github?: string;
      _collection: "social";
      _template: "social";
    };
    _collection: "footer";
    _template: "footer";
  };
  theme?: {
    color?:
      | "blue"
      | "teal"
      | "green"
      | "red"
      | "pink"
      | "purple"
      | "orange"
      | "yellow";
    font?: "sans" | "nunito" | "lato";
    icon?: "boxicon" | "heroicon";
    darkMode?: "system" | "light" | "dark";
    _collection: "theme";
    _template: "theme";
  };
  _collection: "global";
  _template: "global";
};
type authorsType<R extends authorsReferences = {}> = {
  name?: string;
  avatar?: string;
  favoritePost?: R["favoritePost"] extends true
    ? postsType
    : R["favoritePost"] extends { posts: postsOptions }
    ? postsReturn<
        R["favoritePost"]["posts"]["fields"],
        R["favoritePost"]["posts"]["include"]
      >
    : { id: string };
  _collection: "authors";
  _template: "authors";
};
type pagesType<R extends pagesReferences = {}> = {
  blocks?: (
    | {
        tagline?: string;
        headline?: string;
        text?: object;
        actions?: {
          label?: string;
          type?: "button" | "link";
          icon?: boolean;
          link?: string;
          _collection: "actions";
          _template: "actions";
        }[];
        image?: {
          src?: string;
          alt?: string;
          _collection: "image";
          _template: "image";
        };
        color?: "default" | "tint" | "primary";
        _template: "hero";
      }
    | {
        items?: {
          icon?: {
            color?:
              | "primary"
              | "blue"
              | "teal"
              | "green"
              | "red"
              | "pink"
              | "purple"
              | "orange"
              | "yellow";
            style?: "circle" | "float";
            name?:
              | ""
              | "aperture"
              | "code"
              | "like"
              | "map"
              | "palette"
              | "chart"
              | "pin"
              | "shield"
              | "settings"
              | "store"
              | "ball"
              | "tube"
              | "trophy"
              | "user"
              | "beer"
              | "chat"
              | "cloud"
              | "coffee"
              | "world"
              | "tina";
            _collection: "icon";
            _template: "icon";
          };
          title?: string;
          text?: string;
          _collection: "items";
          _template: "items";
        }[];
        color?: "default" | "tint" | "primary";
        _template: "features";
      }
    | {
        body?: object;
        color?: "default" | "tint" | "primary";
        _template: "content";
      }
    | {
        quote?: string;
        author?: string;
        color?: "default" | "tint" | "primary";
        _template: "testimonial";
      }
  )[];
  _collection: "pages";
  _template: "pages";
};

type postsFields = {
  title?: true;
  heroImg?: true;
  excerpt?: true;
  author?: boolean;
  date?: true;
  _body?: true;
};
type postsReferences = {
  author?:
    | boolean
    | { authors: { fields?: authorsFields; include?: authorsReferences } };
};
type postsOptions = {
  fields?: postsFields;
  include?: postsReferences;
};

type postsReturn<
  T extends postsFields | undefined,
  B extends postsReferences
> = T extends object
  ? {
      [Key in keyof T]: T[Key] extends true
        ? Key extends keyof postsType
          ? postsType[Key]
          : never
        : never;
    }
  : postsType<B>;

type globalFields = {
  header?: boolean | { icon?: boolean; color?: boolean; nav?: boolean };
  footer?: boolean | { color?: boolean; social?: boolean };
  theme?:
    | boolean
    | { color?: boolean; font?: boolean; icon?: boolean; darkMode?: boolean };
};
type globalReferences = {};
type globalOptions = {
  fields?: globalFields;
  include?: globalReferences;
};

type globalReturn<
  T extends globalFields | undefined,
  B extends globalReferences
> = T extends object
  ? {
      [Key in keyof T]: T[Key] extends true
        ? Key extends keyof globalType
          ? globalType[Key]
          : never
        : never;
    }
  : globalType<B>;

type authorsFields = { name?: true; avatar?: true; favoritePost?: boolean };
type authorsReferences = {
  favoritePost?:
    | boolean
    | { posts: { fields?: postsFields; include?: postsReferences } };
};
type authorsOptions = {
  fields?: authorsFields;
  include?: authorsReferences;
};

type authorsReturn<
  T extends authorsFields | undefined,
  B extends authorsReferences
> = T extends object
  ? {
      [Key in keyof T]: T[Key] extends true
        ? Key extends keyof authorsType
          ? authorsType[Key]
          : never
        : never;
    }
  : authorsType<B>;

type pagesFields = {
  blocks?:
    | boolean
    | {
        hero?: boolean;
        features?: boolean;
        content?: boolean;
        testimonial?: boolean;
      };
};
type pagesReferences = {};
type pagesOptions = {
  fields?: pagesFields;
  include?: pagesReferences;
};

type pagesReturn<
  T extends pagesFields | undefined,
  B extends pagesReferences
> = T extends object
  ? {
      [Key in keyof T]: T[Key] extends true
        ? Key extends keyof pagesType
          ? pagesType[Key]
          : never
        : never;
    }
  : pagesType<B>;

function posts<
  T extends postsFields | undefined,
  B extends postsReferences
>(args: { relativePath: string; fields?: never; include?: B }): postsType<B>;
function posts<
  T extends postsFields | undefined,
  B extends postsReferences
>(args: {
  relativePath: string;
  fields?: T;
  include?: never;
}): {
  [Key in keyof T]: T[Key] extends true
    ? Key extends keyof postsType
      ? postsType[Key]
      : never
    : never;
};
function posts<T extends postsFields | undefined, B extends postsReferences>(
  args:
    | {
        relativePath: string;
        fields?: T;
        include?: never;
      }
    | {
        relativePath: string;
        fields?: never;
        include?: B;
      }
):
  | postsType<B>
  | {
      [Key in keyof T]: T[Key] extends true
        ? Key extends keyof postsType
          ? postsType[Key]
          : never
        : never;
    } {
  return {} as any;
}
function postsConnection<
  T extends postsFields | undefined,
  B extends postsReferences
>(args: {
  first: string;
  fields?: never;
  include?: B;
}): { edges: { node: postsType<B> }[] };
function postsConnection<
  T extends postsFields | undefined,
  B extends postsReferences
>(args: {
  first: string;
  fields?: T;
  include?: never;
}): {
  edges: {
    node: {
      [Key in keyof T]: T[Key] extends true
        ? Key extends keyof postsType
          ? postsType[Key]
          : never
        : never;
    };
  }[];
};
function postsConnection<
  T extends postsFields | undefined,
  B extends postsReferences
>(
  args:
    | {
        first: string;
        fields?: T;
        include?: never;
      }
    | {
        first: string;
        fields?: never;
        include?: B;
      }
): {
  edges: {
    node:
      | postsType<B>
      | {
          [Key in keyof T]: T[Key] extends true
            ? Key extends keyof postsType
              ? postsType[Key]
              : never
            : never;
        };
  }[];
} {
  return {} as any;
}

function global<
  T extends globalFields | undefined,
  B extends globalReferences
>(args: { relativePath: string; fields?: never; include?: B }): globalType<B>;
function global<
  T extends globalFields | undefined,
  B extends globalReferences
>(args: {
  relativePath: string;
  fields?: T;
  include?: never;
}): {
  [Key in keyof T]: T[Key] extends true
    ? Key extends keyof globalType
      ? globalType[Key]
      : never
    : never;
};
function global<T extends globalFields | undefined, B extends globalReferences>(
  args:
    | {
        relativePath: string;
        fields?: T;
        include?: never;
      }
    | {
        relativePath: string;
        fields?: never;
        include?: B;
      }
):
  | globalType<B>
  | {
      [Key in keyof T]: T[Key] extends true
        ? Key extends keyof globalType
          ? globalType[Key]
          : never
        : never;
    } {
  return {} as any;
}
function globalConnection<
  T extends globalFields | undefined,
  B extends globalReferences
>(args: {
  first: string;
  fields?: never;
  include?: B;
}): { edges: { node: globalType<B> }[] };
function globalConnection<
  T extends globalFields | undefined,
  B extends globalReferences
>(args: {
  first: string;
  fields?: T;
  include?: never;
}): {
  edges: {
    node: {
      [Key in keyof T]: T[Key] extends true
        ? Key extends keyof globalType
          ? globalType[Key]
          : never
        : never;
    };
  }[];
};
function globalConnection<
  T extends globalFields | undefined,
  B extends globalReferences
>(
  args:
    | {
        first: string;
        fields?: T;
        include?: never;
      }
    | {
        first: string;
        fields?: never;
        include?: B;
      }
): {
  edges: {
    node:
      | globalType<B>
      | {
          [Key in keyof T]: T[Key] extends true
            ? Key extends keyof globalType
              ? globalType[Key]
              : never
            : never;
        };
  }[];
} {
  return {} as any;
}

function authors<
  T extends authorsFields | undefined,
  B extends authorsReferences
>(args: { relativePath: string; fields?: never; include?: B }): authorsType<B>;
function authors<
  T extends authorsFields | undefined,
  B extends authorsReferences
>(args: {
  relativePath: string;
  fields?: T;
  include?: never;
}): {
  [Key in keyof T]: T[Key] extends true
    ? Key extends keyof authorsType
      ? authorsType[Key]
      : never
    : never;
};
function authors<
  T extends authorsFields | undefined,
  B extends authorsReferences
>(
  args:
    | {
        relativePath: string;
        fields?: T;
        include?: never;
      }
    | {
        relativePath: string;
        fields?: never;
        include?: B;
      }
):
  | authorsType<B>
  | {
      [Key in keyof T]: T[Key] extends true
        ? Key extends keyof authorsType
          ? authorsType[Key]
          : never
        : never;
    } {
  return {} as any;
}
function authorsConnection<
  T extends authorsFields | undefined,
  B extends authorsReferences
>(args: {
  first: string;
  fields?: never;
  include?: B;
}): { edges: { node: authorsType<B> }[] };
function authorsConnection<
  T extends authorsFields | undefined,
  B extends authorsReferences
>(args: {
  first: string;
  fields?: T;
  include?: never;
}): {
  edges: {
    node: {
      [Key in keyof T]: T[Key] extends true
        ? Key extends keyof authorsType
          ? authorsType[Key]
          : never
        : never;
    };
  }[];
};
function authorsConnection<
  T extends authorsFields | undefined,
  B extends authorsReferences
>(
  args:
    | {
        first: string;
        fields?: T;
        include?: never;
      }
    | {
        first: string;
        fields?: never;
        include?: B;
      }
): {
  edges: {
    node:
      | authorsType<B>
      | {
          [Key in keyof T]: T[Key] extends true
            ? Key extends keyof authorsType
              ? authorsType[Key]
              : never
            : never;
        };
  }[];
} {
  return {} as any;
}

function pages<
  T extends pagesFields | undefined,
  B extends pagesReferences
>(args: { relativePath: string; fields?: never; include?: B }): pagesType<B>;
function pages<
  T extends pagesFields | undefined,
  B extends pagesReferences
>(args: {
  relativePath: string;
  fields?: T;
  include?: never;
}): {
  [Key in keyof T]: T[Key] extends true
    ? Key extends keyof pagesType
      ? pagesType[Key]
      : never
    : never;
};
function pages<T extends pagesFields | undefined, B extends pagesReferences>(
  args:
    | {
        relativePath: string;
        fields?: T;
        include?: never;
      }
    | {
        relativePath: string;
        fields?: never;
        include?: B;
      }
):
  | pagesType<B>
  | {
      [Key in keyof T]: T[Key] extends true
        ? Key extends keyof pagesType
          ? pagesType[Key]
          : never
        : never;
    } {
  return {} as any;
}
function pagesConnection<
  T extends pagesFields | undefined,
  B extends pagesReferences
>(args: {
  first: string;
  fields?: never;
  include?: B;
}): { edges: { node: pagesType<B> }[] };
function pagesConnection<
  T extends pagesFields | undefined,
  B extends pagesReferences
>(args: {
  first: string;
  fields?: T;
  include?: never;
}): {
  edges: {
    node: {
      [Key in keyof T]: T[Key] extends true
        ? Key extends keyof pagesType
          ? pagesType[Key]
          : never
        : never;
    };
  }[];
};
function pagesConnection<
  T extends pagesFields | undefined,
  B extends pagesReferences
>(
  args:
    | {
        first: string;
        fields?: T;
        include?: never;
      }
    | {
        first: string;
        fields?: never;
        include?: B;
      }
): {
  edges: {
    node:
      | pagesType<B>
      | {
          [Key in keyof T]: T[Key] extends true
            ? Key extends keyof pagesType
              ? pagesType[Key]
              : never
            : never;
        };
  }[];
} {
  return {} as any;
}

type Collection = {
  posts: typeof posts;
  global: typeof global;
  authors: typeof authors;
  pages: typeof pages;
  postsConnection: typeof postsConnection;
  globalConnection: typeof globalConnection;
  authorsConnection: typeof authorsConnection;
  pagesConnection: typeof pagesConnection;
};

const capitalize = (s: string) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const generateNamespacedFieldName = (names: string[], suffix: string = "") => {
  return (suffix ? [...names, suffix] : names).map(capitalize).join("");
};

export const query = <
  B,
  A extends keyof Collection,
  T extends ReturnType<Collection[A]>,
  C extends { [Key in keyof B]: T }
>(
  callback: (sdk: Collection) => C
): Promise<{ data: C; errors?: object[]; query: string }> => {
  const cb = {};

  const addField = (field: any, options: any): any => {
    switch (field.type) {
      case "object":
        if (field.fields) {
          const f = addFields(field.fields, options);
          return `${field.name} { __typename
          ${f}
       }`;
        } else {
          return `${field.name} { __typename
            ${field.templates.map((template: any) => {
              const f = addFields(template.fields, options);
              return `...on ${generateNamespacedFieldName(template.namespace)} {
                ${f}
              }`;
            })}
       }`;
        }
      case "reference":
        if (options?.include) {
          if (Object.keys(options.include).includes(field.name)) {
            const referencedCollections = field.collections.map((col: any) =>
              schema.collections.find((c) => c.name === col)
            );
            if (options.include[field.name] === true) {
              return `${field.name} {
                __typename
                ${referencedCollections.map((collection: any) => {
                  const f = addFields(collection.fields, options);
                  return `...on ${generateNamespacedFieldName(
                    collection.namespace
                  )} {
                    ${f}
                  }`;
                })}
              }`;
            }
            let referenceSelections = [];
            referencedCollections.map((collection) => {
              console.log(options.include[field.name][collection.name]);
              const f = addFields(
                collection.fields,
                options.include[field.name][collection.name]
              );
              referenceSelections.push(`...on ${generateNamespacedFieldName(
                collection.namespace
              )} {
                ${f}
              }`);
            });
            return `${field.name} {
              __typename
              ${referenceSelections.join("\n")}
            }`;
          }
        }
        return `${field.name} { __typename
        ...on Document {
          id
        }
       }`;

      default:
        return field.name;
    }
  };

  const addFields = (fields: any[], options: any): any => {
    if (options?.fields) {
      const f: any = [];
      Object.entries(options.fields).forEach(([k, v]) => {
        if (v) {
          const ff = fields.find((field) => field.name === k);
          if (ff) {
            f.push(ff);
          } else {
            throw new Error(`oops: ${k}`);
          }
        }
      });
      fields = f;
    }

    return fields.map((f) => addField(f, options)).join("\n");
  };
  const docName = (name: any, relativePath: any, list?: boolean) => {
    if (!list) {
      return `${name}${
        list ? "Connection" : ""
      }(relativePath: "${relativePath}")`;
    }
    return `${name}${list ? "Connection" : ""}`;
  };

  const buildCol = (collection: any, args: any) => {
    if (collection.templates) {
      throw new Error("no templates supported");
    }
    if (typeof collection.fields === "string") {
      throw new Error("no global templates supported");
    }
    const f = addFields(collection.fields, args);
    return `${docName(collection.name, args.relativePath)} {
${f}
}`;
  };
  const buildColConnection = (collection: any, args: any) => {
    if (collection.templates) {
      throw new Error("no templates supported");
    }
    if (typeof collection.fields === "string") {
      throw new Error("no global templates supported");
    }
    const f = addFields(collection.fields, args);
    return `${docName(collection.name, args.relativePath, true)} {
edges { node {${f}} }
}`;
  };

  schema.collections.forEach((collection: any) => {
    // @ts-ignore
    cb[collection.name] = (args) => {
      return buildCol(collection, args);
    };
    cb[`${collection.name}Connection`] = (args) => {
      return buildColConnection(collection, args);
    };
  });
  // @ts-ignore
  const query = callback(cb);

  let queryString = `query {`;
  Object.entries(query).forEach(([key, value]) => {
    queryString = queryString + `${key}: ${value}\n`;
  });
  queryString = queryString + `}`;

  return fetch("http://localhost:4001/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: queryString,
    }),
  }).then(async (res) => {
    const json = await res.json();
    return {
      query: queryString,
      ...json,
    };
  });
};

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;
