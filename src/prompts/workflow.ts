import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod';

import { DISCLAIMER } from '../version.js';

const text = (body: string): { role: 'user'; content: { type: 'text'; text: string } } => ({
  role: 'user',
  content: { type: 'text', text: body }
});

/** Registers the review-workflow prompt templates. */
export function registerWorkflowPrompts(server: McpServer): void {
  server.registerPrompt(
    'scope-review',
    {
      title: 'Scope an internal-control review',
      description:
        'Draft the scope of a COSO internal-control review: objectives, significant accounts/processes, period and materiality.',
      argsSchema: z.object({
        entity: z.string().describe('Entity or business unit under review.'),
        period: z.string().describe('Review period, e.g. 2025 or 2025-H2.'),
        framework: z.string().optional().describe('Default: COSO ICIF-2013.')
      })
    },
    ({ entity, period, framework }) => ({
      messages: [
        text(
          [
            `Scope a COSO internal-control review for ${entity} over ${period}.`,
            `Use ${framework ?? 'the COSO Internal Control—Integrated Framework (ICIF-2013)'}.`,
            '',
            'Produce: (1) the objectives under review by category (operations, reporting, compliance);',
            '(2) significant accounts/processes and the relevant assertions;',
            '(3) materiality and qualitative scoping factors; (4) in-scope locations and systems.',
            'Use the list_components / list_principles tools to anchor coverage to the framework.',
            '',
            DISCLAIMER
          ].join('\n')
        )
      ]
    })
  );

  server.registerPrompt(
    'assess-risk',
    {
      title: 'Assess risks to objectives',
      description:
        'Identify and analyze risks to objectives (including fraud) as the basis for selecting controls (COSO principles 6–9).',
      argsSchema: z.object({
        process: z.string().describe('Process or account in scope.'),
        objective: z.string().describe('Objective the process supports.')
      })
    },
    ({ process, objective }) => ({
      messages: [
        text(
          [
            `Assess risks to the objective "${objective}" within the ${process} process.`,
            '',
            'For each risk record: description, cause, potential misstatement/impact, likelihood,',
            'and the relevant assertion(s) (CEAVOP). Explicitly consider fraud risk and changes',
            'that could impact the system of internal control (COSO principles 8 and 9).',
            'Anchor each risk to the COSO principle(s) it relates to.',
            '',
            DISCLAIMER
          ].join('\n')
        )
      ]
    })
  );

  server.registerPrompt(
    'build-control-matrix',
    {
      title: 'Build a control matrix',
      description:
        'Turn risks into a key-control matrix with type, frequency, owner and assertions (COSO principles 10–12).',
      argsSchema: z.object({
        process: z.string().describe('Process or account in scope.')
      })
    },
    ({ process }) => ({
      messages: [
        text(
          [
            `Build a control matrix for the ${process} process.`,
            '',
            'Columns: control id, description, control type (manual / automated / IT-dependent manual),',
            'frequency (annual / quarterly / monthly / weekly / daily / per-transaction), key vs non-key,',
            'risk addressed, assertion(s), owner, and the COSO principle(s) supported.',
            'Flag segregation-of-duties considerations and any IT general controls relied upon.',
            '',
            DISCLAIMER
          ].join('\n')
        )
      ]
    })
  );

  server.registerPrompt(
    'draft-test-workpaper',
    {
      title: 'Draft a control test workpaper',
      description:
        'Draft a design/operating-effectiveness test workpaper with sample selection, procedures, results and conclusion.',
      argsSchema: z.object({
        controlId: z.string().describe('Control id to test.'),
        period: z.string().describe('Testing period, e.g. 2025-Q4.')
      })
    },
    ({ controlId, period }) => ({
      messages: [
        text(
          [
            `Draft a control-testing workpaper for control ${controlId} over ${period}.`,
            '',
            'Include: control identification (description, type, frequency, key, assertion);',
            'test objective; population description and size; sample-selection method and rationale',
            '(use compute_sample_size / select_sample); step-by-step procedures; expected evidence;',
            'an attribute results table (Pass/Fail/NA per sample); exceptions with root cause;',
            'and a conclusion (effective / deficiency / significant deficiency / material weakness).',
            'Leave preparer and reviewer sign-off blank for human completion.',
            '',
            DISCLAIMER
          ].join('\n')
        )
      ]
    })
  );

  server.registerPrompt(
    'evaluate-deficiencies',
    {
      title: 'Evaluate and classify deficiencies',
      description:
        'Classify deficiencies by likelihood and magnitude, aggregate related deficiencies, and plan remediation (COSO principle 17).',
      argsSchema: z.object({
        summary: z.string().describe('Short description of the deficiency or exception observed.')
      })
    },
    ({ summary }) => ({
      messages: [
        text(
          [
            'Evaluate the following control deficiency against COSO principle 17 and ICFR severity criteria.',
            '',
            `Deficiency: ${summary}`,
            '',
            'Consider: likelihood the control fails to prevent/detect a misstatement, magnitude of the',
            'potential misstatement, existence of compensating controls, and whether the deficiency is in',
            'a pervasive (entity-level / ITGC) control. Classify as deficiency, significant deficiency, or',
            'material weakness, and note aggregation with related deficiencies. Propose a remediation plan',
            'with root cause, owner, timeline and re-test approach.',
            '',
            DISCLAIMER
          ].join('\n')
        )
      ]
    })
  );
}
