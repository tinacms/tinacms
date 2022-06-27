//@ts-nocheck
// DO NOT MODIFY THIS FILE. This file is automatically generated by Tina
export function gql(strings: TemplateStringsArray, ...args: string[]): string {
  let str = ''
  strings.forEach((string, i) => {
    str += string + (args[i] || '')
  })
  return str
}
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** References another document, used as a foreign key */
  Reference: any;
  JSON: any;
};

export type SystemInfo = {
  __typename?: 'SystemInfo';
  filename: Scalars['String'];
  title?: Maybe<Scalars['String']>;
  basename: Scalars['String'];
  breadcrumbs: Array<Scalars['String']>;
  path: Scalars['String'];
  relativePath: Scalars['String'];
  extension: Scalars['String'];
  template: Scalars['String'];
  collection: Collection;
};


export type SystemInfoBreadcrumbsArgs = {
  excludeExtension?: InputMaybe<Scalars['Boolean']>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  hasPreviousPage: Scalars['Boolean'];
  hasNextPage: Scalars['Boolean'];
  startCursor: Scalars['String'];
  endCursor: Scalars['String'];
};

export type Node = {
  id: Scalars['ID'];
};

export type Document = {
  id: Scalars['ID'];
  _sys?: Maybe<SystemInfo>;
  _values: Scalars['JSON'];
};

/** A relay-compliant pagination connection */
export type Connection = {
  totalCount: Scalars['Float'];
  pageInfo: PageInfo;
};

export type Query = {
  __typename?: 'Query';
  getOptimizedQuery?: Maybe<Scalars['String']>;
  collection: Collection;
  collections: Array<Collection>;
  node: Node;
  document: DocumentNode;
  post: Post;
  postConnection: PostConnection;
  author: Author;
  authorConnection: AuthorConnection;
  blockPage: BlockPage;
  blockPageConnection: BlockPageConnection;
};


export type QueryGetOptimizedQueryArgs = {
  queryString: Scalars['String'];
};


export type QueryCollectionArgs = {
  collection?: InputMaybe<Scalars['String']>;
};


export type QueryNodeArgs = {
  id?: InputMaybe<Scalars['String']>;
};


export type QueryDocumentArgs = {
  collection?: InputMaybe<Scalars['String']>;
  relativePath?: InputMaybe<Scalars['String']>;
};


export type QueryPostArgs = {
  relativePath?: InputMaybe<Scalars['String']>;
};


export type QueryPostConnectionArgs = {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  sort?: InputMaybe<Scalars['String']>;
};


export type QueryAuthorArgs = {
  relativePath?: InputMaybe<Scalars['String']>;
};


export type QueryAuthorConnectionArgs = {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  sort?: InputMaybe<Scalars['String']>;
};


export type QueryBlockPageArgs = {
  relativePath?: InputMaybe<Scalars['String']>;
};


export type QueryBlockPageConnectionArgs = {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  sort?: InputMaybe<Scalars['String']>;
};

export type DocumentConnectionEdges = {
  __typename?: 'DocumentConnectionEdges';
  cursor: Scalars['String'];
  node?: Maybe<DocumentNode>;
};

export type DocumentConnection = Connection & {
  __typename?: 'DocumentConnection';
  pageInfo: PageInfo;
  totalCount: Scalars['Float'];
  edges?: Maybe<Array<Maybe<DocumentConnectionEdges>>>;
};

export type Collection = {
  __typename?: 'Collection';
  name: Scalars['String'];
  slug: Scalars['String'];
  label?: Maybe<Scalars['String']>;
  path: Scalars['String'];
  format?: Maybe<Scalars['String']>;
  matches?: Maybe<Scalars['String']>;
  templates?: Maybe<Array<Maybe<Scalars['JSON']>>>;
  fields?: Maybe<Array<Maybe<Scalars['JSON']>>>;
  documents: DocumentConnection;
};


export type CollectionDocumentsArgs = {
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  sort?: InputMaybe<Scalars['String']>;
};

export type DocumentNode = Post | Author | BlockPage;

export type PostAuthor = Author;

