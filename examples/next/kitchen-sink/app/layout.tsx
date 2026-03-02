import '../styles/global.css'
import { Inter, Lato, Nunito } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
})

const lato = Lato({
  subsets: ['latin'],
  variable: '--font-lato',
  weight: '400',
})

export const metadata = {
  title: 'Tina Kitchen Sink',
  description: 'Comprehensive showcase of Tina CMS features',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${nunito.variable} ${lato.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
