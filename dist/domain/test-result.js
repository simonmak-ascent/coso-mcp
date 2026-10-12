import * as z from 'zod';
import { IdSchema, TimestampSchema } from './common.js';
export const OutcomeSchema = z.enum(['pass', 'fail', 'na']);
export const AttributeResultSchema = z.object({
    reference: z.string().min(1),
    outcome: OutcomeSchema,
    evidenceRef: z.string().optional(),
    note: z.string().optional()
});
export const TestConclusionSchema = z.enum([
    'effective',
    'effective-with-exceptions',
    'deficiency',
    'not-concluded'
]);
export const TestResultSchema = z.object({
    id: IdSchema,
    engagementId: IdSchema,
    controlId: IdSchema,
    sampleId: IdSchema,
    populationId: IdSchema.optional(),
    attribute: z.string().min(1).describe('The control attribute/objective tested.'),
    procedure: z.string().optional(),
    results: z.array(AttributeResultSchema).default([]),
    conclusion: TestConclusionSchema.optional(),
    preparedBy: z.string().optional(),
    createdAt: TimestampSchema
});
export const ExceptionSchema = z.object({
    id: IdSchema,
    engagementId: IdSchema,
    testResultId: IdSchema,
    reference: z.string().min(1),
    description: z.string().min(1),
    rootCause: z.string().optional(),
    impact: z.string().optional(),
    compensatingControl: z.string().optional(),
    createdAt: TimestampSchema
});
//# sourceMappingURL=test-result.js.map