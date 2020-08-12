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
import { TinaCMS } from 'tinacms'

export const getModalProps = async (
  error: any,
  cms: TinaCMS,
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
      if (await githubClient.getBranch()) {
        // Branch exists; but the content doesn't
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
      if (await githubClient.isAuthorized()) {
        return {
          title: 'Missing Branch ',
          message: 'The branch that you were editing has been deleted. Press.',
          actions: [
            {
              name: 'Stop Editing',
              action: stopEditing,
            },
            {
              name: `Switch to ${githubClient.baseBranch}`,
              primary: true,
              action: () => {
                githubClient.setWorkingBranch(githubClient.baseBranch)
                cms.events.dispatch({
                  type: 'github:branch:checkout',
                  branchName: githubClient.baseBranch,
                })
              },
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
