import * as z from 'zod';
/** Maximum population items accepted (bounded input). */
export declare const MAX_POPULATION_ITEMS = 10000;
export declare const PopulationItemSchema: z.ZodObject<{
    reference: z.ZodString;
    date: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type PopulationItem = z.infer<typeof PopulationItemSchema>;
export declare const PopulationSchema: z.ZodObject<{
    id: z.ZodString;
    engagementId: z.ZodString;
    controlId: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    period: z.ZodOptional<z.ZodString>;
    currency: z.ZodOptional<z.ZodString>;
    items: z.ZodDefault<z.ZodArray<z.ZodObject<{
        reference: z.ZodString;
        date: z.ZodOptional<z.ZodString>;
        amount: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>>;
    declaredSize: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodString;
}, z.core.$strip>;
export type Population = z.infer<typeof PopulationSchema>;
/** Effective population size: item count, else the declared size. */
export declare function populationSize(population: Population): number;
//# sourceMappingURL=population.d.ts.map