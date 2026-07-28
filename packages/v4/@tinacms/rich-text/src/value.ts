// The document model the editor edits.
//
// It lives in this package, not in the host, because the editor is what defines
// the shape — a codec's job is to produce it from a file and turn it back into
// one. Putting it here also keeps the dependency one-way: `@tinacms/tinacms`
// imports this package, never the reverse.
//
// Deliberately dependency-free so a codec can implement the contract without
// pulling the editor (or its 40-odd packages) in behind it.

// A node in the document. Plate owns the full shape per node type; `type` is the
// only field anything outside the editor reads, so it is the only one named.
export interface RichTextNode {
  type: string;
  [key: string]: unknown;
}

export interface RichTextValue {
  type: 'root';
  children: RichTextNode[];
}

// Frozen because it is shared, not copied: a field descriptor's defaultValue is
// handed into form values by reference, so every empty rich-text field in every
// open document points at this one object. Nothing mutates it today — the editor
// seeds from it and builds its own tree — but a form store comparing values
// structurally would not notice if something did. Freezing makes that an
// immediate error rather than one document's edits appearing in another.
export const EMPTY_RICH_TEXT: RichTextValue = Object.freeze({
  type: 'root',
  children: Object.freeze([]) as RichTextNode[],
});