export type Post = Node & Document & {
  __typename?: 'Post';
  title?: Maybe<Scalars['String']>;
  author?: Maybe<PostAuthor>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  categories?: Maybe<Array<Maybe<Scalars['String']>>>;
  published?: Maybe<Scalars['String']>;
  featured?: Maybe<Scalars['Boolean']>;
  body?: Maybe<Scalars['JSON']>;
  id: Scalars['ID'];
  _sys: SystemInfo;
  _values: Scalars['JSON'];
};

export type PostConnectionEdges = {
  __typename?: 'PostConnectionEdges';
  cursor: Scalars['String'];
  node?: Maybe<Post>;
};

export type PostConnection = Connection & {
  __typename?: 'PostConnection';
  pageInfo: PageInfo;
  totalCount: Scalars['Float'];
  edges?: Maybe<Array<Maybe<PostConnectionEdges>>>;
};

export type AuthorSocial = {
  __typename?: 'AuthorSocial';
  platform?: Maybe<Scalars['String']>;
  handle?: Maybe<Scalars['String']>;
};

export type Author = Node & Document & {
  __typename?: 'Author';
  name?: Maybe<Scalars['String']>;
  social?: Maybe<Array<Maybe<AuthorSocial>>>;
  bio?: Maybe<Scalars['JSON']>;
  id: Scalars['ID'];
  _sys: SystemInfo;
  _values: Scalars['JSON'];
};

export type AuthorConnectionEdges = {
  __typename?: 'AuthorConnectionEdges';
  cursor: Scalars['String'];
  node?: Maybe<Author>;
};

export type AuthorConnection = Connection & {
  __typename?: 'AuthorConnection';
  pageInfo: PageInfo;
  totalCount: Scalars['Float'];
  edges?: Maybe<Array<Maybe<AuthorConnectionEdges>>>;
};

