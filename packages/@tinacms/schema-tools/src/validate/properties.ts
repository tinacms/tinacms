/**

*/

import { z } from 'zod'
export const name = z
  .string({
    required_error: 'Name is required but not provided',
    invalid_type_error: 'Name must be a string',
  })
  .refine(
    (val) => val.match(/^[a-zA-Z0-9_]*$/) !== null,
    (val) => ({
      message: `name, "${val}" must be alphanumeric and can only contain underscores`,
    })
  )
