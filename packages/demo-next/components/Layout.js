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

import Header from "./Header";
import Meta from './Meta'

export default function Layout(props) {
  return (
    <section
      className="layout"
    >
    <Meta 
      siteTitle={props.siteTitle} 
      siteDescription={props.siteDescription} 
    />
    <Header siteTitle={props.siteTitle} />
    <div className="content">{props.children}</div>
    <style jsx>
      {`
        .layout {
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .content {
          flex-grow: 1;
        }
        @media (min-width: 768px) {
          .layout {
            display: block;
          }
          .content {
            flex-grow: none;
            width: 70vw;
            margin-left: 30vw;
          }
        }
      `}
    </style>
  </section>
  );
}