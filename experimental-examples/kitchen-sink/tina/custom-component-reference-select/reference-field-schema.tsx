const referenceField = {
  label: 'Author',
  name: 'author',
  type: 'reference',
  ui: {
    selectComponent: (props) => (
      <>
        <div>test</div>
      </>
    ),
  },
  collections: ['author', 'post'],
}

export default referenceField
