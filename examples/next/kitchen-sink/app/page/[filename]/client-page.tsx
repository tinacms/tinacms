'use client'

type TinaProps = {
  query: string
  variables: Record<string, any>
  data: any
}

export default function PageClientComponent(props: TinaProps) {
  return (
    <main className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(props, null, 2)}
        </pre>
      </div>
    </main>
  )
}
