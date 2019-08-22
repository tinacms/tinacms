import * as express from 'express'
import * as cors from 'cors'

export const createExpressApp = () => {
  let app = express()

  app.use(
    cors({
      origin: function(origin, callback) {
        // TODO: Only accept from localhost.
        callback(null, true)
      },
    })
  )

  return app
}
