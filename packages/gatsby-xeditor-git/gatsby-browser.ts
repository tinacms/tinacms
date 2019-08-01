import { cms } from '@forestryio/gatsby-plugin-xeditor-cms'

cms.registerApi('git', {
  onChange(data: any) {
    writeToDisk(data)
  },
})

function writeToDisk(data: any) {
  // @ts-ignore
  return fetch('http://localhost:4567/markdownRemark', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(data),
  })
    .then(response => {
      console.log(response.json())
    })
    .catch(e => {
      console.error(e)
    })
}
