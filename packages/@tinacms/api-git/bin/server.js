#!/usr/bin/env node

const port = parseInt(process.argv[2])
const pkg = require("../build/index.js")

const server = new pkg.GitApiServer({})
server.start(port ? port : 4567)