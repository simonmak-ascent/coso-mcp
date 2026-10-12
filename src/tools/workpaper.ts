import type { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod';

import { IdSchema } from '../domain/common.js';
import {
  SignOffSchema,
  type ReviewNote,
  type SignOff,
  type Workpaper
} from '../domain/workpaper.js';
import { SignOffRoleSchema } from '../domain/workpaper.js';
import { renderWorkpaper } from '../render/workpaper.js';
import type { EngagementStore } from '../store/types.js';

export interface WorkpaperToolDeps {
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

function summarise(workpaper: Workpaper) {
  return {
    id: workpaper.id,
    engagementId: workpaper.engagementId,
    controlId: workpaper.controlId,
    title: workpaper.title,
    status: workpaper.status,
    signOffs: workpaper.signOffs,
    reviewNotes: workpaper.reviewNotes,
    updatedAt: workpaper.updatedAt
  };
}

/** Registers the workpaper, review and sign-off tools. */
export function registerWorkpaperTools(server: McpServer, deps: WorkpaperToolDeps): void {
  const { store, actor } = deps;

  server.registerTool(
    'assemble_workpaper',
    {
      title: 'Assemble a workpaper',
      description:
        'Assemble a Markdown control-testing workpaper from the control, its risks, population, sample, test results and exceptions.',
      inputSchema: z.object({
        engagementId: IdSchema,
        controlId: IdSchema,
        testResultId: IdSchema.optional().describe('Restrict to a single test result.'),
        title: z.string().min(1).optional()
      }),
      outputSchema: z.object({ workpaper: z.unknown() })
    },
    async ({ engagementId, controlId, testResultId, title }) =>
      guard(async () => {
        const engagement = await store.getEngagement(engagementId);
        if (!engagement) throw new Error(`Engagement not found: ${engagementId}`);

        const controls = await store.listControls(engagementId);
        const control = controls.find((candidate) => candidate.id === controlId);
        if (!control) throw new Error(`Control not found: ${controlId}`);

        const allRisks = await store.listRisks(engagementId);
        const risks = allRisks.filter((risk) => control.riskIds.includes(risk.id));

        const populations = await store.listPopulations(engagementId);
        const allSamples = await store.listSamples(engagementId);
        const population =
          populations.find((candidate) => candidate.controlId === controlId) ??
          populations.find((candidate) =>
            allSamples.some(
              (sample) => sample.populationId === candidate.id && sample.controlId === controlId
            )
          );
        const sample = population
          ? allSamples.find((candidate) => candidate.populationId === population.id)
          : undefined;

        const allTestResults = await store.listTestResults(engagementId);
        const testResults = allTestResults.filter(
          (result) =>
            result.controlId === controlId &&
            (testResultId === undefined || result.id === testResultId)
        );

        const resultIds = new Set(testResults.map((result) => result.id));
        const exceptions = (await store.listExceptions(engagementId)).filter((exception) =>
          resultIds.has(exception.testResultId)
        );

        const markdown = renderWorkpaper({
          engagement,
          control,
          risks,
          population,
          sample,
          testResults,
          exceptions
        });

        const workpaper = await store.addWorkpaper(
          engagementId,
          {
            controlId,
            testResultId,
            title: title ?? `Workpaper — ${control.id}: ${control.description}`,
            markdown
          },
          actor
        );
        return ok({ workpaper: { ...summarise(workpaper), markdown } });
      })
  );

  server.registerTool(
    'list_workpapers',
    {
      title: 'List workpapers',
      description: 'List the workpapers assembled for an engagement.',
      inputSchema: z.object({ engagementId: IdSchema }),
      outputSchema: z.object({ count: z.number(), workpapers: z.array(z.unknown()) })
    },
    async ({ engagementId }) =>
      guard(async () => {
        const workpapers = await store.listWorkpapers(engagementId);
        return ok({ count: workpapers.length, workpapers: workpapers.map(summarise) });
      })
  );

  server.registerTool(
    'get_workpaper',
    {
      title: 'Get a workpaper',
      description: 'Return a workpaper including its rendered Markdown.',
      inputSchema: z.object({ engagementId: IdSchema, workpaperId: IdSchema }),
      outputSchema: z.object({ found: z.boolean(), workpaper: z.unknown().nullable() })
    },
    async ({ engagementId, workpaperId }) =>
      guard(async () => {
        const workpaper = await store.getWorkpaper(engagementId, workpaperId);
        return ok({ found: workpaper !== undefined, workpaper: workpaper ?? null });
      })
  );

  server.registerTool(
    'add_review_note',
    {
      title: 'Add a review note',
      description: 'Add a reviewer note to a workpaper.',
      inputSchema: z.object({
        engagementId: IdSchema,
        workpaperId: IdSchema,
        text: z.string().min(1),
        author: z.string().min(1).optional()
      }),
      outputSchema: z.object({ workpaper: z.unknown(), note: z.unknown() })
    },
    async ({ engagementId, workpaperId, text, author }) =>
      guard(async () => {
        const workpaper = await store.getWorkpaper(engagementId, workpaperId);
        if (!workpaper) throw new Error(`Workpaper not found: ${workpaperId}`);
        const note: ReviewNote = {
          id: `RN-${String(workpaper.reviewNotes.length + 1).padStart(4, '0')}`,
          author: author ?? actor,
          text,
          status: 'open',
          createdAt: new Date().toISOString()
        };
        const saved = await store.saveWorkpaper(engagementId, {
          ...workpaper,
          reviewNotes: [...workpaper.reviewNotes, note]
        });
        await store.recordEvent(engagementId, {
          action: 'add_review_note',
          entityType: 'workpaper',
          entityId: workpaperId,
          actor: note.author,
          details: { noteId: note.id }
        });
        return ok({ workpaper: summarise(saved), note });
      })
  );

  server.registerTool(
    'resolve_review_note',
    {
      title: 'Resolve a review note',
      description: 'Mark a review note resolved on a workpaper.',
      inputSchema: z.object({
        engagementId: IdSchema,
        workpaperId: IdSchema,
        noteId: z.string().min(1),
        resolvedBy: z.string().min(1).optional()
      }),
      outputSchema: z.object({ workpaper: z.unknown(), note: z.unknown() })
    },
    async ({ engagementId, workpaperId, noteId, resolvedBy }) =>
      guard(async () => {
        const workpaper = await store.getWorkpaper(engagementId, workpaperId);
        if (!workpaper) throw new Error(`Workpaper not found: ${workpaperId}`);
        const index = workpaper.reviewNotes.findIndex((note) => note.id === noteId);
        if (index === -1) throw new Error(`Review note not found: ${noteId}`);
        const resolved: ReviewNote = {
          ...(workpaper.reviewNotes[index] as ReviewNote),
          status: 'resolved',
          resolvedBy: resolvedBy ?? actor,
          resolvedAt: new Date().toISOString()
        };
        const notes = [...workpaper.reviewNotes];
        notes[index] = resolved;
        const saved = await store.saveWorkpaper(engagementId, {
          ...workpaper,
          reviewNotes: notes
        });
        await store.recordEvent(engagementId, {
          action: 'resolve_review_note',
          entityType: 'workpaper',
          entityId: workpaperId,
          actor: resolved.resolvedBy ?? actor,
          details: { noteId }
        });
        return ok({ workpaper: summarise(saved), note: resolved });
      })
  );

  server.registerTool(
    'sign_off',
    {
      title: 'Sign off a workpaper',
      description:
        'Record a preparer or reviewer sign-off. Warns (does not block) if the same person prepared and reviewed.',
      inputSchema: z.object({
        engagementId: IdSchema,
        workpaperId: IdSchema,
        role: SignOffRoleSchema,
        actor: z.string().min(1).optional(),
        comment: z.string().optional()
      }),
      outputSchema: z.object({ workpaper: z.unknown(), warning: z.string().optional() })
    },
    async ({ engagementId, workpaperId, role, actor: signer, comment }) =>
      guard(async () => {
        const workpaper = await store.getWorkpaper(engagementId, workpaperId);
        if (!workpaper) throw new Error(`Workpaper not found: ${workpaperId}`);
        const who = signer ?? actor;

        const otherRole = role === 'preparer' ? 'reviewer' : 'preparer';
        const other = [...workpaper.signOffs]
          .reverse()
          .find((signOff) => signOff.role === otherRole);
        const warning =
          other && other.actor === who
            ? `Same person (${who}) signed as both preparer and reviewer; independence is not evidenced.`
            : undefined;

        const signOff: SignOff = SignOffSchema.parse({
          role,
          actor: who,
          at: new Date().toISOString(),
          comment
        });
        const status = role === 'reviewer' ? 'approved' : 'in-review';
        const saved = await store.saveWorkpaper(engagementId, {
          ...workpaper,
          status,
          signOffs: [...workpaper.signOffs, signOff]
        });
        await store.recordEvent(engagementId, {
          action: 'sign_off',
          entityType: 'workpaper',
          entityId: workpaperId,
          actor: who,
          details: { role, warning: warning ?? null }
        });
        return warning
          ? ok({ workpaper: summarise(saved), warning })
          : ok({ workpaper: summarise(saved) });
      })
  );

  server.registerTool(
    'get_activity_log',
    {
      title: 'Get the activity log',
      description:
        'Return the append-only activity log for an engagement, plus a Markdown rendering.',
      inputSchema: z.object({ engagementId: IdSchema }),
      outputSchema: z.object({
        count: z.number(),
        markdown: z.string(),
        events: z.array(z.unknown())
      })
    },
    async ({ engagementId }) =>
      guard(async () => {
        const events = await store.listAudit(engagementId);
        const rows = events.map(
          (event) =>
            `| ${event.at} | ${event.actor} | ${event.action} | ${event.entityType} ${event.entityId} |`
        );
        const markdown = [
          `# Activity log — ${engagementId}`,
          '',
          '| At | Actor | Action | Entity |',
          '| --- | --- | --- | --- |',
          ...rows
        ].join('\n');
        return ok({ count: events.length, markdown, events });
      })
  );
}
