/** A record identifier: starts alphanumeric; letters, digits, `_` or `-` (max 64). */
export declare const ID_PATTERN: RegExp;
export declare function assertValidId(id: string): void;
/** Sequential per-collection id, e.g. `R-0001`. */
export declare function newId(prefix: string, existing: number): string;
/** A random engagement id, e.g. `eng-1a2b3c4d`. */
export declare function slugId(): string;
//# sourceMappingURL=ids.d.ts.map