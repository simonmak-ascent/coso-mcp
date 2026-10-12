import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod';

import { IdSchema } from '../domain/common.js';
import {
  DeficiencyLikelihoodSchema,
  MagnitudeSchema,
  RemediationSchema
} from '../domain/deficiency.js';
import { PrincipleNumberSchema } from '../domain/risk.js';
import { renderEngagementReport } from '../render/report.js';
import type { EngagementStore } from '../store/types.js';
import {
  assessComponents,
  assessPrinciples,
  integrationCheck
} from '../util/assessment.js';
import { aggregateDeficiencies, classifyDeficiency } from '../util/deficiency.js';

export interface AssessmentToolDeps {
  store: EngagementStore;
  actor: string;
}

const ComponentIdSchema = z.enum([
  'control-environment',
  'risk-assessment',
  'control-activities',
  'information-communication',
  'monitoring-activities'
]);

function ok(output: Record<string, unknown>) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(output) }],
    structuredContent: output
  };
}

function fail(message: string) {
  return { content: [{ type: 'text' as const, text: message }], isError: true as const };
}

async function guard<T>(fn: () => Promise<T>): Promise<T | ReturnType<typeof fail>> {
  try {
    return await fn();
  } catch (error) {
    return fail(error instanceof Error ? error.message : String(error));
  }
}

