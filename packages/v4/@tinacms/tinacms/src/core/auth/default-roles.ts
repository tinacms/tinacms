import {
  CONTENT_CREATE_PERMISSION,
  CONTENT_DELETE_PERMISSION,
  CONTENT_RENAME_PERMISSION,
  CONTENT_SAVE_PERMISSION,
} from '../content/contract';

// ADR-008 §4/§5: Tina ships editor/admin so TinaCloud works with zero config. An editor
// saves, creates, renames and deletes content (ADR-014 §4, ADR-019 §5); every other
// permission is granted to nobody by default except admin's wildcard. Null-prototype,
// so a role named after an Object.prototype member ("constructor", "__proto__")
// resolves to nothing rather than an inherited function.
export const DEFAULT_ROLE_PERMISSIONS: Readonly<
  Record<string, readonly string[]>
> = Object.freeze(
  Object.assign(Object.create(null), {
    admin: Object.freeze(['*']),
    editor: Object.freeze([
      CONTENT_SAVE_PERMISSION,
      CONTENT_CREATE_PERMISSION,
      CONTENT_RENAME_PERMISSION,
      CONTENT_DELETE_PERMISSION,
    ]),
  })
);

/** Whether the default role map grants `permission` to any of `roles`. */
export const defaultRolesGrant = (
  roles: readonly string[],
  permission: string
): boolean =>
  roles.some((role) => {
    const granted = DEFAULT_ROLE_PERMISSIONS[role] ?? [];
    return granted.includes('*') || granted.includes(permission);
  });
