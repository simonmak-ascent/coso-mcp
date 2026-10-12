import * as z from 'zod';
import { AssertionIdSchema } from './assertions.js';
import { IdSchema, TimestampSchema } from './common.js';
export const LikelihoodSchema = z.enum(['low', 'medium', 'high']);
export const RiskStatusSchema = z.enum(['open', 'mitigated', 'accepted']);
/** COSO principle number, 1–17. */
export const PrincipleNumberSchema = z.number().int().min(1).max(17);
export const RiskSchema = z.object({
    id: IdSchema,
    engagementId: IdSchema,
    description: z.string().min(1),
    cause: z.string().optional(),
    impact: z.string().optional(),
    likelihood: LikelihoodSchema.default('medium'),
    assertions: z.array(AssertionIdSchema).default([]),
    principles: z.array(PrincipleNumberSchema).default([]),
    fraud: z.boolean().default(false),
    scopeItemId: IdSchema.optional(),
    status: RiskStatusSchema.default('open'),
    createdAt: TimestampSchema
});
//# sourceMappingURL=risk.js.map