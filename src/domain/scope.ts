import * as z from 'zod';

import { AssertionIdSchema } from './assertions.js';
import { IdSchema, TimestampSchema } from './common.js';
import { ObjectiveCategoryIdSchema } from './engagement.js';

export const ScopeItemSchema = z.object({
  id: IdSchema,
  area: z.string().min(1),
  objectiveCategory: ObjectiveCategoryIdSchema,
  assertions: z.array(AssertionIdSchema).default([]),
  rationale: z.string().optional(),
  inScope: z.boolean().default(true),
  createdAt: TimestampSchema
});
export type ScopeItem = z.infer<typeof ScopeItemSchema>;
