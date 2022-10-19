import { formify } from '../appFiles/src/lib/formify'

export const printState = (obj) => {
  return obj
}

export const printBlueprints = ({ schema, client, query }) => {
  const optimizedQuery = client.getOptimizedQuery(query)
  const res = formify({ schema, optimizedQuery })
  const { formifiedQuery, blueprints } = res
  return { formifiedQuery, blueprints }
}
