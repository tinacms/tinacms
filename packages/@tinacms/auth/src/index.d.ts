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
import { NextApiRequest } from 'next';
export interface TinaCloudUser {
    id: string;
    email: string;
    verified: boolean;
    role: 'admin' | 'user';
    enabled: boolean;
    fullName: string;
}
/**
 *
 * @description Takes in the `req` and returns `undefined` if there is no user and returns a `TinaCloudUser` if the user is logged in.
 *
 * @example
 * import { NextApiHandler } from 'next'
 * import { isAuthorized } from '@tinacms/auth'
 * const apiHandler: NextApiHandler = async (req, res) => {
 *   const user = await isAuthorized(req)
 *   if (user && user.verified) {
 *       res.json({
 *         validUser: true,
 *        })
 *       return
 *   } else {
 *     console.log('this user NOT is logged in')
 *     res.json({
 *      validUser: false,
 *      })
 *   }
 *}
 * export default apiHandler
 *
 * @param {NextApiRequest} req - the request. It must contain a req.query.org, req.query.clientID and req.headers.authorization
 *
 */
export declare const isAuthorized: (req: NextApiRequest) => Promise<TinaCloudUser | undefined>;
