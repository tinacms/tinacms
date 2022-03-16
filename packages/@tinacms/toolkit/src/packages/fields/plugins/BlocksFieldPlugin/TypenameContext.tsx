import React from 'react'

export const BlockTypenameContext = React.createContext({ typename: null })

/**
 * When a field is within a block, it's not clear which template
 * the value is coming from, so the event we emit doesn't tell us
 * the full story. This is mostly ok, but if blocks share some of the same
 * field names, an "change" event from `blocks.2.title` doesn't tell the
 * whole story.
 *
 * More info: https://github.com/tinacms/tinacms/issues/2698
 */
export const useCurrentTypename = () => {
  const typenameContext = React.useContext(BlockTypenameContext)
  return typenameContext.typename
}
