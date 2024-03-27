import { FrameworkType } from './generated-files'
export type Project = {
  starter:
    | 'next-ts'
    | 'next-ts-app'
    | 'next-ts-src'
    | 'next-js'
    | 'next-js-app'
    | 'next-js-src'
    | 'hugo-starter'
    | 'jekyll-starter'
  typescript: boolean
  framework: FrameworkType
  nextjsOptions?: {
    appDir?: boolean
    srcDir?: boolean
  }
}

export const Projects: Record<string, Project> = {
  'next-ts': {
    starter: 'next-ts',
    typescript: true,
    framework: 'Next.js',
  },
  'next-js': {
    starter: 'next-js',
    typescript: false,
    framework: 'Next.js',
  },
  'next-ts-app': {
    starter: 'next-ts-app',
    typescript: true,
    framework: 'Next.js',
    nextjsOptions: {
      appDir: true,
      srcDir: false,
    },
  },
  'next-js-app': {
    starter: 'next-js-app',
    typescript: false,
    framework: 'Next.js',
    nextjsOptions: {
      appDir: true,
      srcDir: false,
    },
  },
  'next-ts-src': {
    starter: 'next-ts-src',
    typescript: true,
    framework: 'Next.js',
    nextjsOptions: {
      appDir: false,
      srcDir: true,
    },
  },
  'next-js-src': {
    starter: 'next-js-src',
    typescript: false,
    framework: 'Next.js',
    nextjsOptions: {
      appDir: false,
      srcDir: true,
    },
  },
  'hugo-ts': {
    starter: 'hugo-starter',
    typescript: true,
    framework: 'Hugo',
  },
  'hugo-js': {
    starter: 'hugo-starter',
    typescript: false,
    framework: 'Hugo',
  },
  'jekyll-ts': {
    starter: 'jekyll-starter',
    typescript: true,
    framework: 'Jekyll',
  },
  'jekyll-js': {
    starter: 'jekyll-starter',
    typescript: false,
    framework: 'Jekyll',
  },
}
