import z from 'zod'

export const LexicalRoot = z.object({
  type: z.literal('root'),
  // children: ,
})
