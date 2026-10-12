import * as z from 'zod';
import { IdSchema, TimestampSchema } from './common.js';
export const WorkpaperStatusSchema = z.enum(['draft', 'in-review', 'approved']);
export const ReviewNoteStatusSchema = z.enum(['open', 'resolved']);
export const ReviewNoteSchema = z.object({
    id: z.string().min(1),
    author: z.string().min(1),
    text: z.string().min(1),
    status: ReviewNoteStatusSchema.default('open'),
    createdAt: TimestampSchema,
    resolvedBy: z.string().optional(),
    resolvedAt: TimestampSchema.optional()
});
export const SignOffRoleSchema = z.enum(['preparer', 'reviewer']);
export const SignOffSchema = z.object({
    role: SignOffRoleSchema,
    actor: z.string().min(1),
    at: TimestampSchema,
    comment: z.string().optional()
});
export const WorkpaperSchema = z.object({
    id: IdSchema,
    engagementId: IdSchema,
    controlId: IdSchema,
    testResultId: IdSchema.optional(),
    title: z.string().min(1),
    markdown: z.string(),
    status: WorkpaperStatusSchema.default('draft'),
    signOffs: z.array(SignOffSchema).default([]),
    reviewNotes: z.array(ReviewNoteSchema).default([]),
    createdAt: TimestampSchema,
    updatedAt: TimestampSchema
});
/** The preparer and reviewer sign-offs, if present. */
export function findSignOff(workpaper, role) {
    return [...workpaper.signOffs].reverse().find((signOff) => signOff.role === role);
}
//# sourceMappingURL=workpaper.js.map