import React from 'react';
import type { EditorialWorkflowMessagePart } from './editorial-workflow-utils';

export const EditorialWorkflowErrorText = ({
  parts,
}: {
  parts: EditorialWorkflowMessagePart[];
}) => (
  <>
    {parts.map((part, index) =>
      part.emphasis ? (
        <b key={index}>{part.text}</b>
      ) : (
        <React.Fragment key={index}>{part.text}</React.Fragment>
      )
    )}
  </>
);
