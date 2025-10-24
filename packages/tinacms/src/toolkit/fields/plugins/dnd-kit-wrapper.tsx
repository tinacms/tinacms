import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  defaultAnimateLayoutChanges,
  type AnimateLayoutChanges,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Compatibility layer for react-beautiful-dnd API
export interface DropResult {
  destination: {
    index: number;
  } | null;
  source: {
    index: number;
  };
  type: string;
}

export interface DragDropContextProps {
  onDragEnd: (result: DropResult) => void;
  children: React.ReactNode;
}

export interface DroppableProps {
  droppableId: string;
  type: string;
  children: (provided: {
    innerRef: React.RefObject<HTMLDivElement>;
    placeholder: React.ReactNode;
  }) => React.ReactNode;
}

export interface DraggableProps {
  draggableId: string;
  index: number;
  children: (
    provided: {
      innerRef: React.RefObject<HTMLElement>;
      draggableProps: {
        style?: React.CSSProperties;
        ref?: any;
        [key: string]: any;
      };
      dragHandleProps: {
        style?: React.CSSProperties;
        [key: string]: any;
      };
    },
    snapshot: {
      isDragging: boolean;
    }
  ) => React.ReactNode;
}

// Implementation of compatibility layer
export const DragDropContext: React.FC<DragDropContextProps> = ({
  onDragEnd,
  children,
}) => {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragOver = (event: any) => {
    const { over } = event;
    setOverId(over ? String(over.id) : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setOverId(null);

    if (!over || active.id === over.id) {
      return;
    }

    // Parse the IDs to extract field name and indices
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    
    // Extract field name (everything before the last dot)
    const activeFieldName = activeIdStr.substring(0, activeIdStr.lastIndexOf('.'));
    const overFieldName = overIdStr.substring(0, overIdStr.lastIndexOf('.'));
    
    // Extract indices (everything after the last dot)
    const activeIndex = parseInt(activeIdStr.substring(activeIdStr.lastIndexOf('.') + 1));
    const overIndex = parseInt(overIdStr.substring(overIdStr.lastIndexOf('.') + 1));

    if (activeFieldName === overFieldName) {
      const result: DropResult = {
        destination: {
          index: overIndex,
        },
        source: {
          index: activeIndex,
        },
        type: activeFieldName,
      };

      // Call onDragEnd immediately
      // dnd-kit's transforms handle the visual transition smoothly
      onDragEnd(result);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
    </DndContext>
  );
};

export const Droppable: React.FC<DroppableProps> = ({
  droppableId,
  type,
  children,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  return (
    <>
      {children({
        innerRef: ref,
        placeholder: null, // dnd-kit doesn't use placeholders the same way
      })}
    </>
  );
};

export const Draggable: React.FC<DraggableProps> = ({
  draggableId,
  index,
  children,
}) => {
  // Customize animation behavior to prevent snap-back
  const animateLayoutChanges: AnimateLayoutChanges = (args) => {
    const { isSorting, wasDragging } = args;
    
    // Don't animate when the item was just being dragged
    // This prevents the snap-back effect on drop
    if (wasDragging) {
      return false;
    }
    
    // Animate during sorting
    if (isSorting) {
      return defaultAnimateLayoutChanges(args);
    }
    
    // Allow animations in other cases
    return true;
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef,
  } = useSortable({ 
    id: draggableId,
    animateLayoutChanges,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Boost zIndex for dragging item to prevent visual glitches
    ...(isDragging && { zIndex: 9999 }),
  };

  return (
    <>
      {children(
        {
          innerRef: { current: null }, // We handle ref differently
          draggableProps: {
            ref: setNodeRef,
            style,
            ...attributes,
          },
          dragHandleProps: {
            ref: setActivatorNodeRef,
            ...listeners,
          },
        },
        {
          isDragging,
        }
      )}
    </>
  );
};

// Context for managing sortable items
interface SortableProviderProps {
  items: string[];
  children: React.ReactNode;
}

export const SortableProvider: React.FC<SortableProviderProps> = ({
  items,
  children,
}) => {
  return (
    <SortableContext items={items} strategy={verticalListSortingStrategy}>
      {children}
    </SortableContext>
  );
};