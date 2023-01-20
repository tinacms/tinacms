import { handlerRequest } from '../../lib/db'

export default async function handler(req, res) {
  return handlerRequest(req, res)
}
