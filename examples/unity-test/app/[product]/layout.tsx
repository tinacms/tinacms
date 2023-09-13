export default function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="h-screen w-24 bg-red-100"></div>
      {children}
    </>
  )
}
