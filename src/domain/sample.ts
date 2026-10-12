import * as z from 'zod';

import { IdSchema, TimestampSchema } from './common.js';

export const SamplingMethodSchema = z.enum(['random', 'systematic', 'targeted', 'haphazard']);
export type SamplingMethod = z.infer<typeof SamplingMethodSchema>;

export const SampleSchema = z.object({
  id: IdSchema,
  engagementId: IdSchema,
  controlId: IdSchema.optional(),
  populationId: IdSchema,
  method: SamplingMethodSchema,
  sampleSize: z.number().int().positive(),
  seed: z.number().int().nonnegative(),
  selectedReferences: z.array(z.string()).default([]),
  rationale: z.string().optional(),
  createdAt: TimestampSchema
});
export type Sample = z.infer<typeof SampleSchema>;
