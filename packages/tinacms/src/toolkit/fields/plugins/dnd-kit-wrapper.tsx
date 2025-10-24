import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  defaultAnimateLayoutChanges,
  type AnimateLayoutChanges,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

export const DragDropContext: React.FC<DragDropContextProps> = ({
  onDragEnd,
  children,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    const activeFieldName = activeIdStr.substring(
      0,
      activeIdStr.lastIndexOf('.')
    );
    const overFieldName = overIdStr.substring(0, overIdStr.lastIndexOf('.'));
    const activeIndex = parseInt(
      activeIdStr.substring(activeIdStr.lastIndexOf('.') + 1)
    );
    const overIndex = parseInt(
      overIdStr.substring(overIdStr.lastIndexOf('.') + 1)
    );

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
        placeholder: null,
      })}
    </>
  );
};

export const Draggable: React.FC<DraggableProps> = ({
  draggableId,
  children,
}) => {
  const animateLayoutChanges: AnimateLayoutChanges = (args) => {
    const { isSorting, wasDragging } = args;

    if (wasDragging) {
      return false;
    }

    if (isSorting) {
      return defaultAnimateLayoutChanges(args);
    }

    return true;
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: draggableId,
    animateLayoutChanges,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging && { zIndex: 9999 }),
  };

  return (
    <>
      {children(
        {
          innerRef: { current: null },
          draggableProps: {
            ref: setNodeRef,
            style,
            ...attributes,
            ...listeners,
          },
          dragHandleProps: {
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
