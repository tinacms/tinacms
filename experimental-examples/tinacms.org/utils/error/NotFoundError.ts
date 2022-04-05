import { HTTPError } from './HTTPError'
export class NotFoundError extends HTTPError {
  public code = 404
}
