import { viteBuild } from '@tinacms/app'

export const viteBuildCmd = async (ctx: any, next: () => void, _options) => {
  const rootPath = ctx.rootPath
  await viteBuild({ rootPath })
  next()
}
