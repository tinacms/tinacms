import type { PageBlocks } from '../../.tina/__generated__/types'
import {
  FeaturesBlock,
  FlyingBlock,
  HeroBlock,
  PricingBlock,
  FaqBlock,
  ContentBlock,
} from './'
import { ColumnsBlock } from './Columns'
import { ShowcaseItemsBlock } from './Showcase'

export const Blocks = ({ blocks }: { blocks: PageBlocks[] }) => {
  if (!blocks) return null
  return blocks.map((block, index) => {
    switch (block.__typename) {
      case 'PageBlocksFeatures':
        return <FeaturesBlock data={block} index={index} />
      case 'PageBlocksFlying':
        return <FlyingBlock data={block} index={index} />
      case 'PageBlocksHero':
        return <HeroBlock data={block} index={index} />
      case 'PageBlocksPricing':
        return <PricingBlock data={block} index={index} />
      case 'PageBlocksFaq':
        return <FaqBlock data={block} index={index} />
      case 'PageBlocksContent':
        return <ContentBlock data={block} index={index} />
      case 'PageBlocksColumns':
        return <ColumnsBlock data={block} index={index} />
      case 'PageBlocksShowcase':
        return <ShowcaseItemsBlock data={block} index={index} />
      default:
        return null
    }
  })
}
