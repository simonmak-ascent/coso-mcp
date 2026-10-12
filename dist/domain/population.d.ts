import * as z from 'zod';
/** Maximum population items accepted (bounded input). */
export declare const MAX_POPULATION_ITEMS = 10000;
export declare const PopulationItemSchema: any;
export type PopulationItem = z.infer<typeof PopulationItemSchema>;
export declare const PopulationSchema: any;
export type Population = z.infer<typeof PopulationSchema>;
/** Effective population size: item count, else the declared size. */
export declare function populationSize(population: Population): number;
//# sourceMappingURL=population.d.ts.map