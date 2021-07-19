/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react'
import Markdown from 'react-markdown'
import Image from 'next/image'
import type { MarketingPages } from '../.tina/__generated__/types'

export const LandingPage = (props: MarketingPages) => {
  return (
    <>
      {props.blocks
        ? props.blocks.map(function (block, i) {
            switch (block.__typename) {
              case 'MarketingPagesBlocksMessage':
                return (
                  <React.Fragment key={`block-${block.messageHeader}`}>
                    <h3>{block.messageHeader}</h3>
                    <Markdown>{block.messageBody}</Markdown>
                    {block?.seo?.map((seoItem) => {
                      return <h2>{seoItem.seoTitle}</h2>
                    })}
                    {block?.nestedPage?.map((nestedItem) => {
                      switch (nestedItem.__typename) {
                        case 'MarketingPagesBlocksMessageNestedPageHero':
                          return <h4>{nestedItem.herotitle}</h4>
                        default:
                          throw new Error(
                            `You probably forgot __typename ${nestedItem.__typename}`
                          )
                      }
                    })}
                  </React.Fragment>
                )
              case 'MarketingPagesBlocksImage':
                return (
                  <React.Fragment key={`diagram-${i}`}>
                    <h3>{block.heading}</h3>
                    <Markdown>{block.imgDescription}</Markdown>
                    <Image
                      loading="lazy"
                      src={block.src || '/asdf'}
                      title={block.heading}
                      layout="responsive"
                      width="1070x"
                      height="1220px"
                    />
                  </React.Fragment>
                )
              default:
                return null
            }
          })
        : null}
    </>
  )
}
