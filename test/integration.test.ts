import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { Client } from '@modelcontextprotocol/client';
import { InMemoryTransport } from '@modelcontextprotocol/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createServer } from '../src/server';
import { FileEngagementStore } from '../src/store/file-store';

let dir: string;
let client: Client;
let close: () => Promise<void>;

beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), 'coso-it-'));
  const server = createServer({ store: new FileEngagementStore(dir), actor: 'integration' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  client = new Client({ name: 'coso-test-client', version: '0.0.0' });
  await client.connect(clientTransport);
  close = async () => {
    await client.close();
  };
});

afterEach(async () => {
  await close();
  await rm(dir, { recursive: true, force: true });
});

describe('MCP surface (in-memory round trip)', () => {
  it('lists the registered tools', async () => {
    const { tools } = await client.listTools();
    const names = tools.map((tool) => tool.name);
    for (const expected of [
      'get_server_info',
      'list_components',
      'list_principles',
      'get_principle',
      'list_assertions',
      'create_engagement',
      'register_risk',
      'register_control'
    ]) {
      expect(names).toContain(expected);
    }
  });

  it('returns server info with the disclaimer', async () => {
    const result = await client.callTool({ name: 'get_server_info', arguments: {} });
    const structured = result.structuredContent as { framework: string; disclaimer: string };
    expect(structured.framework).toMatch(/COSO/);
    expect(structured.disclaimer).toMatch(/does not provide audit or legal advice/);
  });

  it('lists 17 principles and filters by component', async () => {
    const all = await client.callTool({ name: 'list_principles', arguments: {} });
    expect((all.structuredContent as { count: number }).count).toBe(17);

    const monitoring = await client.callTool({
      name: 'list_principles',
      arguments: { component: 'monitoring-activities' }
    });
    expect((monitoring.structuredContent as { count: number }).count).toBe(2);
  });

  it('reads the framework resource', async () => {
    const resource = await client.readResource({ uri: 'coso://framework/icif-2013' });
    const first = resource.contents[0] as { text?: string };
    expect(first.text).toBeDefined();
    const parsed = JSON.parse(first.text ?? '{}') as { components: unknown[]; principles: unknown[] };
    expect(parsed.components).toHaveLength(5);
    expect(parsed.principles).toHaveLength(17);
  });

  it('runs an end-to-end engagement flow', async () => {
    const created = await client.callTool({
      name: 'create_engagement',
      arguments: { id: 'eng-it', title: 'IT review', entity: 'Acme', period: '2025' }
    });
    const engagement = (created.structuredContent as { engagement: { id: string } }).engagement;
    expect(engagement.id).toBe('eng-it');

    await client.callTool({
      name: 'add_scope_item',
      arguments: { engagementId: 'eng-it', area: 'Revenue', objectiveCategory: 'reporting' }
    });
    const risk = await client.callTool({
      name: 'register_risk',
      arguments: { engagementId: 'eng-it', description: 'Cut-off error', assertions: ['completeness'] }
    });
    const riskId = (risk.structuredContent as { risk: { id: string } }).risk.id;
    expect(riskId).toBe('R-0001');

    const control = await client.callTool({
      name: 'register_control',
      arguments: {
        engagementId: 'eng-it',
        description: 'Three-way match',
        type: 'automated',
        frequency: 'per-transaction',
        riskIds: [riskId]
      }
    });
    expect((control.structuredContent as { control: { id: string } }).control.id).toBe('C-0001');

    const bundle = await client.readResource({ uri: 'coso://engagement/eng-it' });
    const doc = JSON.parse((bundle.contents[0] as { text: string }).text) as {
      risks: unknown[];
      controls: unknown[];
      scopeItems: unknown[];
    };
    expect(doc.risks).toHaveLength(1);
    expect(doc.controls).toHaveLength(1);
    expect(doc.scopeItems).toHaveLength(1);
  });

  it('runs a sampling and testing flow', async () => {
    await client.callTool({
      name: 'create_engagement',
      arguments: { id: 'eng-t3', title: 'T', entity: 'E' }
    });

    const size = await client.callTool({
      name: 'compute_sample_size',
      arguments: { frequency: 'monthly', risk: 'moderate' }
    });
    expect((size.structuredContent as { recommended: number }).recommended).toBe(3);

    const pop = await client.callTool({
      name: 'create_population',
      arguments: { engagementId: 'eng-t3', description: 'P2P invoices', declaredSize: 12 }
    });
    const populationId = (pop.structuredContent as { population: { id: string } }).population.id;

    const sample = await client.callTool({
      name: 'select_sample',
      arguments: {
        engagementId: 'eng-t3',
        populationId,
        method: 'random',
        sampleSize: 3,
        seed: 99
      }
    });
    const sampleObj = (
      sample.structuredContent as { sample: { id: string; selectedReferences: string[]; seed: number } }
    ).sample;
    expect(sampleObj.selectedReferences).toHaveLength(3);
    expect(sampleObj.seed).toBe(99);

    await client.callTool({
      name: 'register_control',
      arguments: {
        engagementId: 'eng-t3',
        description: 'Monthly reconciliation review',
        type: 'manual',
        frequency: 'monthly'
      }
    });

    const tr = await client.callTool({
      name: 'record_test_result',
      arguments: {
        engagementId: 'eng-t3',
        controlId: 'C-0001',
        sampleId: sampleObj.id,
        attribute: 'Review evidence',
        results: sampleObj.selectedReferences.map((reference) => ({ reference, outcome: 'pass' })),
        conclusion: 'effective'
      }
    });
    const testResultId = (tr.structuredContent as { testResult: { id: string } }).testResult.id;
    expect(testResultId).toBe('T-0001');

    const ex = await client.callTool({
      name: 'note_exception',
      arguments: {
        engagementId: 'eng-t3',
        testResultId,
        reference: sampleObj.selectedReferences[0] as string,
        description: 'Evidence dated after period end'
      }
    });
    expect((ex.structuredContent as { exception: { id: string } }).exception.id).toBe('E-0001');

    const list = await client.callTool({
      name: 'list_exceptions',
      arguments: { engagementId: 'eng-t3' }
    });
    expect((list.structuredContent as { count: number }).count).toBe(1);
  });

  it('assembles, reviews and signs off a workpaper', async () => {
    await client.callTool({
      name: 'create_engagement',
      arguments: { id: 'eng-wp', title: 'WP', entity: 'E' }
    });
    const control = await client.callTool({
      name: 'register_control',
      arguments: {
        engagementId: 'eng-wp',
        description: 'Monthly review',
        type: 'manual',
        frequency: 'monthly'
      }
    });
    const controlId = (control.structuredContent as { control: { id: string } }).control.id;

    const population = await client.callTool({
      name: 'create_population',
      arguments: { engagementId: 'eng-wp', controlId, description: 'pop', declaredSize: 12 }
    });
    const populationId = (population.structuredContent as { population: { id: string } }).population
      .id;

    const sample = await client.callTool({
      name: 'select_sample',
      arguments: {
        engagementId: 'eng-wp',
        populationId,
        controlId,
        method: 'random',
        sampleSize: 2,
        seed: 5
      }
    });
    const sampleObj = (
      sample.structuredContent as { sample: { id: string; selectedReferences: string[] } }
    ).sample;

    await client.callTool({
      name: 'record_test_result',
      arguments: {
        engagementId: 'eng-wp',
        controlId,
        sampleId: sampleObj.id,
        attribute: 'Evidence',
        results: sampleObj.selectedReferences.map((reference) => ({ reference, outcome: 'pass' })),
        conclusion: 'effective'
      }
    });

    const wp = await client.callTool({
      name: 'assemble_workpaper',
      arguments: { engagementId: 'eng-wp', controlId }
    });
    const workpaper = (
      wp.structuredContent as { workpaper: { id: string; markdown: string; status: string } }
    ).workpaper;
    expect(workpaper.markdown).toContain('# Control testing workpaper');
    expect(workpaper.status).toBe('draft');

    const note = await client.callTool({
      name: 'add_review_note',
      arguments: { engagementId: 'eng-wp', workpaperId: workpaper.id, text: 'Evidence the review' }
    });
    const noteId = (note.structuredContent as { note: { id: string } }).note.id;
    expect(noteId).toBe('RN-0001');

    await client.callTool({
      name: 'resolve_review_note',
      arguments: { engagementId: 'eng-wp', workpaperId: workpaper.id, noteId }
    });

    const prep = await client.callTool({
      name: 'sign_off',
      arguments: { engagementId: 'eng-wp', workpaperId: workpaper.id, role: 'preparer', actor: 'alice' }
    });
    expect((prep.structuredContent as { workpaper: { status: string } }).workpaper.status).toBe(
      'in-review'
    );

    const rev = await client.callTool({
      name: 'sign_off',
      arguments: { engagementId: 'eng-wp', workpaperId: workpaper.id, role: 'reviewer', actor: 'alice' }
    });
    expect((rev.structuredContent as { warning?: string }).warning).toMatch(/independence/);
    expect((rev.structuredContent as { workpaper: { status: string } }).workpaper.status).toBe(
      'approved'
    );

    const log = await client.callTool({
      name: 'get_activity_log',
      arguments: { engagementId: 'eng-wp' }
    });
    expect((log.structuredContent as { markdown: string }).markdown).toContain('sign_off');
  });

  it('classifies deficiencies, assesses the framework and generates a report', async () => {
    await client.callTool({
      name: 'create_engagement',
      arguments: { id: 'eng-r', title: 'R', entity: 'E' }
    });
    await client.callTool({
      name: 'register_control',
      arguments: {
        engagementId: 'eng-r',
        description: 'Monthly reconciliation',
        type: 'manual',
        frequency: 'monthly',
        principles: [10]
      }
    });

    const classified = await client.callTool({
      name: 'classify_deficiency',
      arguments: {
        engagementId: 'eng-r',
        title: 'Late approval',
        description: 'Approval after the fact',
        likelihood: 'more-than-remote',
        magnitude: 'material',
        controlId: 'C-0001'
      }
    });
    expect(
      (classified.structuredContent as { deficiency: { severity: string } }).deficiency.severity
    ).toBe('material-weakness');

    const aggregate = await client.callTool({
      name: 'aggregate_deficiencies',
      arguments: { engagementId: 'eng-r' }
    });
    expect(
      (aggregate.structuredContent as { aggregation: { overallSeverity: string } }).aggregation
        .overallSeverity
    ).toBe('material-weakness');

    const integration = await client.callTool({
      name: 'framework_integration_check',
      arguments: { engagementId: 'eng-r' }
    });
    expect(
      (integration.structuredContent as { integration: { totalPrinciples: number } }).integration
        .totalPrinciples
    ).toBe(17);

    const principle = await client.callTool({
      name: 'assess_principle',
      arguments: { engagementId: 'eng-r', number: 10 }
    });
    expect(
      (principle.structuredContent as { assessment: { status: string } }).assessment.status
    ).toBe('indicators-of-gap');

    const report = await client.callTool({
      name: 'generate_report',
      arguments: { engagementId: 'eng-r' }
    });
    const markdown = (report.structuredContent as { markdown: string }).markdown;
    expect(markdown).toContain('# Internal control review report');
    expect(markdown).toContain('material-weakness');
    expect(markdown).toContain('COSO component coverage');
  });

  it('serves the scope-review prompt', async () => {
    const prompt = await client.getPrompt({
      name: 'scope-review',
      arguments: { entity: 'Acme', period: '2025' }
    });
    const message = prompt.messages[0] as { content: { text: string } };
    expect(message.content.text).toMatch(/Acme/);
  });

  it('surfaces store errors as tool errors', async () => {
    const result = await client.callTool({
      name: 'register_risk',
      arguments: { engagementId: 'eng-ghost', description: 'x' }
    });
    expect(result.isError).toBe(true);
  });
});
