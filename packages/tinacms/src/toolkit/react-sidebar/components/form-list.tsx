import { Transition } from '@headlessui/react';
import { useCMS } from '@toolkit/react-tinacms';
import type { TinaState } from '@toolkit/tina-state';
import * as React from 'react';
import { BiChevronRight, BiFolder } from 'react-icons/bi';

type FormListItem = TinaState['formLists'][number]['items'][number];

interface TreeNode {
  id: string;
  name: string;
  fullPath: string;
  isFile: boolean;
  formId?: string;
  children: TreeNode[];
  depth: number;
  isReference?: boolean;
  isGlobal?: boolean;
}

// Recursively collect all document items including subitems, tracking which are references
const collectAllDocumentItems = (
  items: FormListItem[],
  isGlobalFn: (formId: string) => boolean
): Array<
  Extract<FormListItem, { type: 'document' }> & {
    isReference?: boolean;
    isGlobal?: boolean;
  }
> => {
  const allItems: Array<
    Extract<FormListItem, { type: 'document' }> & {
      isReference?: boolean;
      isGlobal?: boolean;
    }
  > = [];

  const processItem = (item: FormListItem, isFromSubItems = false) => {
    if (item.type === 'document') {
      allItems.push({
        ...item,
        isReference: isFromSubItems,
        isGlobal: isGlobalFn(item.formId),
      });
      // Recursively process subitems - these will be marked as references
      if (item.subItems && item.subItems.length > 0) {
        item.subItems.forEach((subItem) => processItem(subItem, true));
      }
    }
  };

  items.forEach((item) => processItem(item, false));
  return allItems;
};

// Convert file paths to tree structure
const buildTreeFromPaths = (
  items: Array<
    Extract<FormListItem, { type: 'document' }> & {
      isReference?: boolean;
      isGlobal?: boolean;
    }
  >
): TreeNode[] => {
  const root: TreeNode[] = [];
  const nodeMap = new Map<string, TreeNode>();

  items.forEach((item) => {
    const parts = item.formId.split('/').filter(Boolean);
    let currentLevel = root;
    let currentPath = '';

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isFile = index === parts.length - 1;
      const nodeId = currentPath;

      let node = nodeMap.get(nodeId);
      if (!node) {
        node = {
          id: nodeId,
          name: part,
          fullPath: currentPath,
          isFile,
          formId: isFile ? item.formId : undefined,
          children: [],
          depth: index,
          isReference: isFile ? item.isReference || false : false,
          isGlobal: isFile ? item.isGlobal || false : false,
        };
        nodeMap.set(nodeId, node);
        currentLevel.push(node);
      } else if (isFile && item.isReference) {
        // If we encounter the same file again and it's a reference, mark it as such
        node.isReference = true;
      }

      if (!isFile) {
        currentLevel = node.children;
      }
    });
  });

  return root;
};

