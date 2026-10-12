import * as z from 'zod';
import { IdSchema } from '../domain/common.js';
import { ControlFrequencySchema } from '../domain/control.js';
import { MAX_POPULATION_ITEMS, populationSize } from '../domain/population.js';
import { SamplingMethodSchema } from '../domain/sample.js';
import { AttributeResultSchema, TestConclusionSchema } from '../domain/test-result.js';
import { haphazardSelection, hashSeed, randomSelection, systematicSelection } from '../util/sampling.js';
import { computeSampleSize } from '../util/sampling.js';
const RiskLevelSchema = z.enum(['low', 'moderate', 'high']);
function ok(output) {
    return {
        content: [{ type: 'text', text: JSON.stringify(output) }],
        structuredContent: output
    };
}
function fail(message) {
    return { content: [{ type: 'text', text: message }], isError: true };
}
async function guard(fn) {
    try {
        return await fn();
    }
    catch (error) {
        return fail(error instanceof Error ? error.message : String(error));
    }
}
function referencesFor(population) {
    if (population.items.length > 0)
        return population.items.map((item) => item.reference);
    const size = population.declaredSize ?? 0;
    return Array.from({ length: size }, (_, i) => `#${String(i + 1).padStart(4, '0')}`);
}
/** Registers the sampling and testing tools (COSO principles 10, 11, 16). */
export function registerTestingTools(server, deps) {
    const { store, actor } = deps;
    server.registerTool('compute_sample_size', {
        title: 'Compute a sample size',
        description: 'Recommend a sample size for a control from its frequency, risk and population size, with a documented rationale.',
        inputSchema: z.object({
            frequency: ControlFrequencySchema,
            risk: RiskLevelSchema.default('moderate'),
            populationSize: z.number().int().positive().optional(),
            priorDeficiency: z.boolean().default(false),
            externalReliance: z.boolean().default(false)
        }),
        outputSchema: z.object({
            frequency: z.string(),
            requestedRisk: z.string(),
            effectiveRisk: z.string(),
            recommended: z.number(),
            populationSize: z.number().optional(),
            capped: z.boolean(),
            rationale: z.string()
        })
    }, async (input) => {
        const result = computeSampleSize({
            frequency: input.frequency,
            risk: input.risk,
            populationSize: input.populationSize,
            priorDeficiency: input.priorDeficiency,
            externalReliance: input.externalReliance
        });
        return ok({ ...result });
    });
    server.registerTool('create_population', {
        title: 'Create a population',
        description: 'Register the population for a control — either an explicit item list or a declared size. Bounded to ' +
            `${MAX_POPULATION_ITEMS} items.`,
        inputSchema: z
            .object({
            engagementId: IdSchema,
            controlId: IdSchema.optional(),
            description: z.string().min(1),
            period: z.string().optional(),
            currency: z.string().optional(),
            items: z
                .array(z.object({
                reference: z.string().min(1),
                date: z.string().optional(),
                amount: z.number().optional()
            }))
                .max(MAX_POPULATION_ITEMS)
                .optional(),
            declaredSize: z.number().int().nonnegative().optional()
        })
            .refine((value) => (value.items && value.items.length > 0) || value.declaredSize !== undefined, { message: 'Provide either a non-empty `items` array or a `declaredSize`.' }),
        outputSchema: z.object({ population: z.unknown() })
    }, async ({ engagementId, ...input }) => guard(async () => {
        const population = await store.addPopulation(engagementId, input, actor);
        return ok({ population });
    }));
    server.registerTool('list_populations', {
        title: 'List populations',
        description: 'List the populations registered for an engagement.',
        inputSchema: z.object({ engagementId: IdSchema }),
        outputSchema: z.object({ count: z.number(), populations: z.array(z.unknown()) })
    }, async ({ engagementId }) => guard(async () => {
        const populations = await store.listPopulations(engagementId);
        return ok({ count: populations.length, populations });
    }));
    server.registerTool('select_sample', {
        title: 'Select a sample',
        description: 'Select a reproducible sample from a population. Seeded (deterministic) for random/systematic/haphazard; targeted takes explicit references. Records the method, seed and references.',
        inputSchema: z
            .object({
            engagementId: IdSchema,
            populationId: IdSchema,
            controlId: IdSchema.optional(),
            method: SamplingMethodSchema,
            sampleSize: z.number().int().positive().optional(),
            seed: z.number().int().nonnegative().optional(),
            rationale: z.string().optional(),
            targetedReferences: z.array(z.string().min(1)).optional()
        })
            .refine((value) => value.method !== 'targeted' || (value.targetedReferences?.length ?? 0) > 0, { message: 'Targeted selection requires `targetedReferences`.' })
            .refine((value) => value.method === 'targeted' || value.sampleSize !== undefined, {
            message: '`sampleSize` is required for non-targeted selection.'
        }),
        outputSchema: z.object({ sample: z.unknown() })
    }, async ({ engagementId, populationId, controlId, method, sampleSize, seed, rationale, targetedReferences }) => guard(async () => {
        const population = await store.getPopulation(engagementId, populationId);
        if (!population)
            throw new Error(`Population not found: ${populationId}`);
        const size = populationSize(population);
        if (size === 0)
            throw new Error('Population has no items.');
        const references = referencesFor(population);
        const chosenSeed = seed ??
            hashSeed([
                engagementId,
                controlId ?? '',
                populationId,
                method,
                String(sampleSize ?? targetedReferences?.length ?? 0)
            ]);
        let selectedReferences;
        let effectiveSize;
        if (method === 'targeted') {
            const requested = targetedReferences ?? [];
            const unknown = requested.filter((ref) => !references.includes(ref));
            if (unknown.length > 0) {
                throw new Error(`Targeted references not in the population: ${unknown.join(', ')}`);
            }
            selectedReferences = [...new Set(requested)];
            effectiveSize = selectedReferences.length;
        }
        else {
            const n = Math.min(sampleSize, size);
            const indices = method === 'systematic'
                ? systematicSelection(size, n, chosenSeed)
                : method === 'haphazard'
                    ? haphazardSelection(size, n, chosenSeed)
                    : randomSelection(size, n, chosenSeed);
            selectedReferences = indices.map((index) => references[index - 1]);
            effectiveSize = n;
        }
        const sample = await store.addSample(engagementId, {
            controlId,
            populationId,
            method,
            sampleSize: effectiveSize,
            seed: chosenSeed,
            selectedReferences,
            rationale
        }, actor);
        return ok({ sample });
    }));
    server.registerTool('record_test_result', {
        title: 'Record a test result',
        description: 'Record attribute-level outcomes (pass/fail/na) for a tested sample, with an optional conclusion.',
        inputSchema: z.object({
            engagementId: IdSchema,
            controlId: IdSchema,
            sampleId: IdSchema,
            populationId: IdSchema.optional(),
            attribute: z.string().min(1).describe('The control attribute/objective tested.'),
            procedure: z.string().optional(),
            results: z.array(AttributeResultSchema).min(1),
            conclusion: TestConclusionSchema.optional(),
            preparedBy: z.string().optional()
        }),
        outputSchema: z.object({ testResult: z.unknown() })
    }, async ({ engagementId, ...input }) => guard(async () => {
        const testResult = await store.addTestResult(engagementId, input, actor);
        return ok({ testResult });
    }));
    server.registerTool('list_test_results', {
        title: 'List test results',
        description: 'List the test results recorded for an engagement.',
        inputSchema: z.object({ engagementId: IdSchema }),
        outputSchema: z.object({ count: z.number(), testResults: z.array(z.unknown()) })
    }, async ({ engagementId }) => guard(async () => {
        const testResults = await store.listTestResults(engagementId);
        return ok({ count: testResults.length, testResults });
    }));
    server.registerTool('note_exception', {
        title: 'Note an exception',
        description: 'Record an exception identified during testing, with root cause, impact and any compensating control.',
        inputSchema: z.object({
            engagementId: IdSchema,
            testResultId: IdSchema,
            reference: z.string().min(1).describe('The sample item reference the exception relates to.'),
            description: z.string().min(1),
            rootCause: z.string().optional(),
            impact: z.string().optional(),
            compensatingControl: z.string().optional()
        }),
        outputSchema: z.object({ exception: z.unknown() })
    }, async ({ engagementId, ...input }) => guard(async () => {
        const exception = await store.addException(engagementId, input, actor);
        return ok({ exception });
    }));
    server.registerTool('list_exceptions', {
        title: 'List exceptions',
        description: 'List the exceptions recorded for an engagement.',
        inputSchema: z.object({ engagementId: IdSchema }),
        outputSchema: z.object({ count: z.number(), exceptions: z.array(z.unknown()) })
    }, async ({ engagementId }) => guard(async () => {
        const exceptions = await store.listExceptions(engagementId);
        return ok({ count: exceptions.length, exceptions });
    }));
}
//# sourceMappingURL=testing.js.map