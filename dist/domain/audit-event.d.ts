import * as z from 'zod';
export declare const AuditEntityTypeSchema: z.ZodEnum<{
    control: "control";
    deficiency: "deficiency";
    engagement: "engagement";
    exception: "exception";
    population: "population";
    risk: "risk";
    sample: "sample";
    scope: "scope";
    test: "test";
    workpaper: "workpaper";
}>;
export declare const AuditEventSchema: z.ZodObject<{
    at: z.ZodString;
    actor: z.ZodDefault<z.ZodString>;
    action: z.ZodString;
    entityType: z.ZodEnum<{
        control: "control";
        deficiency: "deficiency";
        engagement: "engagement";
        exception: "exception";
        population: "population";
        risk: "risk";
        sample: "sample";
        scope: "scope";
        test: "test";
        workpaper: "workpaper";
    }>;
    entityId: z.ZodString;
    engagementId: z.ZodString;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;
//# sourceMappingURL=audit-event.d.ts.map