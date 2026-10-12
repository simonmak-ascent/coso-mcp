import * as z from 'zod';

import { IdSchema, TimestampSchema } from './common.js';

/** Maximum population items accepted (bounded input). */
export const MAX_POPULATION_ITEMS = 10_000;

export const PopulationItemSchema = z.object({
  reference: z.string().min(1).describe('Unique item reference/id within the population.'),
  date: z.string().optional(),
  amount: z.number().optional()
});
export type PopulationItem = z.infer<typeof PopulationItemSchema>;

export const PopulationSchema = z.object({
  id: IdSchema,
  engagementId: IdSchema,
  controlId: IdSchema.optional(),
  description: z.string().min(1),
  period: z.string().optional(),
  currency: z.string().optional(),
  items: z.array(PopulationItemSchema).default([]),
  /** When `items` is empty, the declared number of items (references synthesised as `#0001`…). */
  declaredSize: z.number().int().nonnegative().optional(),
  createdAt: TimestampSchema
});
export type Population = z.infer<typeof PopulationSchema>;

/** Effective population size: item count, else the declared size. */
export function populationSize(population: Population): number {
  return population.items.length > 0 ? population.items.length : (population.declaredSize ?? 0);
}
