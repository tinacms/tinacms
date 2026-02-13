import { useCMS } from '@toolkit/react-tinacms';
import type { TinaState } from '@toolkit/tina-state';
import * as React from 'react';
import { BiChevronRight, BiFolder, BiFolderOpen, BiX } from 'react-icons/bi';
import { FileStack } from 'lucide-react';

type FormListItem = TinaState['formLists'][number]['items'][number];

// Shared utility for calculating padding based on tree depth
const getPaddingClass = (depth: number) => `${1.5 + depth * 1.35}rem`;

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
      // Mark subitems as references
      const isRef = isFromSubItems;
      allItems.push({
        ...item,
        isReference: isRef,
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
      } else if (isFile) {
        // Handle duplicate files: non-reference status always wins
        if (!item.isReference) {
          node.isReference = false;
        } else if (item.isReference && node.isReference === undefined) {
          // Only mark as reference if not already defined
          node.isReference = true;
        }
      }

      if (!isFile) {
        currentLevel = node.children;
      }
    });
  });

  return root;
};

// Component for a single file item within a collection group
const FileItem = ({
  node,
  setActiveFormId,
  isLast,
  depth,
}: {
  node: TreeNode;
  setActiveFormId: (id: string) => void;
  isLast: boolean;
  depth: number;
}) => {
  // Strip file extension for display
  const nameWithoutExtension = node.name.replace(/\.[^/.]+$/, '');

  return (
    <div className='flex items-stretch'>
      {/* Line connector container */}
      <div
        className='relative flex-none'
        style={{ width: '1rem', marginLeft: getPaddingClass(depth) }}
      >
        {/* Vertical line - full height or half for last item */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 w-px bg-gray-300 top-0 ${
            isLast ? 'h-1/2' : 'h-full'
          }`}
        />
        {/* Horizontal line - from center to right edge */}
        <div className='absolute top-1/2 -translate-y-1/2 left-1/2 right-0 h-px bg-gray-300' />
      </div>

      <button
        type='button'
        onClick={() => node.formId && setActiveFormId(node.formId)}
        title={node.name}
        className='pl-1 pr-6 py-2 flex-1 bg-transparent border-none text-sm text-gray-700 group hover:bg-gray-50 transition-all ease-out duration-150 flex items-center gap-1'
      >
        {/* Node name without extension */}
        <div className='flex-1 flex items-center gap-2 text-left'>
          <span
            className={`group-hover:text-orange-500 truncate ${node.isReference ? 'italic text-gray-400' : ''}`}
          >
            {nameWithoutExtension}
          </span>
        </div>
      </button>
    </div>
  );
};

// Component for a group of files with the same collection type
const CollectionGroup = ({
  collectionLabel,
  files,
  setActiveFormId,
  depth,
  showReferences,
}: {
  collectionLabel: string;
  files: TreeNode[];
  setActiveFormId: (id: string) => void;
  depth: number;
  showReferences: boolean;
}) => {
  // Filter out references if showReferences is false
  const visibleFiles = showReferences
    ? files
    : files.filter((file) => !file.isReference);

  // Don't render the group if all files are filtered out
  if (visibleFiles.length === 0) return null;

  // Check if this is a global collection (any file in the group is global)
  const isGlobalCollection = files.some((file) => file.isGlobal);

  return (
    <div>
      {/* Collection label header */}
      <div
        className='py-1.5 flex items-center gap-2'
        style={{ paddingLeft: getPaddingClass(depth) }}
      >
        {/* Global badge for global collections */}
        {isGlobalCollection && (
          <span className='px-2 pb-0.5 text-xs bg-gray-100 text-blue-700 rounded-full'>
            global
          </span>
        )}
        <span className='text-xs text-gray-400'>{collectionLabel}</span>
      </div>

      {/* Files with connecting line */}
      {visibleFiles.map((file, index) => (
        <FileItem
          key={file.id}
          node={file}
          setActiveFormId={setActiveFormId}
          isLast={index === visibleFiles.length - 1}
          depth={depth}
        />
      ))}
    </div>
  );
};

const TreeNodeComponent = ({
  node,
  setActiveFormId,
  showReferences,
}: {
  node: TreeNode;
  setActiveFormId: (id: string) => void;
  showReferences: boolean;
}) => {
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
  const cms = useCMS();

  // Group file children by collection type
  const { fileGroups, folderChildren } = React.useMemo(() => {
    if (node.isFile) return { fileGroups: [], folderChildren: [] };

    const folders = node.children.filter((child) => !child.isFile);
    const files = node.children.filter((child) => child.isFile);

    // Group files by their collection label
    const groups: Map<string, TreeNode[]> = new Map();
    files.forEach((file) => {
      const form = cms.state.forms.find(
        ({ tinaForm }) => tinaForm.id === file.formId
      );
      const label = form?.tinaForm?.label || 'Unknown';
      if (!groups.has(label)) {
        groups.set(label, []);
      }
      groups.get(label)!.push(file);
    });

    return {
      fileGroups: Array.from(groups.entries()),
      folderChildren: folders,
    };
  }, [node, cms.state.forms]);

  // Recursively check if this node has any non-reference content
  const hasVisibleContent = React.useMemo(() => {
    if (node.isFile) return true;
    if (showReferences) return true;

    const checkNodeHasVisibleContent = (n: TreeNode): boolean => {
      // Check direct file children
      const fileChildren = n.children.filter((child) => child.isFile);
      const hasNonRefFiles = fileChildren.some((file) => !file.isReference);
      if (hasNonRefFiles) return true;

      // Recursively check folder children
      const folderChildren = n.children.filter((child) => !child.isFile);
      return folderChildren.some((folder) =>
        checkNodeHasVisibleContent(folder)
      );
    };

    return checkNodeHasVisibleContent(node);
  }, [node, showReferences]);

  // Hide folders with no visible content when references are hidden
  if (!node.isFile && !hasVisibleContent) return null;

  const handleClick = () => {
    if (node.isFile && node.formId) {
      setActiveFormId(node.formId);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  // If this is a file, render it as a standalone item (shouldn't happen normally as files are grouped)
  if (node.isFile) {
    const form = cms.state.forms.find(
      ({ tinaForm }) => tinaForm.id === node.formId
    );
    // Strip file extension for display
    const nameWithoutExtension = node.name.replace(/\.[^/.]+$/, '');

    return (
      <button
        type='button'
        onClick={handleClick}
        title={node.name}
        className='pr-6 py-2 w-full bg-transparent border-none text-sm text-gray-700 group hover:bg-gray-50 transition-all ease-out duration-150 flex items-center gap-1'
        style={{ paddingLeft: getPaddingClass(node.depth) }}
      >
        {/* Global badge for global collections */}
        {node.isGlobal && (
          <span className='px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full flex-none'>
            global
          </span>
        )}
        <span className='text-xs text-gray-400 flex-none'>
          {form?.tinaForm?.label}
        </span>
        <div className='flex-1 flex items-center gap-2 text-left'>
          <span
            className={`group-hover:text-orange-500 truncate ${node.isReference ? 'italic' : ''}`}
          >
            {nameWithoutExtension}
          </span>
        </div>
      </button>
    );
  }

  return (
    <div>
      <button
        type='button'
        onClick={handleClick}
        className='pr-6 py-2 w-full bg-transparent border-none text-sm text-gray-700 group hover:bg-gray-50 transition-all ease-out duration-150 flex items-center gap-1'
        style={{ paddingLeft: getPaddingClass(node.depth) }}
      >
        {/* Expand/collapse arrow for folders */}
        {node.children.length > 0 && (
          <BiChevronRight
            className={`w-4 h-4 text-gray-500 transition-transform duration-150 -ml-1 ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        )}

        {/* Folder icon */}
        {isExpanded ? (
          <BiFolderOpen className='w-4 h-4 text-orange-500 flex-none' />
        ) : (
          <BiFolder className='w-4 h-4 text-orange-500 flex-none' />
        )}

        {/* Node name */}
        <div className='flex-1 flex items-center gap-2 text-left'>
          <span className='group-hover:text-orange-500 truncate'>
            {node.name}
          </span>
        </div>
      </button>

      {/* Render children when expanded */}
      {isExpanded && (
        <div>
          {/* Render file groups first */}
          {fileGroups.map(([label, files]) => (
            <CollectionGroup
              key={label}
              collectionLabel={label}
              files={files}
              setActiveFormId={setActiveFormId}
              depth={node.depth + 1}
              showReferences={showReferences}
            />
          ))}

          {/* Render folder children after */}
          {folderChildren.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              setActiveFormId={setActiveFormId}
              showReferences={showReferences}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FormLists = (props: { lastActiveFormId: string | null }) => {
  const cms = useCMS();

  // Persist showReferences state in localStorage
  const [showReferences, setShowReferences] = React.useState(() => {
    try {
      const stored = localStorage.getItem('tina-show-references');
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  // Update localStorage when showReferences changes
  React.useEffect(() => {
    try {
      localStorage.setItem(
        'tina-show-references',
        JSON.stringify(showReferences)
      );
    } catch {
      // Ignore localStorage errors
    }
  }, [showReferences]);

  // Check if there are any referenced files across all form lists
  const hasReferencedFiles = React.useMemo(() => {
    const isGlobalFn = (formId: string) => {
      const form = cms.state.forms.find(
        ({ tinaForm }) => tinaForm.id === formId
      );
      return !!form?.tinaForm?.global;
    };

    for (const formList of cms.state.formLists) {
      const allDocumentItems = collectAllDocumentItems(
        formList.items,
        isGlobalFn
      );
      // If any item is a reference, we have referenced files
      if (allDocumentItems.some((item) => item.isReference)) {
        return true;
      }
    }
    return false;
  }, [cms.state.formLists, cms.state.forms]);

  // Get the last active form for the back button
  const lastActiveForm = props.lastActiveFormId
    ? cms.state.forms.find(
        ({ tinaForm }) => tinaForm.id === props.lastActiveFormId
      )
    : null;

  const handleBackToForm = () => {
    if (props.lastActiveFormId) {
      cms.dispatch({
        type: 'forms:set-active-form-id',
        value: props.lastActiveFormId,
      });
    }
  };

  return (
    <div className='flex flex-col h-full'>
      {/* Header section - fixed, no scroll */}
      <div className='flex-none px-4 py-3 border-b border-gray-100 bg-gradient-to-t from-white to-gray-50 space-y-3'>
        {/* Tina Explore heading */}
        <div className='flex items-center gap-2'>
          <FileStack className='w-5 h-5 text-orange-500' />
          <h2 className='text-lg font-semibold text-gray-800'>
            Referenced Files
          </h2>
          {lastActiveForm && (
            <button
              type='button'
              onClick={handleBackToForm}
              className='ml-auto p-1 text-gray-500 hover:text-orange-500 hover:bg-gray-100 rounded transition-all ease-out duration-150'
              title='Close'
            >
              <BiX className='w-6 h-6' />
            </button>
          )}
        </div>

        {/* Show references checkbox - only show if there are referenced files */}
        {hasReferencedFiles && (
          <label className='flex items-center gap-2 text-sm text-gray-600 cursor-pointer'>
            <input
              type='checkbox'
              checked={!showReferences}
              onChange={(e) => setShowReferences(!e.target.checked)}
              className='w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500'
            />
            <span>Direct references only</span>
          </label>
        )}
      </div>

      {/* Scrollable content area */}
      <div className='flex-1 overflow-x-auto overflow-y-auto min-h-0'>
        {cms.state.formLists.map((formList, index) => (
          <div key={`${formList.id}-${index}`}>
            {/* TODO: add labels for each list */}
            <FormList
              setActiveFormId={(id) => {
                cms.dispatch({ type: 'forms:set-active-form-id', value: id });
              }}
              formList={formList}
              showReferences={showReferences}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const FormList = (props: {
  setActiveFormId: (id: string) => void;
  formList: TinaState['formLists'][number];
  showReferences: boolean;
}) => {
  const cms = useCMS();

  const treeNodes = React.useMemo(() => {
    // Helper to check if a form is global
    const isGlobalFn = (formId: string) => {
      const form = cms.state.forms.find(
        ({ tinaForm }) => tinaForm.id === formId
      );
      return !!form?.tinaForm?.global;
    };

    // Collect ALL document items including nested subitems and global documents
    const allDocumentItems = collectAllDocumentItems(
      props.formList.items,
      isGlobalFn
    );

    // Build tree structure from all document items
    return buildTreeFromPaths(allDocumentItems);
  }, [JSON.stringify(props.formList.items), cms.state.forms]);

  return (
    <div className='divide-y divide-gray-200'>
      {treeNodes.map((node) => (
        <TreeNodeComponent
          key={node.id}
          node={node}
          setActiveFormId={props.setActiveFormId}
          showReferences={props.showReferences}
        />
      ))}
    </div>
  );
};
