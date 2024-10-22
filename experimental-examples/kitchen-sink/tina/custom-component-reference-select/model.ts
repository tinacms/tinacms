// You should define the types for the fields in the author collection for typesafety
export type AuthorProps = {
  name: string
  description: string
  _collection: 'author'
}

// You should define the types for the fields in the post collection for typesafety
export type PostProps = {
  title: string
  excerpt: string
  _collection: 'post'
}

// You should define the list of collection used in the reference for typesafety
export enum COLLECTIONS {
  AUTHOR = 'author',
  POST = 'post',
}

// InternalSys is from tinacms where it gives a lot of useful information for user to customize their custom component
export interface InternalSys {
  filename: string
  path: string
}

export type CollectionProps = AuthorProps | PostProps
