export const leftoverText = (fields: string, count: number) => {
  if (count === 0) return 'Your earlier edits are still kept.';
  return count === 1
    ? `Your earlier edit to ${fields} is still kept.`
    : `Your earlier edits to ${fields} are still kept.`;
};
