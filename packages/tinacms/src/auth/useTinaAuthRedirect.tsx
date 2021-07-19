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

import { useEffect } from 'react'

const TINA_AUTH_CONFIG = 'tina_auth_config'
export const useTinaAuthRedirect = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)

    const config = {
      code: urlParams.get('code') || '',
      scope: urlParams.get('scope') || 'email',
      state: urlParams.get('state'),
    }

    if (!config.code) {
      return
    }

    localStorage[TINA_AUTH_CONFIG] = JSON.stringify(config)
  }, [])
}
