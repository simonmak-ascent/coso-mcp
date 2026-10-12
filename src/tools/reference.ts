import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod';

import { ASSERTIONS } from '../domain/assertions.js';
import {
  COMPONENT_IDS,
  framework,
  getComponent,
  getPrincipleById,
  getPrincipleByNumber,
  listComponents,
  listObjectiveCategories,
  listPrinciples
} from '../framework/query.js';

const ComponentIdSchema = z.enum([
  'control-environment',
  'risk-assessment',
  'control-activities',
  'information-communication',
  'monitoring-activities'
]);

/** Registers the COSO reference (read-only) tools. */
export function registerReferenceTools(server: McpServer): void {
  server.registerTool(
    'list_components',
    {
      title: 'List COSO components',
      description:
        'List the five components of the COSO Internal Control—Integrated Framework (ICIF-2013).',
      inputSchema: z.object({}),
      outputSchema: z.object({
        framework: z.string(),
        count: z.number(),
        components: z.array(
          z.object({
            id: ComponentIdSchema,
            number: z.number(),
            name: z.string(),
            summary: z.string(),
            principles: z.array(z.number())
          })
        )
      })
    },
    async () => {
      const components = listComponents();
      const output = {
        framework: framework().label,
        count: components.length,
        components: components.map((component) => ({
          id: component.id,
          number: component.number,
          name: component.name,
          summary: component.summary,
          principles: component.principles
        }))
      };
      return { content: [{ type: 'text', text: JSON.stringify(output) }], structuredContent: output };
    }
  );

  server.registerTool(
    'list_principles',
    {
      title: 'List COSO principles',
      description:
        'List the 17 principles of the COSO ICIF-2013, optionally filtered to a single component.',
      inputSchema: z.object({
        component: ComponentIdSchema.optional().describe(
          'Restrict to a single component id.'
        )
      }),
      outputSchema: z.object({
        framework: z.string(),
        count: z.number(),
        principles: z.array(
          z.object({
            number: z.number(),
            id: z.string(),
            component: ComponentIdSchema,
            statement: z.string()
          })
        )
      })
    },
    async ({ component }) => {
      const principles = listPrinciples(component);
      const output = {
        framework: framework().label,
        count: principles.length,
        principles: principles.map((principle) => ({
          number: principle.number,
          id: principle.id,
          component: principle.component,
          statement: principle.statement
        }))
      };
      return { content: [{ type: 'text', text: JSON.stringify(output) }], structuredContent: output };
    }
  );

  server.registerTool(
    'get_principle',
    {
      title: 'Get a COSO principle',
      description:
        'Return a single COSO principle by framework number or slug, including its paraphrased points of focus.',
      inputSchema: z
        .object({
          number: z.number().int().min(1).max(17).optional(),
          id: z.string().optional()
        })
        .refine((value) => value.number !== undefined || value.id !== undefined, {
          message: 'Provide either `number` or `id`.'
        }),
      outputSchema: z.object({
        found: z.boolean(),
        principle: z
          .object({
            number: z.number(),
            id: z.string(),
            component: ComponentIdSchema,
            statement: z.string(),
            pointsOfFocus: z.array(z.object({ id: z.string(), summary: z.string() }))
          })
          .nullable()
      })
    },
    async ({ number, id }) => {
      const principle =
        number !== undefined ? getPrincipleByNumber(number) : id ? getPrincipleById(id) : undefined;
      const output = {
        found: principle !== undefined,
        principle: principle
          ? {
              number: principle.number,
              id: principle.id,
              component: principle.component,
              statement: principle.statement,
              pointsOfFocus: principle.pointsOfFocus
            }
          : null
      };
      return { content: [{ type: 'text', text: JSON.stringify(output) }], structuredContent: output };
    }
  );

  server.registerTool(
    'get_component',
    {
      title: 'Get a COSO component',
      description: 'Return a single COSO component by id, with its principles.',
      inputSchema: z.object({ id: ComponentIdSchema }),
      outputSchema: z.object({
        found: z.boolean(),
        component: z
          .object({
            id: ComponentIdSchema,
            number: z.number(),
            name: z.string(),
            summary: z.string(),
            principles: z.array(z.number())
          })
          .nullable()
      })
    },
    async ({ id }) => {
      const component = getComponent(id);
      const output = {
        found: component !== undefined,
        component: component
          ? {
              id: component.id,
              number: component.number,
              name: component.name,
              summary: component.summary,
              principles: component.principles
            }
          : null
      };
      return { content: [{ type: 'text', text: JSON.stringify(output) }], structuredContent: output };
    }
  );

  server.registerTool(
    'list_objective_categories',
    {
      title: 'List COSO objective categories',
      description:
        'List the three COSO objective categories (operations, reporting, compliance).',
      inputSchema: z.object({}),
      outputSchema: z.object({
        count: z.number(),
        objectiveCategories: z.array(
          z.object({ id: z.string(), name: z.string(), summary: z.string() })
        )
      })
    },
    async () => {
      const objectiveCategories = listObjectiveCategories();
      const output = { count: objectiveCategories.length, objectiveCategories };
      return { content: [{ type: 'text', text: JSON.stringify(output) }], structuredContent: output };
    }
  );

  server.registerTool(
    'list_assertions',
    {
      title: 'List audit assertions (CEAVOP)',
      description:
        'List the assertions used to frame control objectives: completeness, existence/occurrence, accuracy, valuation, obligations/rights, presentation/disclosure.',
      inputSchema: z.object({}),
      outputSchema: z.object({
        count: z.number(),
        assertions: z.array(z.object({ id: z.string(), label: z.string() }))
      })
    },
    async () => {
      const assertions = ASSERTIONS.map((assertion) => ({
        id: assertion.id,
        label: assertion.label
      }));
      const output = { count: assertions.length, assertions };
      return { content: [{ type: 'text', text: JSON.stringify(output) }], structuredContent: output };
    }
  );

  server.registerResource(
    'icif-2013',
    'coso://framework/icif-2013',
    {
      title: 'COSO ICIF-2013 framework reference',
      description:
        'The full COSO Internal Control—Integrated Framework reference: components, principles, points of focus and objective categories.',
      mimeType: 'application/json'
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(framework(), null, 2)
        }
      ]
    })
  );
}

/** Exported for tests. */
export { COMPONENT_IDS };
