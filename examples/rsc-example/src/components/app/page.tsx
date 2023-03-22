export const Page = (props: any) => {
  return (
    <pre>
      <code>{JSON.stringify(props, null, 2)}</code>
    </pre>
  )
}
