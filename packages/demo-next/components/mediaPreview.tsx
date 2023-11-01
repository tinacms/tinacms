import { Media } from '@einsteinindustries/tinacms'

export default function MediaPreview(media: Media) {
  return (
    <>
      <img src={media.previewSrc} alt={'clicked image'}></img>
      <p>{media.previewSrc}</p>
    </>
  )
}
