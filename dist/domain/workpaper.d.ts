import * as z from 'zod';
export declare const WorkpaperStatusSchema: z.ZodEnum<{
    approved: "approved";
    draft: "draft";
    "in-review": "in-review";
}>;
export type WorkpaperStatus = z.infer<typeof WorkpaperStatusSchema>;
export declare const ReviewNoteStatusSchema: z.ZodEnum<{
    open: "open";
    resolved: "resolved";
}>;
export declare const ReviewNoteSchema: z.ZodObject<{
    id: z.ZodString;
    author: z.ZodString;
    text: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<{
        open: "open";
        resolved: "resolved";
    }>>;
    createdAt: z.ZodString;
    resolvedBy: z.ZodOptional<z.ZodString>;
    resolvedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ReviewNote = z.infer<typeof ReviewNoteSchema>;
export declare const SignOffRoleSchema: z.ZodEnum<{
    preparer: "preparer";
    reviewer: "reviewer";
}>;
export type SignOffRole = z.infer<typeof SignOffRoleSchema>;
export declare const SignOffSchema: z.ZodObject<{
    role: z.ZodEnum<{
        preparer: "preparer";
        reviewer: "reviewer";
    }>;
    actor: z.ZodString;
    at: z.ZodString;
    comment: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type SignOff = z.infer<typeof SignOffSchema>;
export declare const WorkpaperSchema: z.ZodObject<{
    id: z.ZodString;
    engagementId: z.ZodString;
    controlId: z.ZodString;
    testResultId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    markdown: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<{
        approved: "approved";
        draft: "draft";
        "in-review": "in-review";
    }>>;
    signOffs: z.ZodDefault<z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<{
            preparer: "preparer";
            reviewer: "reviewer";
        }>;
        actor: z.ZodString;
        at: z.ZodString;
        comment: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    reviewNotes: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        author: z.ZodString;
        text: z.ZodString;
        status: z.ZodDefault<z.ZodEnum<{
            open: "open";
            resolved: "resolved";
        }>>;
        createdAt: z.ZodString;
        resolvedBy: z.ZodOptional<z.ZodString>;
        resolvedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type Workpaper = z.infer<typeof WorkpaperSchema>;
/** The preparer and reviewer sign-offs, if present. */
export declare function findSignOff(workpaper: Workpaper, role: SignOffRole): SignOff | undefined;
//# sourceMappingURL=workpaper.d.ts.map