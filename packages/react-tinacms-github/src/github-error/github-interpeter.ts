import { getForkName, getHeadBranch } from '../open-authoring/repository'
import { ActionableModalOptions } from '../misc/ActionableModal'

export const getModalProps = async (
  error,
  sourceProvider,
  startEditing,
  stopEditing
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

  switch (error.code) {
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
      if (await sourceProvider.getBranch(getForkName(), getHeadBranch())) {
        // drill down further in the future
        return {
          title: '404 Not Found',
          message: 'Failed to get some content.',
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
    title: `Error  ${error.code}`,
    message: error.message,
    actions: [cancelEditModeAction, reauthenticateAction],
  }
}
