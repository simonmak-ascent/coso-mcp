import * as z from 'zod';
export declare const LikelihoodSchema: z.ZodEnum<{
    high: "high";
    low: "low";
    medium: "medium";
}>;
export type Likelihood = z.infer<typeof LikelihoodSchema>;
export declare const RiskStatusSchema: z.ZodEnum<{
    accepted: "accepted";
    mitigated: "mitigated";
    open: "open";
}>;
export type RiskStatus = z.infer<typeof RiskStatusSchema>;
/** COSO principle number, 1–17. */
export declare const PrincipleNumberSchema: z.ZodNumber;
export declare const RiskSchema: z.ZodObject<{
    id: z.ZodString;
    engagementId: z.ZodString;
    description: z.ZodString;
    cause: z.ZodOptional<z.ZodString>;
    impact: z.ZodOptional<z.ZodString>;
    likelihood: z.ZodDefault<z.ZodEnum<{
        high: "high";
        low: "low";
        medium: "medium";
    }>>;
    assertions: z.ZodDefault<z.ZodArray<z.ZodEnum<{
        accuracy: "accuracy";
        completeness: "completeness";
        "existence-occurrence": "existence-occurrence";
        "obligations-rights": "obligations-rights";
        "presentation-disclosure": "presentation-disclosure";
        valuation: "valuation";
    }>>>;
    principles: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    fraud: z.ZodDefault<z.ZodBoolean>;
    scopeItemId: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<{
        accepted: "accepted";
        mitigated: "mitigated";
        open: "open";
    }>>;
    createdAt: z.ZodString;
}, z.core.$strip>;
export type Risk = z.infer<typeof RiskSchema>;
//# sourceMappingURL=risk.d.ts.map