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
import { MediaPaginatorPlugin } from '@einsteinindustries/tinacms'

const CustomPaginatorComponent = ({ list, setOffset }) => {
  const numPerPage = list.limit
  const currentPage = Math.floor(list.offset / numPerPage)
  const numPages = Math.ceil(list.totalCount / numPerPage)

  return (
    <ol className="paginator">
      {[...Array(numPages)].map((_, index) => {
        return (
          <li key={index} className={index == currentPage ? 'current' : ''}>
            <button onClick={() => setOffset(numPerPage * index)}>
              {index + 1}
            </button>
          </li>
        )
      })}
    </ol>
  )
}

export const CustomPaginatorPlugin: MediaPaginatorPlugin = {
  __type: 'media:ui',
  name: 'paginator',
  Component: CustomPaginatorComponent,
}
