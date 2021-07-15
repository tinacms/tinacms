/**
Copyright 2021 Forestry.io Holdings, Inc.
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

const path = require('path')

require('dotenv').config()

module.exports = {
  env: {
    SITE_CLIENT_ID: process.env.SITE_CLIENT_ID,
    REALM_NAME: process.env.REALM_NAME,
    DEPLOYED_URL: process.env.DEPLOYED_URL,
    GIT_REPO_SLUG: process.env.VERCEL_GIT_REPO_SLUG,
    GIT_REPO_OWNER: process.env.VERCEL_GIT_REPO_OWNER,
    GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: true,
  webpack: (config) => {
    /**
     * Enable these when you want to work with Tina locally
     */
    // config.resolve.alias["@tinacms"] = path.resolve(
    //   "../../../tinacms/packages/@tinacms"
    // );
    config.resolve.alias['tinacms'] = require.resolve('tinacms')
    config.resolve.alias['react-dom'] = require.resolve('react-dom')
    config.resolve.alias['react'] = require.resolve('react')
    config.optimization.minimize = false

    return config
  },
}
