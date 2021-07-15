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

// export const Blocks = ({ data, blocks, placeholder = null }) => {
//   if (data.length < 1) return placeholder;
//   return data
//     ? data.map(function (block, i) {
//         const BlockComponent = blocks[block._template]
//           ? blocks[block._template]
//           : null;
//         return <BlockComponent {...block} />;
//       })
//     : null;
// };

import { Homepage_Blocks_Data } from '../.tina/__generated__/types'
import { Features } from './features'
import { Hero } from './hero'
import { Testimonial } from './testimonial'

export const Blocks: React.FC<{
  blocksData: Homepage_Blocks_Data[]
  placeholder: JSX.Element
}> = ({ blocksData, placeholder }) => {
  if (!blocksData || blocksData.length < 1) return placeholder
  return (
    <>
      {blocksData.map((block, i) => {
        switch (block.__typename) {
          case 'Features_Data':
            return <Features key={i} {...block} />
          case 'Hero_Data':
            return <Hero key={i} {...block} />
          case 'Testimonial_Data':
            return <Testimonial key={i} {...block} />
        }
      })}
    </>
  )
}
