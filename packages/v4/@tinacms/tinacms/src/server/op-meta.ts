import { invariant } from '../core/invariant';
import type { ServerOp } from '../core/plugin';

// Op-level authorization marks (ADR-008): bare handlers are protected by default;
// `publicOp` is the only unauthenticated opt-out (greppable); `protectedOp` names the
// required permission (`string` until codegen builds the typed union). Wrapping, not
// mutating, so one handler under two wrappers can't cross-tag; `Symbol.for`, so
// duplicate module copies still agree on the tag.
const OP_META = Symbol.for('tinacms.op-meta');

interface OpMeta {
  public?: true;
  permissions: readonly string[];
}

interface TaggedOp {
  [OP_META]?: OpMeta;
}

export const tagOp = <TOp extends ServerOp>(
  handler: TOp,
  meta: OpMeta
): TOp => {
  invariant(
    (handler as TaggedOp)[OP_META] === undefined,
    'op-already-tagged',
    'This handler already carries an authorization mark; wrap the bare handler instead.'
  );
  const wrapped = ((input: never) => handler(input)) as TOp & TaggedOp;
  wrapped[OP_META] = meta;
  return wrapped;
};

// Core's content save requires `content:save` and every permission the
// provider's own `update` required.
export const requiringPermissions = <TOp extends ServerOp>(
  permissions: readonly string[],
  handler: TOp
): TOp => tagOp(handler, { permissions });

export const opMeta = (handler: ServerOp): OpMeta =>
  (handler as TaggedOp)[OP_META] ?? { permissions: [] };
