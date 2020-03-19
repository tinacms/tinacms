export interface ImageProps {
  upload?: () => Promise<string>[]
  previewUrl?: (url: string) => string
}
