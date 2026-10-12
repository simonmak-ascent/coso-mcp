import * as z from 'zod';

/**
 * A record identifier: starts alphanumeric; letters, digits, `_` or `-` (max 64).
 * Engagement ids are lowercase slugs; risk/control/scope ids are generated
 * (e.g. `R-0001`) but may also be supplied.
 */
export const IdSchema = z
  .string()
  .regex(
    /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/,
    'must start alphanumeric; letters, digits, underscore or hyphen (max 64)'
  );

/** An ISO-8601 timestamp string (as produced by `Date.prototype.toISOString`). */
export const TimestampSchema = z.string().min(1);
