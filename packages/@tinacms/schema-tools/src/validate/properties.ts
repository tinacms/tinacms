import { z } from 'zod'
export const name = z.string({
  required_error: 'Name is required but not provided',
  invalid_type_error: 'Name must be a string',
})
