import { redirect } from 'next/navigation'

export default async function Home() {
  // should always redirect to latest
  return redirect('/en/manual/v1.0.0')
}