const TreeNodeComponent = ({
  node,
  setActiveFormId,
}: {
  node: TreeNode;
  setActiveFormId: (id: string) => void;
}) => {
  const cms = useCMS();

  // Check if this folder contains only references
  const hasOnlyReferences = React.useMemo(() => {
    if (node.isFile) return false;

    const checkAllDescendants = (currentNode: TreeNode): boolean => {
      // Check all direct file children
      const fileChildren = currentNode.children.filter((child) => child.isFile);
      const folderChildren = currentNode.children.filter(
        (child) => !child.isFile
      );

      // If there are files, they must all be references
      if (
        fileChildren.length > 0 &&
        !fileChildren.every((child) => child.isReference)
      ) {
        return false;
      }

      // Recursively check folder children
      return folderChildren.every(checkAllDescendants);
    };

    return checkAllDescendants(node);
  }, [node]);

  const [isExpanded, setIsExpanded] = React.useState(!hasOnlyReferences);

  const form = React.useMemo(() => {
    if (!node.formId) return null;
    return cms.state.forms.find(({ tinaForm }) => node.formId === tinaForm.id);
  }, [node.formId]);

  const handleClick = () => {
    if (node.isFile && node.formId) {
      setActiveFormId(node.formId);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const getPaddingClass = (depth: number) => {
    // Use fixed Tailwind classes to ensure they're included in the bundle
    return `${1.5 + depth * 1.35}rem`;
  };

  return (
    <div>
      <button
        type='button'
        onClick={handleClick}
        className='pr-6 py-2 w-full bg-transparent border-none text-sm text-gray-700 group hover:bg-gray-50 transition-all ease-out duration-150 flex items-center gap-1'
        style={{ paddingLeft: getPaddingClass(node.depth) }}
      >
        {/* Expand/collapse arrow for folders */}
        {!node.isFile && node.children.length > 0 && (
          <BiChevronRight
            className={`w-4 h-4 text-gray-500 transition-transform duration-150 -ml-1 ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        )}

        {/* Folder/file icon */}
        {node.isFile ? (
          <></>
        ) : (
          <BiFolder className='w-4 h-4 text-orange-500 flex-none' />
        )}

        {/* Node name */}
        <div className='flex-1 flex items-center gap-2 text-left'>
          <span className='group-hover:text-blue-500 truncate'>
            {node.name}
          </span>
        </div>

        {/* Global badge for global documents */}
        {node.isFile && node.isGlobal && (
          <span className='px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full'>
            global
          </span>
        )}

        {/* Reference pill for files that are references (from subItems) */}
        {node.isFile && node.isReference && (
          <span className='px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full'>
            ref
          </span>
        )}

        {/* Form label for files */}
        {node.isFile && form && (
          <span className='text-xs text-gray-500 truncate max-w-32'>
            {form.tinaForm.label}
          </span>
        )}
      </button>

      {/* Render children */}
      {!node.isFile && isExpanded && node.children.length > 0 && (
        <div>
          {node.children.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              setActiveFormId={setActiveFormId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FormLists = (props: { isEditing: boolean }) => {
  const cms = useCMS();
  return (
    <Transition
      appear={true}
      // show={props.isEditing}
      show={true}
      as={'div'}
      enter='transition-all ease-out duration-150'
      enterFrom='opacity-0 -translate-x-1/2'
      enterTo='opacity-100'
      leave='transition-all ease-out duration-150'
      leaveFrom='opacity-100'
      leaveTo='opacity-0 -translate-x-1/2'
    >
      {cms.state.formLists.map((formList, index) => (
        <div key={`${formList.id}-${index}`}>
          {/* TODO: add labels for each list */}
          <FormList
            isEditing={props.isEditing}
            setActiveFormId={(id) => {
              cms.dispatch({ type: 'forms:set-active-form-id', value: id });
            }}
            formList={formList}
          />
        </div>
      ))}
    </Transition>
  );
};

export const FormList = (props: {
  isEditing: boolean;
  setActiveFormId: (id: string) => void;
  formList: TinaState['formLists'][number];
}) => {
  const cms = useCMS();

  const treeNodes = React.useMemo(() => {
    // Helper to check if a form is global
    const isGlobalFn = (formId: string) => {
      const form = cms.state.forms.find(
        ({ tinaForm }) => tinaForm.id === formId
      );
      return form?.tinaForm?.global || false;
    };

    // Collect ALL document items including nested subitems and global documents
    const allDocumentItems = collectAllDocumentItems(
      props.formList.items,
      isGlobalFn
    );

    // Build tree structure from all document items
    return buildTreeFromPaths(allDocumentItems);
  }, [JSON.stringify(props.formList.items)]);

  return (
    <div className='divide-y divide-gray-200'>
      {treeNodes.map((node) => (
        <TreeNodeComponent
          key={node.id}
          node={node}
          setActiveFormId={props.setActiveFormId}
        />
      ))}
    </div>
  );
};
