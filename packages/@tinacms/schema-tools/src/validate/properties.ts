/**

*/

import { z } from 'zod'
export const name = z
  .string({
    required_error: 'Name is required but not provided',
    invalid_type_error: 'Name must be a string',
  })
  .superRefine((val, ctx) => {
    if (val.match(/^[a-zA-Z0-9_]*$/) === null) {
      ctx.addIssue({
        code: 'custom',
        message: `name, "${val}" must be alphanumeric and can only contain underscores. (No spaces, dashes, special characters, etc.)
If you display the name in the UI, you can use the label property to customize the display name.
If you need to use this value you can use the\`nameOverride\` property to customize the value. For example:
\`\`\`
{
  "name": ${val.replace(/[^a-zA-Z0-9]/g, '_')},
  "nameOverride": ${val},
  // ...
}
\`\`\``,
      })
    }
  })
