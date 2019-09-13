import { Node } from "prosemirror-model"

export abstract class Translator {
  abstract nodeFromString(content: string): Node | null
  abstract stringFromNode(node: Node): string
}
