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

import { ActionableModalOptions } from '../components/ActionableModal'
import { GithubClient } from '../github-client'

export const getModalProps = async (
  error: any,
  githubClient: GithubClient,
  startEditing: () => void,
  stopEditing: () => void
): Promise<ActionableModalOptions> => {
  const reauthenticateAction = {
    name: 'Continue',
    primary: true,
    action: startEditing,
  }
  const cancelEditModeAction = {
    name: 'Cancel',
    primary: false,
    action: stopEditing,
  }

  switch (error.status) {
    case 401: {
      // Unauthorized
      return {
        title: '401 Unauthenticated',
        message: 'Authentication is invalid',
        actions: [cancelEditModeAction, reauthenticateAction],
      }
    }
    case 404: {
      // Not Found
      if (await githubClient.getBranch()) {
        // drill down further in the future
        return {
          title: '404 Not Found',
          message: 'Failed to fetch content.',
          actions: [
            {
              name: 'Continue',
              action: stopEditing,
            },
          ],
        }
      }
      return {
        title: '404 Not Found',
        message: 'You are missing a fork.',
        actions: [cancelEditModeAction, reauthenticateAction],
      }
    }
    case 500: {
      return {
        title: 'Error 500',
        message: error.message,
        actions: [reauthenticateAction],
      }
    }
  }

  return {
    title: `Error  ${error.status}`,
    message: error.message,
    actions: [cancelEditModeAction, reauthenticateAction],
  }
}
