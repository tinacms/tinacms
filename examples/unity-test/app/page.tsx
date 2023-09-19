import { redirect } from 'next/navigation'

export default async function Home() {
  // Should be handled by middleware or at least check for locale header to decide where to redirect
  return redirect('/en')
}
