import * as z from 'zod';
export declare const ScopeItemSchema: z.ZodObject<{
    id: z.ZodString;
    area: z.ZodString;
    objectiveCategory: z.ZodEnum<{
        compliance: "compliance";
        operations: "operations";
        reporting: "reporting";
    }>;
    assertions: z.ZodDefault<z.ZodArray<z.ZodEnum<{
        accuracy: "accuracy";
        completeness: "completeness";
        "existence-occurrence": "existence-occurrence";
        "obligations-rights": "obligations-rights";
        "presentation-disclosure": "presentation-disclosure";
        valuation: "valuation";
    }>>>;
    rationale: z.ZodOptional<z.ZodString>;
    inScope: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodString;
}, z.core.$strip>;
export type ScopeItem = z.infer<typeof ScopeItemSchema>;
//# sourceMappingURL=scope.d.ts.map