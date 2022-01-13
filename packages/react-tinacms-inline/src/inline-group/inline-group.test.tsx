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

import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { InlineGroup } from '.'
import { InlineForm, InlineText } from '../'
import { withTina, useForm } from '@einsteinindustries/tinacms'

describe('Inline Group', () => {
  const Wrapper = withTina(
    ({ children }: { children: React.ReactElement }) => {
      const [, form] = useForm({
        id: 'test-inline-group',
        label: 'inline group',
        initialValues: {
          parent: {
            child: {
              child_text: 'inline group text test',
            },
          },
        },
        onSubmit: () => {},
      })

      return <InlineForm form={form}>{children}</InlineForm>
    },
    {
      enabled: true,
      toolbar: {
        buttons: {
          save: 'inline-group-test-save',
          reset: 'reset',
        },
      },
    }
  )

  it('renders children', () => {
    render(
      <Wrapper>
        <InlineGroup name="something">
          <div data-testid="something">something</div>
        </InlineGroup>
      </Wrapper>
    )

    const child = screen.getByTestId('something')

    expect(child).not.toBeNull()
  })

  it('nested field names are relative to their parent', () => {
    const { container } = render(
      <Wrapper>
        <InlineGroup name="parent">
          <InlineGroup name="child">
            <InlineText name="child_text" />
          </InlineGroup>
        </InlineGroup>
      </Wrapper>
    )

    const input = container.querySelector(
      'input[name="parent.child.child_text"]'
    )

    expect(input).not.toBeNull()
  })
})
