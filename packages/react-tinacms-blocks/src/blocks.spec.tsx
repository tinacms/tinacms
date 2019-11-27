/**

Copyright 2019 Forestry.io Inc

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
import { render } from '@testing-library/react'
import { Blocks } from './blocks'

describe('Blocks', () => {
  describe('without data', () => {
    it('renders nothing into the containing element', () => {
      const renderedBlock = render(<Blocks name="" data={[]} templates={{}} />)

      expect(renderedBlock.container.children).toHaveLength(0)
    })
  })

  describe('with some data', () => {
    const text = 'Hello World'
    const data = [{ _template: 'heading', text }]

    describe('when there are no templates', () => {
      it('renders nothing into the containing element', () => {
        const renderedBlock = render(
          <Blocks name="" data={data} templates={{}} />
        )

        expect(renderedBlock.container.children).toHaveLength(0)
      })

      describe("if (process.env.NODE_ENV === 'development')", () => {
        afterEachResetProcessEnv()

        it('throws an error', () => {
          process.env.NODE_ENV = 'development'

          const rendering = () =>
            render(<Blocks name="" data={data} templates={{}} />)

          expect(rendering).toThrow()
        })
      })
    })

    describe('when there is a matching template', () => {
      const heading = {
        key: '',
        label: 'Heading',
        fields: [],
        Component() {
          return <h1>{text}</h1>
        },
      }
      describe('and it has Component defined', () => {
        it('renders that Component', () => {
          const renderedBlock = render(
            <Blocks name="" data={data} templates={{ heading }} />
          )

          const headingBlock = renderedBlock.queryByText(text)

          expect(headingBlock).not.toBeNull()
        })
      })
      describe('and it does not have a Component defined', () => {
        const headingWithoutComponent = { ...heading, Component: null }

        it('renders nothing into the containing element', () => {
          const renderedBlock = render(
            <Blocks
              name=""
              data={data}
              templates={{ heading: headingWithoutComponent }}
            />
          )

          expect(renderedBlock.container.children).toHaveLength(0)
        })

        describe("if (process.env.NODE_ENV === 'development')", () => {
          afterEachResetProcessEnv()

          it('throws an error', () => {
            process.env.NODE_ENV = 'development'

            const rendering = () =>
              render(
                <Blocks
                  name=""
                  data={data}
                  templates={{ heading: headingWithoutComponent }}
                />
              )

            expect(rendering).toThrow()
          })
        })
      })
    })
  })
})

function afterEachResetProcessEnv() {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules() // this is important
    process.env = { ...OLD_ENV }
    delete process.env.NODE_ENV
  })

  afterEach(() => {
    process.env = OLD_ENV
  })
}