export type BlockPageBlocksHero = {
  __typename?: 'BlockPageBlocksHero';
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type BlockPageBlocksBlockQuoteAuthor = Author;

export type BlockPageBlocksBlockQuote = {
  __typename?: 'BlockPageBlocksBlockQuote';
  message?: Maybe<Scalars['JSON']>;
  author?: Maybe<BlockPageBlocksBlockQuoteAuthor>;
};

export type BlockPageBlocksFeaturedPostsBlogsItem = Post;

export type BlockPageBlocksFeaturedPostsBlogs = {
  __typename?: 'BlockPageBlocksFeaturedPostsBlogs';
  item?: Maybe<BlockPageBlocksFeaturedPostsBlogsItem>;
};

export type BlockPageBlocksFeaturedPosts = {
  __typename?: 'BlockPageBlocksFeaturedPosts';
  header?: Maybe<Scalars['String']>;
  blogs?: Maybe<Array<Maybe<BlockPageBlocksFeaturedPostsBlogs>>>;
};

export type BlockPageBlocksFeatureListItems = {
  __typename?: 'BlockPageBlocksFeatureListItems';
  title?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
};

export type BlockPageBlocksFeatureList = {
  __typename?: 'BlockPageBlocksFeatureList';
  title?: Maybe<Scalars['String']>;
  items?: Maybe<Array<Maybe<BlockPageBlocksFeatureListItems>>>;
};

export type BlockPageBlocksSlideshowItems = {
  __typename?: 'BlockPageBlocksSlideshowItems';
  title?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
};

export type BlockPageBlocksSlideshow = {
  __typename?: 'BlockPageBlocksSlideshow';
  title?: Maybe<Scalars['String']>;
  items?: Maybe<Array<Maybe<BlockPageBlocksSlideshowItems>>>;
};

export type BlockPageBlocks = BlockPageBlocksHero | BlockPageBlocksBlockQuote | BlockPageBlocksFeaturedPosts | BlockPageBlocksFeatureList | BlockPageBlocksSlideshow;

export type BlockPage = Node & Document & {
  __typename?: 'BlockPage';
  title?: Maybe<Scalars['String']>;
  blocks?: Maybe<Array<Maybe<BlockPageBlocks>>>;
  id: Scalars['ID'];
  _sys: SystemInfo;
  _values: Scalars['JSON'];
};

export type BlockPageConnectionEdges = {
  __typename?: 'BlockPageConnectionEdges';
  cursor: Scalars['String'];
  node?: Maybe<BlockPage>;
};

export type BlockPageConnection = Connection & {
  __typename?: 'BlockPageConnection';
  pageInfo: PageInfo;
  totalCount: Scalars['Float'];
  edges?: Maybe<Array<Maybe<BlockPageConnectionEdges>>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addPendingDocument: DocumentNode;
  updateDocument: DocumentNode;
  deleteDocument: DocumentNode;
  createDocument: DocumentNode;
  updatePost: Post;
  createPost: Post;
  updateAuthor: Author;
  createAuthor: Author;
  updateBlockPage: BlockPage;
  createBlockPage: BlockPage;
};


export type MutationAddPendingDocumentArgs = {
  collection: Scalars['String'];
  relativePath: Scalars['String'];
  template?: InputMaybe<Scalars['String']>;
};


export type MutationUpdateDocumentArgs = {
  collection?: InputMaybe<Scalars['String']>;
  relativePath: Scalars['String'];
  params: DocumentMutation;
};


export type MutationDeleteDocumentArgs = {
  collection?: InputMaybe<Scalars['String']>;
  relativePath: Scalars['String'];
};


export type MutationCreateDocumentArgs = {
  collection?: InputMaybe<Scalars['String']>;
  relativePath: Scalars['String'];
  params: DocumentMutation;
};


export type MutationUpdatePostArgs = {
  relativePath: Scalars['String'];
  params: PostMutation;
};


export type MutationCreatePostArgs = {
  relativePath: Scalars['String'];
  params: PostMutation;
};


export type MutationUpdateAuthorArgs = {
  relativePath: Scalars['String'];
  params: AuthorMutation;
};


export type MutationCreateAuthorArgs = {
  relativePath: Scalars['String'];
  params: AuthorMutation;
};


export type MutationUpdateBlockPageArgs = {
  relativePath: Scalars['String'];
  params: BlockPageMutation;
};


export type MutationCreateBlockPageArgs = {
  relativePath: Scalars['String'];
  params: BlockPageMutation;
};

export type DocumentMutation = {
  post?: InputMaybe<PostMutation>;
  author?: InputMaybe<AuthorMutation>;
  blockPage?: InputMaybe<BlockPageMutation>;
};

export type PostMutation = {
  title?: InputMaybe<Scalars['String']>;
  author?: InputMaybe<Scalars['String']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  categories?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  published?: InputMaybe<Scalars['String']>;
  featured?: InputMaybe<Scalars['Boolean']>;
  body?: InputMaybe<Scalars['JSON']>;
};

export type AuthorSocialMutation = {
  platform?: InputMaybe<Scalars['String']>;
  handle?: InputMaybe<Scalars['String']>;
};

export type AuthorMutation = {
  name?: InputMaybe<Scalars['String']>;
  social?: InputMaybe<Array<InputMaybe<AuthorSocialMutation>>>;
  bio?: InputMaybe<Scalars['JSON']>;
};

export type BlockPageBlocksHeroMutation = {
  title?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
};

export type BlockPageBlocksBlockQuoteMutation = {
  message?: InputMaybe<Scalars['JSON']>;
  author?: InputMaybe<Scalars['String']>;
};

export type BlockPageBlocksFeaturedPostsBlogsMutation = {
  item?: InputMaybe<Scalars['String']>;
};

export type BlockPageBlocksFeaturedPostsMutation = {
  header?: InputMaybe<Scalars['String']>;
  blogs?: InputMaybe<Array<InputMaybe<BlockPageBlocksFeaturedPostsBlogsMutation>>>;
};

export type BlockPageBlocksFeatureListItemsMutation = {
  title?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
};

export type BlockPageBlocksFeatureListMutation = {
  title?: InputMaybe<Scalars['String']>;
  items?: InputMaybe<Array<InputMaybe<BlockPageBlocksFeatureListItemsMutation>>>;
};

export type BlockPageBlocksSlideshowItemsMutation = {
  title?: InputMaybe<Scalars['String']>;
  url?: InputMaybe<Scalars['String']>;
};

export type BlockPageBlocksSlideshowMutation = {
  title?: InputMaybe<Scalars['String']>;
  items?: InputMaybe<Array<InputMaybe<BlockPageBlocksSlideshowItemsMutation>>>;
};

export type BlockPageBlocksMutation = {
  hero?: InputMaybe<BlockPageBlocksHeroMutation>;
  blockQuote?: InputMaybe<BlockPageBlocksBlockQuoteMutation>;
  featuredPosts?: InputMaybe<BlockPageBlocksFeaturedPostsMutation>;
  featureList?: InputMaybe<BlockPageBlocksFeatureListMutation>;
  slideshow?: InputMaybe<BlockPageBlocksSlideshowMutation>;
};

export type BlockPageMutation = {
  title?: InputMaybe<Scalars['String']>;
  blocks?: InputMaybe<Array<InputMaybe<BlockPageBlocksMutation>>>;
};

export type PostPartsFragment = { __typename?: 'Post', title?: string | null, tags?: Array<string | null> | null, categories?: Array<string | null> | null, published?: string | null, featured?: boolean | null, body?: any | null, author?: { __typename?: 'Author', id: string } | null };

export type AuthorPartsFragment = { __typename?: 'Author', name?: string | null, bio?: any | null, social?: Array<{ __typename: 'AuthorSocial', platform?: string | null, handle?: string | null } | null> | null };

export type BlockPagePartsFragment = { __typename?: 'BlockPage', title?: string | null, blocks?: Array<{ __typename: 'BlockPageBlocksHero', title?: string | null, description?: string | null } | { __typename: 'BlockPageBlocksBlockQuote', message?: any | null, author?: { __typename?: 'Author', id: string } | null } | { __typename: 'BlockPageBlocksFeaturedPosts', header?: string | null, blogs?: Array<{ __typename: 'BlockPageBlocksFeaturedPostsBlogs', item?: { __typename?: 'Post', id: string } | null } | null> | null } | { __typename: 'BlockPageBlocksFeatureList', title?: string | null, items?: Array<{ __typename: 'BlockPageBlocksFeatureListItems', title?: string | null, description?: string | null } | null> | null } | { __typename: 'BlockPageBlocksSlideshow', title?: string | null, items?: Array<{ __typename: 'BlockPageBlocksSlideshowItems', title?: string | null, url?: string | null } | null> | null } | null> | null };

export type PostQueryVariables = Exact<{
  relativePath: Scalars['String'];
}>;


export type PostQuery = { __typename?: 'Query', post: { __typename?: 'Post', id: string, title?: string | null, tags?: Array<string | null> | null, categories?: Array<string | null> | null, published?: string | null, featured?: boolean | null, body?: any | null, _sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string }, author?: { __typename?: 'Author', id: string } | null } };

