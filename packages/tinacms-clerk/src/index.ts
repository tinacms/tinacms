import { createClerkClient } from '@clerk/backend';
import type { ServerResponse } from 'http';

export const ClerkBackendAuthentication = ({
  secretKey,
  allowList,
  orgId,
}: {
  secretKey: string;
  // Ensure the user is the in allowList
  allowList?: string[];
  // Ensure the user is a member of the provided orgId
  orgId?: string;
}) => {
  const clerkClient = createClerkClient({ secretKey });

  return {
    isAuthorized: async (req: Request, _res: ServerResponse) => {
      const token = req.headers['authorization'];
      const tokenWithoutBearer = token?.replace('Bearer ', '').trim();
      const requestState = await clerkClient.authenticateRequest(req, {
        acceptsToken: tokenWithoutBearer,
      });

      if (requestState.status === 'signed-in') {
        const user = await clerkClient.users.getUser(
          requestState.toAuth().userId
        );
        if (orgId) {
          // Get the list of member id's for the organization
          const { data: memberships } =
            await clerkClient.organizations.getOrganizationMembershipList({
              organizationId: orgId,
            });
          const membershipList = memberships.map(
            (x) => x.publicUserData?.userId
          );
          // if the user is not in the list, they are not authorized
          if (!membershipList.includes(user.id))
            return {
              isAuthorized: false as const,
              errorMessage:
                'User not authorized. Not a member of the provided organization.',
              errorCode: 401,
            };
        }
        // if the user's email is not in the allowList, they are not authorized
        const primaryEmail = user.emailAddresses.find(
          ({ id }) => id === user.primaryEmailAddressId
        );
        if (primaryEmail && !allowList) {
          return { isAuthorized: true as const };
        }
        // If they pass an allowList, check if the user is in it
        if (primaryEmail && allowList?.includes(primaryEmail.emailAddress)) {
          return { isAuthorized: true as const };
        }
      }

      if (requestState.reason === 'unexpected-error') {
        console.error(requestState.message);
      }
      return {
        isAuthorized: false as const,
        errorMessage: 'User not authorized',
        errorCode: 401,
      };
    },
  };
};
