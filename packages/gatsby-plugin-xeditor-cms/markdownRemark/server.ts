import * as express from 'express'
import * as cors from 'cors'
import * as fs from 'fs'
import * as yaml from 'js-yaml'

export function markdownRemarkServer() {
  let app = express()

  app.use(
    cors({
      origin: function(origin, callback) {
        // TODO: Only accept from localhost.
        callback(null, true)
      },
    })
  )
  app.use(express.json())

  app.put('/markdownRemark', (req, res) => {
    let contents =
      '---\n' + yaml.dump(req.body.frontmatter) + '---\n' + req.body.html
    res.send(contents)
    fs.writeFileSync(req.body.fileAbsolutePath, contents)
  })

  app.listen(4567, () => {
    console.log('------------------------------------------')
    console.log('xeditor local backend running on port 4567')
    console.log('------------------------------------------')
  })
}

/**

/git/push
/git/pull

*/
