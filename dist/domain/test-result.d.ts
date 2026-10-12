import * as z from 'zod';
export declare const OutcomeSchema: z.ZodEnum<{
    fail: "fail";
    na: "na";
    pass: "pass";
}>;
export type Outcome = z.infer<typeof OutcomeSchema>;
export declare const AttributeResultSchema: z.ZodObject<{
    reference: z.ZodString;
    outcome: z.ZodEnum<{
        fail: "fail";
        na: "na";
        pass: "pass";
    }>;
    evidenceRef: z.ZodOptional<z.ZodString>;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type AttributeResult = z.infer<typeof AttributeResultSchema>;
export declare const TestConclusionSchema: z.ZodEnum<{
    deficiency: "deficiency";
    effective: "effective";
    "effective-with-exceptions": "effective-with-exceptions";
    "not-concluded": "not-concluded";
}>;
export type TestConclusion = z.infer<typeof TestConclusionSchema>;
export declare const TestResultSchema: z.ZodObject<{
    id: z.ZodString;
    engagementId: z.ZodString;
    controlId: z.ZodString;
    sampleId: z.ZodString;
    populationId: z.ZodOptional<z.ZodString>;
    attribute: z.ZodString;
    procedure: z.ZodOptional<z.ZodString>;
    results: z.ZodDefault<z.ZodArray<z.ZodObject<{
        reference: z.ZodString;
        outcome: z.ZodEnum<{
            fail: "fail";
            na: "na";
            pass: "pass";
        }>;
        evidenceRef: z.ZodOptional<z.ZodString>;
        note: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    conclusion: z.ZodOptional<z.ZodEnum<{
        deficiency: "deficiency";
        effective: "effective";
        "effective-with-exceptions": "effective-with-exceptions";
        "not-concluded": "not-concluded";
    }>>;
    preparedBy: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
}, z.core.$strip>;
export type TestResult = z.infer<typeof TestResultSchema>;
export declare const ExceptionSchema: z.ZodObject<{
    id: z.ZodString;
    engagementId: z.ZodString;
    testResultId: z.ZodString;
    reference: z.ZodString;
    description: z.ZodString;
    rootCause: z.ZodOptional<z.ZodString>;
    impact: z.ZodOptional<z.ZodString>;
    compensatingControl: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
}, z.core.$strip>;
export type Exception = z.infer<typeof ExceptionSchema>;
//# sourceMappingURL=test-result.d.ts.map