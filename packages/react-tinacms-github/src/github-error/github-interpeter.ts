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
  const switchToMaster = {
    name: `Switch to ${githubClient.baseBranch}`,
    primary: true,
    action: () => {
      githubClient.setWorkingBranch(githubClient.baseBranch)
      cms.events.dispatch({
        type: 'github:branch:checkout',
        branchName: githubClient.baseBranch,
      })
    },
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
      /**
       * This case checks all the reasons there may have been a 404:
       * - Unauthorized
       *   - Private Repo
       *   - Missing Repo
       * - Missing Branch
       * - Missing Repo
       */

      // Is the user authorized to edit this repo?
      if (!(await githubClient.isAuthorized())) {
        // Is the repo public?
        if (githubClient.authScope === 'public_repo') {
          return {
            title: `Create a Fork of ${githubClient.baseRepoFullName}`,
            message:
              `You do not have permission to make changes to ${githubClient.baseRepoFullName}.` +
              `Press the button below to fork this site and begin editing. `,
            actions: [
              cancelEditModeAction,
              {
                name: 'Create a Fork',
                primary: true,
                action: startEditing,
              },
            ],
          }
        } else {
          return {
            title: 'Unauthorized',
            message: `You do not have permission to make changes to ${githubClient.baseRepoFullName}.`,
            actions: [cancelEditModeAction],
          }
        }
      }

      // Does the branch exist?
      if (await githubClient.getBranch()) {
        return {
          title: 'Missing Branch ',
          message: 'The branch that you were editing has been deleted. Press.',
          actions: [cancelEditModeAction, switchToMaster],
        }
      }

      // The file is missing
      return {
        title: 'Content Not Found.',
        message:
          'The file you are trying to access is missing. Maybe it lives on a different branch?',
        actions: [cancelEditModeAction, switchToMaster],
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
