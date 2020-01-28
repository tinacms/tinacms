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

import ReactMarkdown from 'react-markdown'

const BlogList = props => {
  console.log(props)
  return (
    <div>
      <h3>Hi! My name is {props.data ? props.data.name : 'no name'}</h3>
      <ReactMarkdown>
        {props.data ? props.data.body : 'md body goes here'}
      </ReactMarkdown>
      <style jsx>
        {`
          div {
            width: 100%;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            text-align: center;
            padding: 3rem;
          }
        `}
      </style>
    </div>
  )
}

export default BlogList
