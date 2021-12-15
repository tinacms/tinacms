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

import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useEditState } from '../utils/editState'
const Admin = () => {
  const { setEdit } = useEditState()
  const router = useRouter()
  useEffect(() => {
    setEdit(true)
    router.back()
  }, [])
  return <div>Going into edit mode...</div>
}
export default Admin