export type PostConnectionQueryVariables = Exact<{
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  sort?: InputMaybe<Scalars['String']>;
}>;


export type PostConnectionQuery = { __typename?: 'Query', postConnection: { __typename?: 'PostConnection', totalCount: number, edges?: Array<{ __typename?: 'PostConnectionEdges', node?: { __typename?: 'Post', id: string, title?: string | null, tags?: Array<string | null> | null, categories?: Array<string | null> | null, published?: string | null, featured?: boolean | null, body?: any | null, _sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string }, author?: { __typename?: 'Author', id: string } | null } | null } | null> | null } };

export type AuthorQueryVariables = Exact<{
  relativePath: Scalars['String'];
}>;


export type AuthorQuery = { __typename?: 'Query', author: { __typename?: 'Author', id: string, name?: string | null, bio?: any | null, _sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string }, social?: Array<{ __typename: 'AuthorSocial', platform?: string | null, handle?: string | null } | null> | null } };

export type AuthorConnectionQueryVariables = Exact<{
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  sort?: InputMaybe<Scalars['String']>;
}>;


export type AuthorConnectionQuery = { __typename?: 'Query', authorConnection: { __typename?: 'AuthorConnection', totalCount: number, edges?: Array<{ __typename?: 'AuthorConnectionEdges', node?: { __typename?: 'Author', id: string, name?: string | null, bio?: any | null, _sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string }, social?: Array<{ __typename: 'AuthorSocial', platform?: string | null, handle?: string | null } | null> | null } | null } | null> | null } };

export type BlockPageQueryVariables = Exact<{
  relativePath: Scalars['String'];
}>;


