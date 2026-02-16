import Link from 'next/link';
import fs from 'fs';
import path from 'path';

interface NavItem {
  label: string;
  href: string;
}

async function getNavItems(): Promise<NavItem[]> {
  const items: NavItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Admin CMS', href: '/admin/index.html' },
  ];

  // Add pages
  try {
    const pagesDir = path.join(process.cwd(), 'content', 'pages');
    if (fs.existsSync(pagesDir)) {
      const pages = fs
        .readdirSync(pagesDir)
        .filter((f) => /\.md(x)?$/.test(f))
        .filter((f) => f !== 'home.md');
      if (pages.length > 0) {
        items.push({ label: 'Pages', href: '#' });
        pages.forEach((page) => {
          const name = path.parse(page).name;
          items.push({ label: `  • ${name}`, href: `/page/${name}` });
        });
      }
    }
  } catch (err) {
    console.error('Error reading pages', err);
  }

  // Add posts
  try {
    const postsDir = path.join(process.cwd(), 'content', 'post');
    if (fs.existsSync(postsDir)) {
      const posts = fs
        .readdirSync(postsDir)
        .filter((f) => /\.mdx?$/.test(f));
      if (posts.length > 0) {
        items.push({ label: 'Posts', href: '#' });
        posts.forEach((post) => {
          const name = path.parse(post).name;
          items.push({ label: `  • ${name}`, href: `/post/${name}` });
        });
      }
    }
  } catch (err) {
    console.error('Error reading posts', err);
  }

  // Add SSG posts
  try {
    const ssgDir = path.join(process.cwd(), 'content', 'ssg-posts');
    if (fs.existsSync(ssgDir)) {
      const posts = fs
        .readdirSync(ssgDir)
        .filter((f) => /\.md(x)?$/.test(f));
      if (posts.length > 0) {
        items.push({ label: 'SSG Posts', href: '#' });
        posts.forEach((post) => {
          const name = path.parse(post).name;
          items.push({
            label: `  • ${name}`,
            href: `/ssg-posts/${name}`,
          });
        });
      }
    }
  } catch (err) {
    console.error('Error reading ssg-posts', err);
  }

  // Add documentation
  try {
    const docsDir = path.join(process.cwd(), 'content', 'documentation');
    if (fs.existsSync(docsDir)) {
      const docs = fs
        .readdirSync(docsDir)
        .filter((f) => /\.md(x)?$/.test(f));
      if (docs.length > 0) {
        items.push({ label: 'Documentation', href: '#' });
        docs.forEach((doc) => {
          const name = path.parse(doc).name;
          items.push({
            label: `  • ${name}`,
            href: `/documentation/${name}`,
          });
        });
      }
    }
  } catch (err) {
    console.error('Error reading documentation', err);
  }

  // Add authors
  try {
    const authorsDir = path.join(process.cwd(), 'content', 'authors');
    if (fs.existsSync(authorsDir)) {
      const authors = fs
        .readdirSync(authorsDir)
        .filter((f) => /\.md(x)?$/.test(f));
      if (authors.length > 0) {
        items.push({ label: 'Authors', href: '#' });
        authors.forEach((author) => {
          const name = path.parse(author).name;
          items.push({
            label: `  • ${name}`,
            href: `/authors/${name}`,
          });
        });
      }
    }
  } catch (err) {
    console.error('Error reading authors', err);
  }

  return items;
}

export default async function Navigation() {
  const items = await getNavItems();

  return (
    <nav className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 min-h-screen overflow-y-auto sticky top-0">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Navigation</h2>
        <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-orange-500"></div>
      </div>
      <div className="space-y-1">
        {items.map((item) => {
          const isDisabled = item.href === '#';
          return (
            <div key={item.label}>
              {isDisabled ? (
                <div className="text-xs font-bold text-gray-600 dark:text-gray-400 mt-6 mb-3 uppercase tracking-wide">
                  {item.label}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className="block px-4 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 border-l-2 border-transparent hover:border-blue-500"
                >
                  {item.label}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
