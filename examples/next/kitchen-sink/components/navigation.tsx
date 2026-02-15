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
    <nav className="w-64 bg-white border-r border-gray-200 p-6 min-h-screen">
      <div className="space-y-2">
        {items.map((item) => {
          const isDisabled = item.href === '#';
          return (
            <div key={item.label}>
              {isDisabled ? (
                <div className="text-sm font-semibold text-gray-900 mt-4 mb-2">
                  {item.label}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
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
