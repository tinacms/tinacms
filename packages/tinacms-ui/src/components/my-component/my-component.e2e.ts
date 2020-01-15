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
import { newE2EPage } from '@stencil/core/testing'

describe('my-component', () => {
  it('renders', async () => {
    const page = await newE2EPage()

    await page.setContent('<my-component></my-component>')
    const element = await page.find('my-component')
    expect(element).toHaveClass('hydrated')
  })

  it('renders changes to the name data', async () => {
    const page = await newE2EPage()

    await page.setContent('<my-component></my-component>')
    const component = await page.find('my-component')
    const element = await page.find('my-component >>> div')
    expect(element.textContent).toEqual(`Hello, World! I'm `)

    component.setProperty('first', 'James')
    await page.waitForChanges()
    expect(element.textContent).toEqual(`Hello, World! I'm James`)

    component.setProperty('last', 'Quincy')
    await page.waitForChanges()
    expect(element.textContent).toEqual(`Hello, World! I'm James Quincy`)

    component.setProperty('middle', 'Earl')
    await page.waitForChanges()
    expect(element.textContent).toEqual(`Hello, World! I'm James Earl Quincy`)
  })
})
