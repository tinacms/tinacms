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
} from '@dnd-kit/sortable';
import {
  useSortable,
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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Parse the IDs to extract field name and indices
    const activeId = String(active.id);
    const overId = String(over.id);
    
    // Extract field name (everything before the last dot)
    const activeFieldName = activeId.substring(0, activeId.lastIndexOf('.'));
    const overFieldName = overId.substring(0, overId.lastIndexOf('.'));
    
    // Extract indices (everything after the last dot)
    const activeIndex = parseInt(activeId.substring(activeId.lastIndexOf('.') + 1));
    const overIndex = parseInt(overId.substring(overId.lastIndexOf('.') + 1));

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

      onDragEnd(result);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: draggableId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
            style: {},
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