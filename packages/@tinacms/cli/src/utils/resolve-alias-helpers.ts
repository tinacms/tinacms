import { loadProjectConfig } from '../next/vite'

export async function loadViteConfig(rootPath: string) {
  try {
    return await loadProjectConfig({
      rootPath,
      viteConfigEnv: {
        command: 'build',
        mode: 'production',
      },
    })
  } catch (error) {
    console.error('Failed to load Vite config:', error.message)
    throw new Error('Error loading Vite configuration')
  }
}
