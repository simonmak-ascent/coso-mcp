import * as z from 'zod';

import { FRAMEWORK_LABEL } from '../version.js';
import { IdSchema, TimestampSchema } from './common.js';

export const ObjectiveCategoryIdSchema = z.enum(['operations', 'reporting', 'compliance']);
export type ObjectiveCategoryId = z.infer<typeof ObjectiveCategoryIdSchema>;

export const EngagementStatusSchema = z.enum(['draft', 'active', 'closed']);
export type EngagementStatus = z.infer<typeof EngagementStatusSchema>;

export const MaterialitySchema = z.object({
  basis: z.string().optional(),
  amount: z.number().optional(),
  currency: z.string().optional()
});
export type Materiality = z.infer<typeof MaterialitySchema>;

export const EngagementSchema = z.object({
  id: IdSchema,
  title: z.string().min(1),
  entity: z.string().min(1),
  period: z.string().min(1).optional(),
  framework: z.string().default(FRAMEWORK_LABEL),
  status: EngagementStatusSchema.default('draft'),
  materiality: MaterialitySchema.optional(),
  createdBy: z.string().optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema
});
export type Engagement = z.infer<typeof EngagementSchema>;
