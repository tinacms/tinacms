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

import Link from 'next/link'
import { useCMS } from '@einsteinindustries/tinacms'

export default function Header(props) {
  const cms = useCMS()
  return (
    <header className="header">
      <nav className="nav" role="navigation" aria-label="main navigation">
        <Link href="/">
          <h1>Home</h1>
        </Link>
        <section>
          <Link href="/info">
            <h1>Info</h1>
          </Link>
          <Link href="/blocks">
            <h1>Blocks</h1>
          </Link>
          <Link href="/nesting">
            <h1>Nesting</h1>
          </Link>
        </section>
      </nav>
      <style jsx>
        {`
          h1 {
            margin-bottom: 0;
          }
          h1:hover {
            cursor: pointer;
          }
          nav {
            padding: 1.5rem 1.25rem;
            border-bottom: 1px solid #ebebeb;
            display: flex;
            justify-content: space-between;
            flex-direction: row;
            align-items: center;
          }
          section h1 {
            margin-top: 1rem;
          }
          @media (min-width: 768px) {
            .header {
              ${cms.enabled
                ? `
    height: calc(100% - 62px);
    margin-top: 62px;
`
                : `height: 100%;`}
              position: fixed;
              left: 0;
              top: 0;
            }
            .nav {
              padding: 2rem;
              width: 20vw;
              height: 100%;
              border-right: 1px solid #ebebeb;
              border-bottom: none;
              flex-direction: column;
              align-items: flex-start;
            }
          }
        `}
      </style>
    </header>
  )
}
