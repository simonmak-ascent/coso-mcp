import * as z from 'zod';
export declare const ControlTypeSchema: z.ZodEnum<{
    automated: "automated";
    "it-dependent-manual": "it-dependent-manual";
    manual: "manual";
}>;
export type ControlType = z.infer<typeof ControlTypeSchema>;
export declare const ControlFrequencySchema: z.ZodEnum<{
    annual: "annual";
    daily: "daily";
    monthly: "monthly";
    "per-transaction": "per-transaction";
    quarterly: "quarterly";
    weekly: "weekly";
}>;
export type ControlFrequency = z.infer<typeof ControlFrequencySchema>;
export declare const ControlStatusSchema: z.ZodEnum<{
    active: "active";
    draft: "draft";
    retired: "retired";
}>;
export type ControlStatus = z.infer<typeof ControlStatusSchema>;
export declare const ControlSchema: z.ZodObject<{
    id: z.ZodString;
    engagementId: z.ZodString;
    description: z.ZodString;
    type: z.ZodEnum<{
        automated: "automated";
        "it-dependent-manual": "it-dependent-manual";
        manual: "manual";
    }>;
    frequency: z.ZodEnum<{
        annual: "annual";
        daily: "daily";
        monthly: "monthly";
        "per-transaction": "per-transaction";
        quarterly: "quarterly";
        weekly: "weekly";
    }>;
    key: z.ZodDefault<z.ZodBoolean>;
    riskIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
    assertions: z.ZodDefault<z.ZodArray<z.ZodEnum<{
        accuracy: "accuracy";
        completeness: "completeness";
        "existence-occurrence": "existence-occurrence";
        "obligations-rights": "obligations-rights";
        "presentation-disclosure": "presentation-disclosure";
        valuation: "valuation";
    }>>>;
    principles: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    owner: z.ZodOptional<z.ZodString>;
    scopeItemId: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<{
        active: "active";
        draft: "draft";
        retired: "retired";
    }>>;
    createdAt: z.ZodString;
}, z.core.$strip>;
export type Control = z.infer<typeof ControlSchema>;
//# sourceMappingURL=control.d.ts.map