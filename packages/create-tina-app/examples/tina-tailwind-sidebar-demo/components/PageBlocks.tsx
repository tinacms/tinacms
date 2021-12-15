import { PageBlocks } from '../.tina/__generated__/types'
import { Features } from './features'
import { Hero } from './hero'
import { Testimonial } from './testimonial'

export const Blocks: React.FC<{
  blocksData: PageBlocks[]
  placeholder: JSX.Element
}> = ({ blocksData, placeholder }) => {
  if (!blocksData || blocksData.length < 1) return placeholder
  return (
    <>
      {blocksData.map((block, i) => {
        switch (block.__typename) {
          case 'PageBlocksFeatures':
            return <Features key={i} {...block} />
          case 'PageBlocksHero':
            return <Hero key={i} {...block} />
          case 'PageBlocksTestimonial':
            return <Testimonial key={i} {...block} />
        }
      })}
    </>
  )
}
