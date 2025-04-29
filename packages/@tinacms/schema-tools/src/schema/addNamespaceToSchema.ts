type Node = {
  name?: string;
  value?: string;
  namespace?: string[];
  [key: string]: any;
};

export function addNamespaceToSchema<T extends Node | string>(
  maybeNode: T,
  namespace: string[] = []
): T {
  if (typeof maybeNode !== 'object' || maybeNode === null) {
    return maybeNode;
  }

  const newNode: Node = { ...maybeNode, namespace: [...namespace] };
  Object.entries(maybeNode).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      newNode[key] = value.map((element) => {
        if (element && typeof element === 'object' && 'name' in element) {
          const valueName = element.name || element.value;
          return addNamespaceToSchema(element, [...namespace, valueName]);
        }
        return element;
      });
    } else if (value && typeof value === 'object' && 'name' in value) {
      newNode[key] = addNamespaceToSchema(value, [...namespace, value.name]);
    } else {
      newNode[key] = value;
    }
  });

  return newNode as T;
}
