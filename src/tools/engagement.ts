import { ResourceTemplate, type McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod';

import { AssertionIdSchema } from '../domain/assertions.js';
import { IdSchema } from '../domain/common.js';
import { ControlFrequencySchema, ControlTypeSchema } from '../domain/control.js';
import { ObjectiveCategoryIdSchema } from '../domain/engagement.js';
import { LikelihoodSchema, PrincipleNumberSchema } from '../domain/risk.js';
import type { EngagementStore } from '../store/types.js';

export interface EngagementToolDeps {
  store: EngagementStore;
  actor: string;
}

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

/** Registers the engagement / planning tools and the engagement resource. */
export function registerEngagementTools(server: McpServer, deps: EngagementToolDeps): void {
  const { store, actor } = deps;

  server.registerTool(
    'create_engagement',
    {
      title: 'Create an engagement',
      description:
        'Create a new internal-control review engagement. Returns the engagement id used by all later tools.',
      inputSchema: z.object({
        title: z.string().min(1).describe('Engagement title.'),
        entity: z.string().min(1).describe('Entity or business unit under review.'),
        period: z.string().min(1).optional().describe('Review period, e.g. 2025 or 2025-H2.'),
        id: IdSchema.optional().describe('Optional explicit engagement id.'),
        materiality: z
          .object({
            basis: z.string().optional(),
            amount: z.number().optional(),
            currency: z.string().optional()
          })
          .optional()
      }),
      outputSchema: z.object({
        engagement: z.object({
          id: z.string(),
          title: z.string(),
          entity: z.string(),
          period: z.string().optional(),
          framework: z.string(),
          status: z.string(),
          createdAt: z.string(),
          updatedAt: z.string()
        })
      })
    },
    async (input) =>
      guard(async () => {
        const engagement = await store.createEngagement(input, actor);
        return ok({
          engagement: {
            id: engagement.id,
            title: engagement.title,
            entity: engagement.entity,
            period: engagement.period,
            framework: engagement.framework,
            status: engagement.status,
            createdAt: engagement.createdAt,
            updatedAt: engagement.updatedAt
          }
        });
      })
  );

  server.registerTool(
    'get_engagement',
    {
      title: 'Get an engagement',
      description: 'Return an engagement by id.',
      inputSchema: z.object({ id: IdSchema }),
      outputSchema: z.object({ found: z.boolean(), engagement: z.unknown().nullable() })
    },
    async ({ id }) =>
      guard(async () => {
        const engagement = await store.getEngagement(id);
        return ok({ found: engagement !== undefined, engagement: engagement ?? null });
      })
  );

  server.registerTool(
    'list_engagements',
    {
      title: 'List engagements',
      description: 'List all engagement ids and titles.',
      inputSchema: z.object({}),
      outputSchema: z.object({
        count: z.number(),
        engagements: z.array(
          z.object({ id: z.string(), title: z.string(), entity: z.string(), status: z.string() })
        )
      })
    },
    async () =>
      guard(async () => {
        const engagements = await store.listEngagements();
        return ok({
          count: engagements.length,
          engagements: engagements.map((e) => ({
            id: e.id,
            title: e.title,
            entity: e.entity,
            status: e.status
          }))
        });
      })
  );

  server.registerTool(
    'add_scope_item',
    {
      title: 'Add a scope item',
      description:
        'Add a significant account/process to the review scope, with its objective category and assertions.',
      inputSchema: z.object({
        engagementId: IdSchema,
        area: z.string().min(1).describe('Significant account or process.'),
        objectiveCategory: ObjectiveCategoryIdSchema,
        assertions: z.array(AssertionIdSchema).default([]),
        rationale: z.string().optional(),
        inScope: z.boolean().default(true)
      }),
      outputSchema: z.object({ scopeItem: z.unknown() })
    },
    async ({ engagementId, ...input }) =>
      guard(async () => {
        const scopeItem = await store.addScopeItem(engagementId, input, actor);
        return ok({ scopeItem });
      })
  );

  server.registerTool(
    'list_scope_items',
    {
      title: 'List scope items',
      description: 'List the scope items for an engagement.',
      inputSchema: z.object({ engagementId: IdSchema }),
      outputSchema: z.object({ count: z.number(), scopeItems: z.array(z.unknown()) })
    },
    async ({ engagementId }) =>
      guard(async () => {
        const scopeItems = await store.listScopeItems(engagementId);
        return ok({ count: scopeItems.length, scopeItems });
      })
  );

  server.registerTool(
    'register_risk',
    {
      title: 'Register a risk',
      description:
        'Register a risk to objectives, with likelihood, assertions, related COSO principles and a fraud flag.',
      inputSchema: z.object({
        engagementId: IdSchema,
        description: z.string().min(1),
        cause: z.string().optional(),
        impact: z.string().optional(),
        likelihood: LikelihoodSchema.default('medium'),
        assertions: z.array(AssertionIdSchema).default([]),
        principles: z.array(PrincipleNumberSchema).default([]),
        fraud: z.boolean().default(false),
        scopeItemId: IdSchema.optional()
      }),
      outputSchema: z.object({ risk: z.unknown() })
    },
    async ({ engagementId, ...input }) =>
      guard(async () => {
        const risk = await store.addRisk(engagementId, input, actor);
        return ok({ risk });
      })
  );

  server.registerTool(
    'list_risks',
    {
      title: 'List risks',
      description: 'List the risks registered for an engagement.',
      inputSchema: z.object({ engagementId: IdSchema }),
      outputSchema: z.object({ count: z.number(), risks: z.array(z.unknown()) })
    },
    async ({ engagementId }) =>
      guard(async () => {
        const risks = await store.listRisks(engagementId);
        return ok({ count: risks.length, risks });
      })
  );

  server.registerTool(
    'register_control',
    {
      title: 'Register a control',
      description:
        'Register a key control with its type, frequency, linked risks, assertions and COSO principles.',
      inputSchema: z.object({
        engagementId: IdSchema,
        description: z.string().min(1),
        type: ControlTypeSchema,
        frequency: ControlFrequencySchema,
        key: z.boolean().default(true),
        riskIds: z.array(IdSchema).default([]),
        assertions: z.array(AssertionIdSchema).default([]),
        principles: z.array(PrincipleNumberSchema).default([]),
        owner: z.string().optional(),
        scopeItemId: IdSchema.optional()
      }),
      outputSchema: z.object({ control: z.unknown() })
    },
    async ({ engagementId, ...input }) =>
      guard(async () => {
        const control = await store.addControl(engagementId, input, actor);
        return ok({ control });
      })
  );

  server.registerTool(
    'list_controls',
    {
      title: 'List controls',
      description: 'List the controls registered for an engagement.',
      inputSchema: z.object({ engagementId: IdSchema }),
      outputSchema: z.object({ count: z.number(), controls: z.array(z.unknown()) })
    },
    async ({ engagementId }) =>
      guard(async () => {
        const controls = await store.listControls(engagementId);
        return ok({ count: controls.length, controls });
      })
  );

  server.registerTool(
    'get_audit_log',
    {
      title: 'Get the audit log',
      description: 'Return the append-only audit events recorded for an engagement.',
      inputSchema: z.object({ engagementId: IdSchema }),
      outputSchema: z.object({ count: z.number(), events: z.array(z.unknown()) })
    },
    async ({ engagementId }) =>
      guard(async () => {
        const events = await store.listAudit(engagementId);
        return ok({ count: events.length, events });
      })
  );

  server.registerResource(
    'engagement',
    new ResourceTemplate('coso://engagement/{id}', { list: undefined }),
    {
      title: 'Engagement bundle',
      description:
        'An engagement with its scope items, risks and controls, as a JSON document.',
      mimeType: 'application/json'
    },
    async (uri, variables) => {
      const raw = variables.id;
      const id = Array.isArray(raw) ? raw[0] : raw;
      if (typeof id !== 'string' || id.length === 0) {
        throw new Error('Missing engagement id in resource URI.');
      }
      const engagement = await store.getEngagement(id);
      if (!engagement) throw new Error(`Engagement not found: ${id}`);
      const [scopeItems, risks, controls] = await Promise.all([
        store.listScopeItems(id),
        store.listRisks(id),
        store.listControls(id)
      ]);
      const bundle = { engagement, scopeItems, risks, controls };
      return {
        contents: [
          { uri: uri.href, mimeType: 'application/json', text: JSON.stringify(bundle, null, 2) }
        ]
      };
    }
  );
}
