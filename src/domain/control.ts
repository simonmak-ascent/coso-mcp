import * as z from 'zod';

import { AssertionIdSchema } from './assertions.js';
import { IdSchema, TimestampSchema } from './common.js';
import { PrincipleNumberSchema } from './risk.js';

export const ControlTypeSchema = z.enum(['manual', 'automated', 'it-dependent-manual']);
export type ControlType = z.infer<typeof ControlTypeSchema>;

export const ControlFrequencySchema = z.enum([
  'annual',
  'quarterly',
  'monthly',
  'weekly',
  'daily',
  'per-transaction'
]);
export type ControlFrequency = z.infer<typeof ControlFrequencySchema>;

export const ControlStatusSchema = z.enum(['draft', 'active', 'retired']);
export type ControlStatus = z.infer<typeof ControlStatusSchema>;

export const ControlSchema = z.object({
  id: IdSchema,
  engagementId: IdSchema,
  description: z.string().min(1),
  type: ControlTypeSchema,
  frequency: ControlFrequencySchema,
  key: z.boolean().default(true),
  riskIds: z.array(IdSchema).default([]),
  assertions: z.array(AssertionIdSchema).default([]),
  principles: z.array(PrincipleNumberSchema).default([]),
  owner: z.string().optional(),
  scopeItemId: IdSchema.optional(),
  status: ControlStatusSchema.default('active'),
  createdAt: TimestampSchema
});
export type Control = z.infer<typeof ControlSchema>;
