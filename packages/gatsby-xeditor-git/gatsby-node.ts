import * as express from 'express'
import * as cors from 'cors'
import * as fs from 'fs'
import * as yaml from 'js-yaml'

exports.onPreBootstrap = () => {
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
    fs.writeFileSync(req.body.fileAbsolutePath, req.body.content)
    res.send(req.body.content)
  })

  app.listen(4567, () => {
    console.log('------------------------------------------')
    console.log('xeditor local backend running on port 4567')
    console.log('------------------------------------------')
  })
}