/** Registers the deficiency-evaluation, assessment and reporting tools. */
export function registerAssessmentTools(server: McpServer, deps: AssessmentToolDeps): void {
  const { store, actor } = deps;

  server.registerTool(
    'classify_deficiency',
    {
      title: 'Classify a deficiency',
      description:
        'Classify a control deficiency as deficiency / significant deficiency / material weakness from likelihood × magnitude (escalates for a pervasive control).',
      inputSchema: z.object({
        engagementId: IdSchema,
        title: z.string().min(1),
        description: z.string().min(1),
        likelihood: DeficiencyLikelihoodSchema,
        magnitude: MagnitudeSchema,
        pervasive: z.boolean().default(false),
        controlId: IdSchema.optional(),
        testResultId: IdSchema.optional(),
        exceptionIds: z.array(IdSchema).default([]),
        compensatingControl: z.string().optional(),
        remediation: RemediationSchema.optional()
      }),
      outputSchema: z.object({ deficiency: z.unknown() })
    },
    async ({ engagementId, ...input }) =>
      guard(async () => {
        const classification = classifyDeficiency({
          likelihood: input.likelihood,
          magnitude: input.magnitude,
          pervasive: input.pervasive
        });
        const deficiency = await store.addDeficiency(
          engagementId,
          {
            ...input,
            severity: classification.severity,
            rationale: classification.rationale
          },
          actor
        );
        return ok({ deficiency });
      })
  );

  server.registerTool(
    'list_deficiencies',
    {
      title: 'List deficiencies',
      description: 'List the deficiencies recorded for an engagement.',
      inputSchema: z.object({ engagementId: IdSchema }),
      outputSchema: z.object({ count: z.number(), deficiencies: z.array(z.unknown()) })
    },
    async ({ engagementId }) =>
      guard(async () => {
        const deficiencies = await store.listDeficiencies(engagementId);
        return ok({ count: deficiencies.length, deficiencies });
      })
  );

  server.registerTool(
    'aggregate_deficiencies',
    {
      title: 'Aggregate deficiencies',
      description:
        'Group related deficiencies by control, flag combinations that may aggregate, and report the overall severity.',
      inputSchema: z.object({
        engagementId: IdSchema,
        deficiencyIds: z.array(IdSchema).optional()
      }),
      outputSchema: z.object({ aggregation: z.unknown() })
    },
    async ({ engagementId, deficiencyIds }) =>
      guard(async () => {
        const all = await store.listDeficiencies(engagementId);
        const selected =
          deficiencyIds && deficiencyIds.length > 0
            ? all.filter((deficiency) => deficiencyIds.includes(deficiency.id))
            : all;
        return ok({ aggregation: aggregateDeficiencies(selected) });
      })
  );

  server.registerTool(
    'assess_principle',
    {
      title: 'Assess a COSO principle (indicators)',
      description:
        'Report data-driven coverage indicators for one COSO principle (controls, risks and deficiencies mapped to it).',
      inputSchema: z.object({
        engagementId: IdSchema,
        number: PrincipleNumberSchema
      }),
      outputSchema: z.object({ found: z.boolean(), assessment: z.unknown().nullable() })
    },
    async ({ engagementId, number }) =>
      guard(async () => {
        const [controls, risks, deficiencies] = await Promise.all([
          store.listControls(engagementId),
          store.listRisks(engagementId),
          store.listDeficiencies(engagementId)
        ]);
        const assessment = assessPrinciples({ controls, risks, deficiencies }).find(
          (principle) => principle.number === number
        );
        return ok({ found: assessment !== undefined, assessment: assessment ?? null });
      })
  );

  server.registerTool(
    'assess_component',
    {
      title: 'Assess a COSO component (indicators)',
      description:
        'Report coverage indicators for one COSO component, aggregating its principles.',
      inputSchema: z.object({ engagementId: IdSchema, id: ComponentIdSchema }),
      outputSchema: z.object({ found: z.boolean(), assessment: z.unknown().nullable() })
    },
    async ({ engagementId, id }) =>
      guard(async () => {
        const [controls, risks, deficiencies] = await Promise.all([
          store.listControls(engagementId),
          store.listRisks(engagementId),
          store.listDeficiencies(engagementId)
        ]);
        const assessment = assessComponents(controls, risks, deficiencies).find(
          (component) => component.id === id
        );
        return ok({ found: assessment !== undefined, assessment: assessment ?? null });
      })
  );

  server.registerTool(
    'framework_integration_check',
    {
      title: 'Framework integration check',
      description:
        'Check that all five COSO components have some recorded coverage and that principles are addressed.',
      inputSchema: z.object({ engagementId: IdSchema }),
      outputSchema: z.object({
        integration: z.unknown(),
        components: z.array(z.unknown())
      })
    },
    async ({ engagementId }) =>
      guard(async () => {
        const [controls, risks, deficiencies] = await Promise.all([
          store.listControls(engagementId),
          store.listRisks(engagementId),
          store.listDeficiencies(engagementId)
        ]);
        const components = assessComponents(controls, risks, deficiencies);
        return ok({
          integration: integrationCheck(components),
          components: components.map((component) => ({
            id: component.id,
            name: component.name,
            status: component.status,
            controls: component.controls,
            risks: component.risks,
            deficiencies: component.deficiencies
          }))
        });
      })
  );

  server.registerTool(
    'generate_report',
    {
      title: 'Generate the review report',
      description:
        'Generate a Markdown internal-control review report: scope, risks, controls, testing, workpapers, deficiencies and COSO coverage.',
      inputSchema: z.object({ engagementId: IdSchema }),
      outputSchema: z.object({ markdown: z.string(), counts: z.unknown() })
    },
    async ({ engagementId }) =>
      guard(async () => {
        const engagement = await store.getEngagement(engagementId);
        if (!engagement) throw new Error(`Engagement not found: ${engagementId}`);
        const [scopeItems, risks, controls, samples, testResults, exceptions, workpapers, deficiencies] =
          await Promise.all([
            store.listScopeItems(engagementId),
            store.listRisks(engagementId),
            store.listControls(engagementId),
            store.listSamples(engagementId),
            store.listTestResults(engagementId),
            store.listExceptions(engagementId),
            store.listWorkpapers(engagementId),
            store.listDeficiencies(engagementId)
          ]);
        const componentAssessments = assessComponents(controls, risks, deficiencies);
        const integration = integrationCheck(componentAssessments);
        const markdown = renderEngagementReport({
          engagement,
          scopeItems,
          risks,
          controls,
          samples,
          testResults,
          exceptions,
          workpapers,
          deficiencies,
          componentAssessments,
          integration
        });
        return ok({
          markdown,
          counts: {
            scopeItems: scopeItems.length,
            risks: risks.length,
            controls: controls.length,
            samples: samples.length,
            testResults: testResults.length,
            exceptions: exceptions.length,
            workpapers: workpapers.length,
            deficiencies: deficiencies.length
          }
        });
      })
  );
}
