## Migration from react-beautiful-dnd to dnd-kit

This project has been migrated from `react-beautiful-dnd` to `@dnd-kit/core` and related packages for improved accessibility, performance, and future compatibility.

### Changes Made

1. **Dependencies Updated:**
   - Removed: `react-beautiful-dnd` and `@types/react-beautiful-dnd`
   - Added: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

2. **Migration Approach:**
   - Created a compatibility wrapper (`dnd-kit-wrapper.tsx`) that maintains the same API as react-beautiful-dnd
   - This approach minimizes code changes and maintains backward compatibility
   - All existing drag-and-drop functionality preserved

3. **Files Modified:**
   - `packages/tinacms/src/toolkit/form-builder/form-builder.tsx`
   - `packages/tinacms/src/toolkit/fields/plugins/blocks-field-plugin/index.tsx`
   - `packages/tinacms/src/toolkit/fields/plugins/group-list-field-plugin.tsx`
   - `packages/tinacms/src/toolkit/fields/plugins/list-field-plugin.tsx`
   - `packages/@tinacms/scripts/src/index.ts` (comment updates)

4. **Benefits:**
   - Better keyboard navigation and accessibility support
   - Improved performance with touch devices
   - Future-proof library with active maintenance
   - Reduced bundle size

### Usage

The API remains the same for existing components. Drag-and-drop functionality continues to work as before:

- **DragDropContext**: Wraps the entire drag-and-drop area
- **Droppable**: Defines drop zones
- **Draggable**: Makes items draggable
- **SortableProvider**: New wrapper for managing sortable items (auto-added)

### Testing

All existing tests pass, and new tests have been added to verify the migration works correctly.