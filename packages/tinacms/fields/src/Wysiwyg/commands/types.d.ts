export interface Command {
  (state: EditorState, ...options: any[]): void
}
