const express = require('express')
const cors = require('cors')
const fs = require('fs')
const yaml = require('js-yaml')

let app

exports.onPreBootstrap = () => {
  app = express()
  app.use(
    cors({
      origin: function(origin, callback) {
        callback(null, true)
      },
    })
  )
  app.use(express.json())
  app.get('/', (req, res) => {
    res.json({ status: 'ok' })
  })

  app.put('/markdownRemark', (req, res) => {
    let contents =
      '---\n' + yaml.dump(req.body.frontmatter) + '---\n' + req.body.html
    res.send(contents)
    fs.writeFileSync(req.body.fileAbsolutePath, contents)
  })

  app.listen(4567, () =>
    console.log('xeditor local backend running on port 4567')
  )
}

/**

/git/push
/git/pull

*/
