import { randomUUID } from 'node:crypto';
/** A record identifier: starts alphanumeric; letters, digits, `_` or `-` (max 64). */
export const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;
export function assertValidId(id) {
    if (!ID_PATTERN.test(id)) {
        throw new Error(`Invalid id: ${JSON.stringify(id)}`);
    }
}
/** Sequential per-collection id, e.g. `R-0001`. */
export function newId(prefix, existing) {
    return `${prefix}-${String(existing + 1).padStart(4, '0')}`;
}
/** A random engagement id, e.g. `eng-1a2b3c4d`. */
export function slugId() {
    return `eng-${randomUUID().replace(/-/g, '').slice(0, 8)}`;
}
//# sourceMappingURL=ids.js.map