import * as z from 'zod';
export declare const ObjectiveCategoryIdSchema: z.ZodEnum<{
    compliance: "compliance";
    operations: "operations";
    reporting: "reporting";
}>;
export type ObjectiveCategoryId = z.infer<typeof ObjectiveCategoryIdSchema>;
export declare const EngagementStatusSchema: z.ZodEnum<{
    active: "active";
    closed: "closed";
    draft: "draft";
}>;
export type EngagementStatus = z.infer<typeof EngagementStatusSchema>;
export declare const MaterialitySchema: z.ZodObject<{
    basis: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type Materiality = z.infer<typeof MaterialitySchema>;
export declare const EngagementSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    entity: z.ZodString;
    period: z.ZodOptional<z.ZodString>;
    framework: z.ZodDefault<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<{
        active: "active";
        closed: "closed";
        draft: "draft";
    }>>;
    materiality: z.ZodOptional<z.ZodObject<{
        basis: z.ZodOptional<z.ZodString>;
        amount: z.ZodOptional<z.ZodNumber>;
        currency: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    createdBy: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type Engagement = z.infer<typeof EngagementSchema>;
//# sourceMappingURL=engagement.d.ts.map