export type BlockPageQuery = { __typename?: 'Query', blockPage: { __typename?: 'BlockPage', id: string, title?: string | null, _sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string }, blocks?: Array<{ __typename: 'BlockPageBlocksHero', title?: string | null, description?: string | null } | { __typename: 'BlockPageBlocksBlockQuote', message?: any | null, author?: { __typename?: 'Author', id: string } | null } | { __typename: 'BlockPageBlocksFeaturedPosts', header?: string | null, blogs?: Array<{ __typename: 'BlockPageBlocksFeaturedPostsBlogs', item?: { __typename?: 'Post', id: string } | null } | null> | null } | { __typename: 'BlockPageBlocksFeatureList', title?: string | null, items?: Array<{ __typename: 'BlockPageBlocksFeatureListItems', title?: string | null, description?: string | null } | null> | null } | { __typename: 'BlockPageBlocksSlideshow', title?: string | null, items?: Array<{ __typename: 'BlockPageBlocksSlideshowItems', title?: string | null, url?: string | null } | null> | null } | null> | null } };

export type BlockPageConnectionQueryVariables = Exact<{
  before?: InputMaybe<Scalars['String']>;
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Float']>;
  last?: InputMaybe<Scalars['Float']>;
  sort?: InputMaybe<Scalars['String']>;
}>;


export type BlockPageConnectionQuery = { __typename?: 'Query', blockPageConnection: { __typename?: 'BlockPageConnection', totalCount: number, edges?: Array<{ __typename?: 'BlockPageConnectionEdges', node?: { __typename?: 'BlockPage', id: string, title?: string | null, _sys: { __typename?: 'SystemInfo', filename: string, basename: string, breadcrumbs: Array<string>, path: string, relativePath: string, extension: string }, blocks?: Array<{ __typename: 'BlockPageBlocksHero', title?: string | null, description?: string | null } | { __typename: 'BlockPageBlocksBlockQuote', message?: any | null, author?: { __typename?: 'Author', id: string } | null } | { __typename: 'BlockPageBlocksFeaturedPosts', header?: string | null, blogs?: Array<{ __typename: 'BlockPageBlocksFeaturedPostsBlogs', item?: { __typename?: 'Post', id: string } | null } | null> | null } | { __typename: 'BlockPageBlocksFeatureList', title?: string | null, items?: Array<{ __typename: 'BlockPageBlocksFeatureListItems', title?: string | null, description?: string | null } | null> | null } | { __typename: 'BlockPageBlocksSlideshow', title?: string | null, items?: Array<{ __typename: 'BlockPageBlocksSlideshowItems', title?: string | null, url?: string | null } | null> | null } | null> | null } | null } | null> | null } };

export const PostPartsFragmentDoc = gql`
    fragment PostParts on Post {
  title
  author {
    ... on Document {
      id
    }
  }
  tags
  categories
  published
  featured
  body
}
    `;
export const AuthorPartsFragmentDoc = gql`
    fragment AuthorParts on Author {
  name
  social {
    __typename
    platform
    handle
  }
  bio
}
    `;
export const BlockPagePartsFragmentDoc = gql`
    fragment BlockPageParts on BlockPage {
  title
  blocks {
    __typename
    ... on BlockPageBlocksHero {
      title
      description
    }
    ... on BlockPageBlocksBlockQuote {
      message
      author {
        ... on Document {
          id
        }
      }
    }
    ... on BlockPageBlocksFeaturedPosts {
      header
      blogs {
        __typename
        item {
          ... on Document {
            id
          }
        }
      }
    }
    ... on BlockPageBlocksFeatureList {
      title
      items {
        __typename
        title
        description
      }
    }
    ... on BlockPageBlocksSlideshow {
      title
      items {
        __typename
        title
        url
      }
    }
  }
}
    `;
export const PostDocument = gql`
    query post($relativePath: String!) {
  post(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...PostParts
  }
}
    ${PostPartsFragmentDoc}`;
export const PostConnectionDocument = gql`
    query postConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String) {
  postConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
  ) {
    totalCount
    edges {
      node {
        ... on Document {
          _sys {
            filename
            basename
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...PostParts
      }
    }
  }
}
    ${PostPartsFragmentDoc}`;
