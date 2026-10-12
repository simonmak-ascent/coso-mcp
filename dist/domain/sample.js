import * as z from 'zod';
import { IdSchema, TimestampSchema } from './common.js';
export const SamplingMethodSchema = z.enum(['random', 'systematic', 'targeted', 'haphazard']);
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
//# sourceMappingURL=sample.js.map