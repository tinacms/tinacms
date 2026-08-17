export type EmptyTextElement = { type: 'text'; text: '' };
export type PositionItem = {
  line?: number | null;
  column?: number | null;
  offset?: number | null;
  _index?: number | null;
  _bufferIndex?: number | null;
};
export type Position = {
  start: PositionItem;
  end: PositionItem;
};
export type InvalidMarkdownElement = {
  type: 'invalid_markdown';
  value: string;
  message: string;
  position?: Position;
  children: [EmptyTextElement];
};

type ErrorType = {
  message: string;
  position?: {
    startColumn: number;
    endColumn: number;
    startLineNumber: number;
    endLineNumber: number;
  };
};
const buildError = (element: InvalidMarkdownElement): ErrorType => {
  return {
    message: element.message,
    position: element.position && {
      endColumn: element.position.end.column,
      startColumn: element.position.start.column,
      startLineNumber: element.position.start.line,
      endLineNumber: element.position.end.line,
    },
  };
};
export const buildErrorMessage = (element: InvalidMarkdownElement): string => {
  if (!element) {
    return '';
  }
  const errorMessage = buildError(element);
  const message = errorMessage
    ? `${errorMessage.message}${
        errorMessage.position
          ? ` at line: ${errorMessage.position.startLineNumber}, column: ${errorMessage.position.startColumn}`
          : ''
      }`
    : null;
  return message;
};
