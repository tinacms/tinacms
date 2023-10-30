import { Clerk } from '@clerk/backend'
import type { IncomingMessage, ServerResponse } from 'http'

export const ClerkBackendAuthentication = ({
  secretKey,
  allowList,
}: {
  secretKey: string
  allowList?: string[]
}) => {
  const clerk = Clerk({
    secretKey,
  })

  return {
    isAuthorized: async (req: IncomingMessage, _res: ServerResponse) => {
      const requestState = await clerk.authenticateRequest({
        headerToken: req.headers['authorization'],
      })
      if (requestState.status === 'signed-in') {
        const user = await clerk.users.getUser(requestState.toAuth().userId)
        const primaryEmail = user.emailAddresses.find(
          ({ id }) => id === user.primaryEmailAddressId
        )
        if (primaryEmail && !allowList) {
          return { isAuthorized: true as const }
        }
        // If they pass an allowList, check if the user is in it
        if (primaryEmail && allowList?.includes(primaryEmail.emailAddress)) {
          return { isAuthorized: true as const }
        }
      }
      return {
        isAuthorized: false as const,
        errorMessage: 'User not authorized',
        errorCode: 401,
      }
    },
  }
}
