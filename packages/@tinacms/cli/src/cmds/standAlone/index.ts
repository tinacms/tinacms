import { viteBuild } from '@tinacms/app'

// Build the app using vite
export const viteBuildCmd = async (ctx: any, next: () => void, _options) => {
  const rootPath = ctx.rootPath
  await viteBuild({ rootPath })
  next()
}
