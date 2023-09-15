export default async function SidebarLayout({ params, children }) {
  return (
    <>
      <div className="h-screen w-96 bg-blue-100">
        {/* <Link href={}>Go back </Link> */}
        Manual TOC
      </div>
      {children}
    </>
  )
}
