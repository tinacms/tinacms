import '../styles/global.css'
import Navigation from '../components/navigation'
import { Theme } from '../components/layout'

export const metadata = {
  title: 'Tina Kitchen Sink',
  description: 'Comprehensive showcase of Tina CMS features',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const themeData = {
    color: 'blue',
    darkMode: 'system',
    font: 'sans',
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors">
        <Theme data={themeData}>
          <div className='min-h-screen'>
            <div className='flex'>
              <Navigation />
              <main className='flex-1'>
                {children}
              </main>
            </div>
          </div>
        </Theme>
      </body>
    </html>
  )
}
