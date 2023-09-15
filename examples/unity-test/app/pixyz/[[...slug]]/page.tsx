export default async function Page(props) {
  return (
    <>
      <div className="h-screen w-96 bg-blue-300">pixyz family TOC</div>
      <div className="w-full h-full bg-yellow-100">
        <div className="h-12 bg-orange-100 w-full"></div>
        {'pixyz-[[...slug]]'}
        <br /> {JSON.stringify(props.params)}
      </div>
    </>
  )
}
