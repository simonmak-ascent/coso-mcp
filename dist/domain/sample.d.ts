import * as z from 'zod';
export declare const SamplingMethodSchema: z.ZodEnum<{
    haphazard: "haphazard";
    random: "random";
    systematic: "systematic";
    targeted: "targeted";
}>;
export type SamplingMethod = z.infer<typeof SamplingMethodSchema>;
export declare const SampleSchema: z.ZodObject<{
    id: z.ZodString;
    engagementId: z.ZodString;
    controlId: z.ZodOptional<z.ZodString>;
    populationId: z.ZodString;
    method: z.ZodEnum<{
        haphazard: "haphazard";
        random: "random";
        systematic: "systematic";
        targeted: "targeted";
    }>;
    sampleSize: z.ZodNumber;
    seed: z.ZodNumber;
    selectedReferences: z.ZodDefault<z.ZodArray<z.ZodString>>;
    rationale: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
}, z.core.$strip>;
export type Sample = z.infer<typeof SampleSchema>;
//# sourceMappingURL=sample.d.ts.map