<Test
  leftColumn={<>
    foo bar baz left
  </>}
  rightColumn={<>
    foo bar baz right

    <Highlight
    content={<>
    Foo bar baz
    </>}
    />
  </>}
/>

<Test
  leftColumn={
    <>
    foo bar baz left
  </>}
  rightColumn={
    <>
    foo bar baz right

    <Highlight
      content={
        <>
          Foo bar baz
        </>
      }
    />
  </>}
/>
