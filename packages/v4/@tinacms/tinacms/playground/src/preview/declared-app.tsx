import { BlogIndex } from './blog-index';
import { PostPage } from './post-page';
import { useLocationSearch } from './router-link';

export function DeclaredApp() {
  const params = new URLSearchParams(useLocationSearch());
  const post = params.get('post');
  if (params.get('view') === 'blog' || !post) return <BlogIndex />;
  return <PostPage path={post} />;
}
