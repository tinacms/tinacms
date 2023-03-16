/**

*/
import * as yup from 'yup';
import type { AnySchema } from 'yup';
export declare function assertShape<T extends unknown>(value: unknown, yupSchema: (args: typeof yup) => AnySchema, errorMessage?: string): asserts value is T;
