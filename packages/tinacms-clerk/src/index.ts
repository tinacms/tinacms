import { Clerk } from '@clerk/backend'
import type { IncomingMessage, ServerResponse } from 'http'

export const ClerkBackendAuthentication = ({
  secretKey,
  allowList,
  orgId,
}: {
  secretKey: string
  // Ensure the user is the int allowList
  allowList?: string[]
  // Ensure the user is a member of an the provided orgId
  orgId?: string
}) => {
  const clerk = Clerk({
    secretKey,
  })

  return {
    isAuthorized: async (req: IncomingMessage, _res: ServerResponse) => {
      const token = req.headers['authorization']
      const tokenWithoutBearer = token?.replace('Bearer ', '').trim()
      const requestState = await clerk.authenticateRequest({
        headerToken: tokenWithoutBearer,
      })

      if (requestState.status === 'signed-in') {
        const user = await clerk.users.getUser(requestState.toAuth().userId)
        if (orgId) {
          // Get the list of member id's for the organization
          const membershipList = (
            await clerk.organizations.getOrganizationMembershipList({
              organizationId: orgId,
            })
          ).map((x) => x.publicUserData?.userId)
          // if the user is not in the list, they are not authorized
          if (!membershipList.includes(user.id))
            return {
              isAuthorized: false as const,
              errorMessage:
                'User not authorized. Not a member of the provided organization.',
              errorCode: 401,
            }
        }
        // if the user's email is not in the allowList, they are not authorized
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

      if (requestState.reason === 'unexpected-error') {
        console.error(requestState.message)
      }
      return {
        isAuthorized: false as const,
        errorMessage: 'User not authorized',
        errorCode: 401,
      }
    },
  }
}
