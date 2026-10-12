import * as z from 'zod';
/**
 * A record identifier: starts alphanumeric; letters, digits, `_` or `-` (max 64).
 * Engagement ids are lowercase slugs; risk/control/scope ids are generated
 * (e.g. `R-0001`) but may also be supplied.
 */
export declare const IdSchema: z.ZodString;
/** An ISO-8601 timestamp string (as produced by `Date.prototype.toISOString`). */
export declare const TimestampSchema: z.ZodString;
//# sourceMappingURL=common.d.ts.map