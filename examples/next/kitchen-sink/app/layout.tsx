import '../styles/global.css';
import { Inter } from 'next/font/google';
import Layout from '@/components/layout/layout';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'Tina Kitchen Sink',
  description: 'Comprehensive showcase of Tina CMS features',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning className={inter.variable}>
      <body className='font-sans antialiased' suppressHydrationWarning>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
