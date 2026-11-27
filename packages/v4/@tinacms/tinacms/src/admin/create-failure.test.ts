import {
  CREATE_FAILURES,
  type CreateFailure,
} from '@tinacms/ui/lib/create-failure';
import { expect, expectTypeOf, it } from 'vitest';
import {
  BRANCH_CREATE_FAILURES,
  type BranchCreateFailure,
} from '../core/branch/contract';

it('names the same create failures in the core slice and the switcher', () => {
  expectTypeOf<BranchCreateFailure>().toEqualTypeOf<CreateFailure>();
  expect(BRANCH_CREATE_FAILURES).toEqual(CREATE_FAILURES);
});
