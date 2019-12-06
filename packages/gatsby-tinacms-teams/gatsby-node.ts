/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import * as express from 'express'
import cookieParser from 'cookie-parser'
import { router as teamsRouter } from '@tinacms/teams'

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
})

exports.onCreateDevServer = ({ app }: any) => {
  app.use(cookieParser())
  app.use(express.json())

  if (process.env.REQUIRE_AUTH) {
    app.use(teamsRouter())
  }
}
