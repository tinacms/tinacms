export default function ProductLayout({
  params,
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="h-screen w-96 bg-blue-200">Product TOC</div>
      {children}
    </>
  )
}
