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

import { Form, FormBuilder } from 'tinacms'
import { HashRouter as Router, Route, Routes } from 'react-router-dom'

const FakeForm = () => {
  const form = new Form({
    id: 'some-id',
    label: 'somelabel',
    fields: [
      { label: 'Title', name: 'title', component: 'text' },
      { label: 'Image', name: 'image', component: 'image' },
      { label: 'Body', name: 'body', component: 'rich-text', templates: [] },
    ],
    onSubmit: () => {},
  })

  return <FormBuilder form={form} />
}

const Preview = () => {
  return (
    <div>
      <div>
        <div className="grid grid-cols-8">
          <div className="col-span-2 h-full">
            <FakeForm />
          </div>
          <div className="col-span-6">
            <iframe src="/" className="h-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

const Dashboard = () => {
  return <div>Dashboard</div>
}

export const Admin = () => {
  return (
    <Router>
      <Routes>
        <Route path="preview" element={<Preview />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}
