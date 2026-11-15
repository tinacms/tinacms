import { createContext } from 'react';

/**
 * The form provider instance that owns the image fields below it. A field
 * upload belongs to this instance, so a closed or replaced form is never written.
 */
export const UploadFormContext = createContext<object | null>(null);
