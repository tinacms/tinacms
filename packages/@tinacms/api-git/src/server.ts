const express = require('express')

import { router, GitRouterConfig } from "./router"

export class GitApiServer {
    server: any
    constructor(config: GitRouterConfig) {
        this.server = express()
        this.server.use('/___tina', router(config))
    }

    start(port: number) {
        this.server.listen(port)
        console.log(`TinaCMS git API server running on localhost:${port}`)
    }
}