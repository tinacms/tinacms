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
import logo from './logo.svg'
import './App.css'
import content from './home.json'
import { useForm, usePlugins } from 'tinacms'

const App: React.FC = () => {
  const [tinaContent, form] = useForm({
    id: 'home-content',
    label: 'Content',
    initialValues: content,
    onSubmit: async () => {
      alert('Saving...')
    },
    fields: [
      {
        name: 'title',
        label: 'Title',
        component: 'text',
      },
    ],
  })
  usePlugins(form)
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>{tinaContent.title}</p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  )
}

export default App
