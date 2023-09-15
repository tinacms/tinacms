export default async function Page(props) {
  return (
    <>
      <div className="h-screen w-96 bg-blue-200">
        pixyz {props.params.product} TOC
      </div>
      <div className="w-full h-full bg-yellow-100">
        <div className="h-12 bg-orange-100 w-full"></div>
        {'pixyz/products/[product]/page.tsx'}
        <br /> {JSON.stringify(props.params)}
      </div>
    </>
  )
}
