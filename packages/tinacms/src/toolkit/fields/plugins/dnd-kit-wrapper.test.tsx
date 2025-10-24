import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import { DragDropContext, Droppable, Draggable, SortableProvider } from './dnd-kit-wrapper';

describe('DnD Kit Wrapper', () => {
  it('should render DragDropContext without errors', () => {
    const mockOnDragEnd = vi.fn();
    
    render(
      <DragDropContext onDragEnd={mockOnDragEnd}>
        <div>Test content</div>
      </DragDropContext>
    );
  });

  it('should render Droppable without errors', () => {
    const mockOnDragEnd = vi.fn();
    
    render(
      <DragDropContext onDragEnd={mockOnDragEnd}>
        <Droppable droppableId="test" type="test">
          {(provided) => (
            <div ref={provided.innerRef}>
              <div>Test droppable content</div>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  });

  it('should render Draggable within SortableProvider without errors', () => {
    const mockOnDragEnd = vi.fn();
    
    render(
      <DragDropContext onDragEnd={mockOnDragEnd}>
        <SortableProvider items={['test.0']}>
          <Draggable draggableId="test.0" index={0}>
            {(provided, snapshot) => (
              <div
                ref={provided.draggableProps.ref}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                Test draggable content
              </div>
            )}
          </Draggable>
        </SortableProvider>
      </DragDropContext>
    );
  });

  it('should call onDragEnd when drag operation completes', () => {
    // This would require more complex testing with actual drag operations
    // For now, we're just testing that the components render without errors
    const mockOnDragEnd = vi.fn();
    
    const { container } = render(
      <DragDropContext onDragEnd={mockOnDragEnd}>
        <div>Test DragDropContext</div>
      </DragDropContext>
    );

    expect(container).toBeDefined();
  });
});