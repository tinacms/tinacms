import path from 'path'
import fs from 'fs'
import git from 'isomorphic-git'
import http from 'isomorphic-git/http/node'
import level, { LevelDB } from 'level'
import type { PromiseFsClient } from 'isomorphic-git'

// const dir = path.join(process.cwd(), 'test-checkout')
const dir = '/Users/jeffsee/code/tinacms'
const gitdir = '/Users/jeffsee/code/tinacms/.git'
let ref = 'HEAD'

async function map(type, mode, oid, content, stat) {
  console.log(await type())
  // if (content.contains('foo')) {
  //   return {
  //     filepath,
  //     content
  //   }
  // }
}

const uint8array = new TextEncoder().encode('¢')
const string = new TextDecoder('utf-8').decode(uint8array)

const db = level(path.join(process.cwd(), 'gitdb'))
export const run = async () => {
  await db.clear()
  await git.clone({
    fs,
    http,
    url: 'git:///Users/jeffsee/code/tina-cloud',
    dir,
    singleBranch: true,
    depth: 1,
  })
  // await git.walk({
  //   fs,
  //   dir: gitdir,
  //   trees: [git.WORKDIR()],
  //   map: async (filepath, [workdir]) => {
  //     if ((await workdir.type()) === 'blob') {
  //       const { blob } = await git.readBlob({
  //         fs,
  //         gitdir,
  //         oid: await workdir.oid(),
  //       })
  //       console.log(Buffer.from(blob).toString('utf8'))
  //     }
  //   },
  // })
  // await git
  //   .checkout({
  //     fs: fsClient,
  //     // fs,
  //     gitdir,
  //     ref: 'main',
  //     filepaths: ['packages/@tinacms/graphql/src/primitives/spec/page-builder'],
  //     force: true,
  //     noUpdateHead: true,
  //     dir,
  //   })
  //   .then(console.log)
}

const readFileSync = async (filepath, opts) => {
  return fs.readFileSync(filepath, opts)
  // if (filepath.includes('.git')) {
  //   return fs.readFileSync(filepath, opts)
  // }

  // const meh = await db.get(filepath)
  // console.log('readit', filepath, meh)
  // return meh
}
const readdirSync = async (filepath, opts) => {
  // console.log('readdir', filepath)
  return fs.readdirSync(filepath, opts)
}
const writeFileSync = async (filepath, data, opts) => {
  // if (filepath.includes('.git')) {
  // }
  console.log('writeFile', filepath)
  // await db.put(filepath, data)
  return fs.writeFileSync(filepath, data, opts)
}

const fsClient: PromiseFsClient = {
  promises: {
    lstat: fs.lstatSync,
    mkdir: fs.mkdirSync,
    readFile: readFileSync,
    readdir: readdirSync,
    rmdir: fs.rmdirSync,
    stat: fs.statSync,
    unlink: fs.unlinkSync,
    writeFile: writeFileSync,
    chmod: fs.chmodSync,
    readlink: fs.readlinkSync,
    symlink: fs.symlinkSync,
  },
}
