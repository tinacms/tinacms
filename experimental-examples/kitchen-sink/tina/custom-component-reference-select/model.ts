// You should define the types for the fields in the author collection for typesafety
interface AuthorProps {
  name: string
  description: string
  _collection: 'author'
}

// You should define the types for the fields in the post collection for typesafety
interface PostProps {
  title: string
  excerpt: string
  _collection: 'post'
}

// You should define the list of collection used in the reference for typesafety
export enum COLLECTIONS {
  AUTHOR = 'author',
  POST = 'post',
}

export type CollectionProps = AuthorProps | PostProps