export const AuthorDocument = gql`
    query author($relativePath: String!) {
  author(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...AuthorParts
  }
}
    ${AuthorPartsFragmentDoc}`;
export const AuthorConnectionDocument = gql`
    query authorConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String) {
  authorConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
  ) {
    totalCount
    edges {
      node {
        ... on Document {
          _sys {
            filename
            basename
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...AuthorParts
      }
    }
  }
}
    ${AuthorPartsFragmentDoc}`;
export const BlockPageDocument = gql`
    query blockPage($relativePath: String!) {
  blockPage(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...BlockPageParts
  }
}
    ${BlockPagePartsFragmentDoc}`;
export const BlockPageConnectionDocument = gql`
    query blockPageConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String) {
  blockPageConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
  ) {
    totalCount
    edges {
      node {
        ... on Document {
          _sys {
            filename
            basename
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...BlockPageParts
      }
    }
  }
}
    ${BlockPagePartsFragmentDoc}`;
export type Requester<C= {}> = <R, V>(doc: DocumentNode, vars?: V, options?: C) => Promise<R>
  export function getSdk<C>(requester: Requester<C>) {
    return {
      post(variables: PostQueryVariables, options?: C): Promise<{data: PostQuery, variables: PostQueryVariables, query: string}> {
        return requester<{data: PostQuery, variables: PostQueryVariables, query: string}, PostQueryVariables>(PostDocument, variables, options);
      },
    postConnection(variables?: PostConnectionQueryVariables, options?: C): Promise<{data: PostConnectionQuery, variables: PostConnectionQueryVariables, query: string}> {
        return requester<{data: PostConnectionQuery, variables: PostConnectionQueryVariables, query: string}, PostConnectionQueryVariables>(PostConnectionDocument, variables, options);
      },
    author(variables: AuthorQueryVariables, options?: C): Promise<{data: AuthorQuery, variables: AuthorQueryVariables, query: string}> {
        return requester<{data: AuthorQuery, variables: AuthorQueryVariables, query: string}, AuthorQueryVariables>(AuthorDocument, variables, options);
      },
    authorConnection(variables?: AuthorConnectionQueryVariables, options?: C): Promise<{data: AuthorConnectionQuery, variables: AuthorConnectionQueryVariables, query: string}> {
        return requester<{data: AuthorConnectionQuery, variables: AuthorConnectionQueryVariables, query: string}, AuthorConnectionQueryVariables>(AuthorConnectionDocument, variables, options);
      },
    blockPage(variables: BlockPageQueryVariables, options?: C): Promise<{data: BlockPageQuery, variables: BlockPageQueryVariables, query: string}> {
        return requester<{data: BlockPageQuery, variables: BlockPageQueryVariables, query: string}, BlockPageQueryVariables>(BlockPageDocument, variables, options);
      },
    blockPageConnection(variables?: BlockPageConnectionQueryVariables, options?: C): Promise<{data: BlockPageConnectionQuery, variables: BlockPageConnectionQueryVariables, query: string}> {
        return requester<{data: BlockPageConnectionQuery, variables: BlockPageConnectionQueryVariables, query: string}, BlockPageConnectionQueryVariables>(BlockPageConnectionDocument, variables, options);
      }
    };
  }
  export type Sdk = ReturnType<typeof getSdk>;

// TinaSDK generated code
import { createClient, TinaClient } from "tinacms/dist/client";

const generateRequester = (client: TinaClient) => {
  const requester: (
    doc: any,
    vars?: any,
    options?: any,
    client
  ) => Promise<any> = async (doc, vars, _options) => {
    let data = {};
    try {
      data = await client.request({
        query: doc,
        variables: vars,
      });
    } catch (e) {
      // swallow errors related to document creation
      console.warn("Warning: There was an error when fetching data");
      console.warn(e);
    }

    return { data: data?.data, query: doc, variables: vars || {} };
  };

  return requester;
};

/**
 * @experimental this class can be used but may change in the future
 **/
export const ExperimentalGetTinaClient = () =>
  getSdk(
    generateRequester(createClient({ url: "http://localhost:4001/graphql" }))
  );

export const queries = (client: TinaClient) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};

