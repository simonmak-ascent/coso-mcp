import * as z from 'zod';
/** ICFR severity classification (PCAOB AS 2201 terms). */
export declare const SeveritySchema: z.ZodEnum<{
    deficiency: "deficiency";
    "material-weakness": "material-weakness";
    "significant-deficiency": "significant-deficiency";
}>;
export type Severity = z.infer<typeof SeveritySchema>;
export declare const DeficiencyLikelihoodSchema: z.ZodEnum<{
    "more-than-remote": "more-than-remote";
    "reasonably-possible": "reasonably-possible";
    remote: "remote";
}>;
export type DeficiencyLikelihood = z.infer<typeof DeficiencyLikelihoodSchema>;
export declare const MagnitudeSchema: z.ZodEnum<{
    inconsequential: "inconsequential";
    material: "material";
    "more-than-inconsequential": "more-than-inconsequential";
}>;
export type Magnitude = z.infer<typeof MagnitudeSchema>;
export declare const RemediationSchema: z.ZodObject<{
    rootCause: z.ZodOptional<z.ZodString>;
    actions: z.ZodOptional<z.ZodString>;
    owner: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    retestPlan: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type Remediation = z.infer<typeof RemediationSchema>;
export declare const DeficiencySchema: z.ZodObject<{
    id: z.ZodString;
    engagementId: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    likelihood: z.ZodEnum<{
        "more-than-remote": "more-than-remote";
        "reasonably-possible": "reasonably-possible";
        remote: "remote";
    }>;
    magnitude: z.ZodEnum<{
        inconsequential: "inconsequential";
        material: "material";
        "more-than-inconsequential": "more-than-inconsequential";
    }>;
    pervasive: z.ZodDefault<z.ZodBoolean>;
    severity: z.ZodEnum<{
        deficiency: "deficiency";
        "material-weakness": "material-weakness";
        "significant-deficiency": "significant-deficiency";
    }>;
    rationale: z.ZodString;
    controlId: z.ZodOptional<z.ZodString>;
    testResultId: z.ZodOptional<z.ZodString>;
    exceptionIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
    compensatingControl: z.ZodOptional<z.ZodString>;
    remediation: z.ZodOptional<z.ZodObject<{
        rootCause: z.ZodOptional<z.ZodString>;
        actions: z.ZodOptional<z.ZodString>;
        owner: z.ZodOptional<z.ZodString>;
        dueDate: z.ZodOptional<z.ZodString>;
        retestPlan: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    createdAt: z.ZodString;
}, z.core.$strip>;
export type Deficiency = z.infer<typeof DeficiencySchema>;
//# sourceMappingURL=deficiency.d.ts.map