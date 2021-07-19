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

import ReactMarkdown from 'react-markdown'
import type {
  Authors_Document,
  Article_Doc_Data,
} from '../.tina/__generated__/types'

export const BlogPost = (props: Article_Doc_Data) => {
  return (
    <>
      <h1>{props.title}</h1>
      <img src={props?.hero} width="100%" />
      <AuthorSnippet author={props.author} />
      <ReactMarkdown>{props._body}</ReactMarkdown>
    </>
  )
}

const AuthorSnippet = (props: { author: Authors_Document }) => {
  return (
    <div className="snippet">
      {props.author && (
        <>
          <img
            className="avatar"
            title={props.author.data.name}
            src={props.author.data.avatar}
          />
          <h3>By {props.author.data.name}</h3>
        </>
      )}
      <style jsx>{`
        .snippet {
          display: flex;
          align-items: center;
        }
        .avatar {
          height: 50px;
          margin-right: 10px;
          object-fit: cover;
          width: 50px;
          border-radius: 50%;
          background-size: cover;
          background-position: center;
        }
      `}</style>
    </div>
  )
}
