# GitLab Connector for Tina CMS

Supports GitLab v4 api

## Usage

```
import { GitlabConnector } from "@tinacms/cms-connector-gitlab"

let gitlab = new GitlabConnector({
  apiBaseURI: "https://gitlab.com/",
  appID: "APP_ID",
  redirectURI: "http://localhost:8000/?auth-gitlab",
  repositoryID: "USER/REPO",
})

// bootstrap the connector (listen for oauth callback):
gitlab.bootstrap()

// retrieve an auth token
gitlab.login()

// create a commit
gitlab.save(path, contents)
```

## Setup

1. Create GitLab app
   a. Redirect URI should end with the querystring `?auth-gitlab`
2. Initialize GitLab connector with your APP ID and Redirect URI
3. Call the connector's `bootstrap()` method somewhere that will always execute (this listens for the oauth callback)

## Known Issues

Due to CORS, you will need to disable your browser's sameorigin policy in order for this to work on `localhost`
