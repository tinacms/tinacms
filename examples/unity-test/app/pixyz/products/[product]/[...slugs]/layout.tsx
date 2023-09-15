export default async function Page(props) {
  return (
    <>
      <div className="h-screen w-96 bg-blue-200">
        pixyz {props.params.product} TOC
      </div>
      {props.children}
    </>
  )
}
