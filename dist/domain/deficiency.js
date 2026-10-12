import * as z from 'zod';
import { IdSchema, TimestampSchema } from './common.js';
/** ICFR severity classification (PCAOB AS 2201 terms). */
export const SeveritySchema = z.enum([
    'deficiency',
    'significant-deficiency',
    'material-weakness'
]);
export const DeficiencyLikelihoodSchema = z.enum([
    'remote',
    'more-than-remote',
    'reasonably-possible'
]);
export const MagnitudeSchema = z.enum([
    'inconsequential',
    'more-than-inconsequential',
    'material'
]);
export const RemediationSchema = z.object({
    rootCause: z.string().optional(),
    actions: z.string().optional(),
    owner: z.string().optional(),
    dueDate: z.string().optional(),
    retestPlan: z.string().optional()
});
export const DeficiencySchema = z.object({
    id: IdSchema,
    engagementId: IdSchema,
    title: z.string().min(1),
    description: z.string().min(1),
    likelihood: DeficiencyLikelihoodSchema,
    magnitude: MagnitudeSchema,
    pervasive: z.boolean().default(false),
    severity: SeveritySchema,
    rationale: z.string().min(1),
    controlId: IdSchema.optional(),
    testResultId: IdSchema.optional(),
    exceptionIds: z.array(IdSchema).default([]),
    compensatingControl: z.string().optional(),
    remediation: RemediationSchema.optional(),
    createdAt: TimestampSchema
});
//# sourceMappingURL=deficiency.js.map