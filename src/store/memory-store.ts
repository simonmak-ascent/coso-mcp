import { AuditEventSchema, type AuditEvent } from '../domain/audit-event.js';
import { ControlSchema, type Control } from '../domain/control.js';
import { DeficiencySchema, type Deficiency } from '../domain/deficiency.js';
import { EngagementSchema, type Engagement } from '../domain/engagement.js';
import { PopulationSchema, type Population } from '../domain/population.js';
import { RiskSchema, type Risk } from '../domain/risk.js';
import { SampleSchema, type Sample } from '../domain/sample.js';
import { ScopeItemSchema, type ScopeItem } from '../domain/scope.js';
import { ExceptionSchema, TestResultSchema, type Exception, type TestResult } from '../domain/test-result.js';
import { WorkpaperSchema, type Workpaper } from '../domain/workpaper.js';
import { newId, slugId } from './ids.js';
import type {
  AddControlInput,
  AddDeficiencyInput,
  AddExceptionInput,
  AddPopulationInput,
  AddRiskInput,
  AddSampleInput,
  AddScopeItemInput,
  AddTestResultInput,
  AddWorkpaperInput,
  CreateEngagementInput,
  EngagementStore
} from './types.js';

interface Schema<T> {
  parse(value: unknown): T;
}

/**
 * Ephemeral, in-memory engagement store used by the hosted endpoint. One
 * instance backs one session; nothing is persisted and it is discarded with the
 * session.
 */
export class MemoryEngagementStore implements EngagementStore {
  private readonly engagements = new Map<string, Engagement>();
  private readonly scope = new Map<string, ScopeItem[]>();
  private readonly risks = new Map<string, Risk[]>();
  private readonly controls = new Map<string, Control[]>();
  private readonly populations = new Map<string, Population[]>();
  private readonly samples = new Map<string, Sample[]>();
  private readonly tests = new Map<string, TestResult[]>();
  private readonly exceptions = new Map<string, Exception[]>();
  private readonly workpapers = new Map<string, Workpaper[]>();
  private readonly deficiencies = new Map<string, Deficiency[]>();
  private readonly audit = new Map<string, AuditEvent[]>();

  private list<T>(map: Map<string, T[]>, engagementId: string): T[] {
    return map.get(engagementId) ?? [];
  }

  private requireEngagement(id: string): Engagement {
    const engagement = this.engagements.get(id);
    if (!engagement) throw new Error(`Engagement not found: ${id}`);
    return engagement;
  }

  private record(event: AuditEvent): void {
    const list = this.audit.get(event.engagementId) ?? [];
    list.push(AuditEventSchema.parse(event));
    this.audit.set(event.engagementId, list);
  }

  private append<T>(
    map: Map<string, T[]>,
    engagementId: string,
    schema: Schema<T>,
    prefix: string,
    action: string,
    entityType: AuditEvent['entityType'],
    actor: string,
    build: (id: string, createdAt: string) => unknown
  ): T {
    this.requireEngagement(engagementId);
    const existing = this.list(map, engagementId);
    const createdAt = new Date().toISOString();
    const record = schema.parse(build(newId(prefix, existing.length), createdAt));
    map.set(engagementId, [...existing, record]);
    this.record({
      at: createdAt,
      actor,
      action,
      entityType,
      entityId: (record as unknown as { id: string }).id,
      engagementId
    });
    return record;
  }

  async createEngagement(input: CreateEngagementInput, actor: string): Promise<Engagement> {
    const id = input.id ?? slugId();
    if (this.engagements.has(id)) throw new Error(`Engagement already exists: ${id}`);
    const now = new Date().toISOString();
    const engagement = EngagementSchema.parse({
      id,
      title: input.title,
      entity: input.entity,
      period: input.period,
      materiality: input.materiality,
      createdBy: input.createdBy,
      status: 'draft',
      createdAt: now,
      updatedAt: now
    });
    this.engagements.set(id, engagement);
    this.record({
      at: now,
      actor,
      action: 'create_engagement',
      entityType: 'engagement',
      entityId: id,
      engagementId: id
    });
    return engagement;
  }

  async getEngagement(id: string): Promise<Engagement | undefined> {
    return this.engagements.get(id);
  }

  async listEngagements(): Promise<Engagement[]> {
    return [...this.engagements.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async addScopeItem(
    engagementId: string,
    input: AddScopeItemInput,
    actor: string
  ): Promise<ScopeItem> {
    return this.append(this.scope, engagementId, ScopeItemSchema, 'S', 'add_scope_item', 'scope', actor, (id, createdAt) => ({
      id,
      area: input.area,
      objectiveCategory: input.objectiveCategory,
      assertions: input.assertions ?? [],
      rationale: input.rationale,
      inScope: input.inScope ?? true,
      createdAt
    }));
  }

  async listScopeItems(engagementId: string): Promise<ScopeItem[]> {
    return this.list(this.scope, engagementId);
  }

  async addRisk(engagementId: string, input: AddRiskInput, actor: string): Promise<Risk> {
    return this.append(this.risks, engagementId, RiskSchema, 'R', 'register_risk', 'risk', actor, (id, createdAt) => ({
      id,
      engagementId,
      description: input.description,
      cause: input.cause,
      impact: input.impact,
      likelihood: input.likelihood ?? 'medium',
      assertions: input.assertions ?? [],
      principles: input.principles ?? [],
      fraud: input.fraud ?? false,
      scopeItemId: input.scopeItemId,
      status: 'open',
      createdAt
    }));
  }

  async listRisks(engagementId: string): Promise<Risk[]> {
    return this.list(this.risks, engagementId);
  }

  async addControl(engagementId: string, input: AddControlInput, actor: string): Promise<Control> {
    return this.append(this.controls, engagementId, ControlSchema, 'C', 'register_control', 'control', actor, (id, createdAt) => ({
      id,
      engagementId,
      description: input.description,
      type: input.type,
      frequency: input.frequency,
      key: input.key ?? true,
      riskIds: input.riskIds ?? [],
      assertions: input.assertions ?? [],
      principles: input.principles ?? [],
      owner: input.owner,
      scopeItemId: input.scopeItemId,
      status: 'active',
      createdAt
    }));
  }

  async listControls(engagementId: string): Promise<Control[]> {
    return this.list(this.controls, engagementId);
  }

  async addPopulation(
    engagementId: string,
    input: AddPopulationInput,
    actor: string
  ): Promise<Population> {
    return this.append(this.populations, engagementId, PopulationSchema, 'P', 'create_population', 'population', actor, (id, createdAt) => ({
      id,
      engagementId,
      controlId: input.controlId,
      description: input.description,
      period: input.period,
      currency: input.currency,
      items: input.items ?? [],
      declaredSize: input.declaredSize,
      createdAt
    }));
  }

  async listPopulations(engagementId: string): Promise<Population[]> {
    return this.list(this.populations, engagementId);
  }

  async getPopulation(
    engagementId: string,
    populationId: string
  ): Promise<Population | undefined> {
    return this.list(this.populations, engagementId).find(
      (population) => population.id === populationId
    );
  }

  async addSample(engagementId: string, input: AddSampleInput, actor: string): Promise<Sample> {
    return this.append(this.samples, engagementId, SampleSchema, 'SM', 'select_sample', 'sample', actor, (id, createdAt) => ({
      id,
      engagementId,
      controlId: input.controlId,
      populationId: input.populationId,
      method: input.method,
      sampleSize: input.sampleSize,
      seed: input.seed,
      selectedReferences: input.selectedReferences,
      rationale: input.rationale,
      createdAt
    }));
  }

  async listSamples(engagementId: string): Promise<Sample[]> {
    return this.list(this.samples, engagementId);
  }

  async addTestResult(
    engagementId: string,
    input: AddTestResultInput,
    actor: string
  ): Promise<TestResult> {
    return this.append(this.tests, engagementId, TestResultSchema, 'T', 'record_test_result', 'test', actor, (id, createdAt) => ({
      id,
      engagementId,
      controlId: input.controlId,
      sampleId: input.sampleId,
      populationId: input.populationId,
      attribute: input.attribute,
      procedure: input.procedure,
      results: input.results,
      conclusion: input.conclusion,
      preparedBy: input.preparedBy,
      createdAt
    }));
  }

  async listTestResults(engagementId: string): Promise<TestResult[]> {
    return this.list(this.tests, engagementId);
  }

  async addException(
    engagementId: string,
    input: AddExceptionInput,
    actor: string
  ): Promise<Exception> {
    return this.append(this.exceptions, engagementId, ExceptionSchema, 'E', 'note_exception', 'exception', actor, (id, createdAt) => ({
      id,
      engagementId,
      testResultId: input.testResultId,
      reference: input.reference,
      description: input.description,
      rootCause: input.rootCause,
      impact: input.impact,
      compensatingControl: input.compensatingControl,
      createdAt
    }));
  }

  async listExceptions(engagementId: string): Promise<Exception[]> {
    return this.list(this.exceptions, engagementId);
  }

  async addWorkpaper(
    engagementId: string,
    input: AddWorkpaperInput,
    actor: string
  ): Promise<Workpaper> {
    return this.append(this.workpapers, engagementId, WorkpaperSchema, 'WP', 'assemble_workpaper', 'workpaper', actor, (id, createdAt) => ({
      id,
      engagementId,
      controlId: input.controlId,
      testResultId: input.testResultId,
      title: input.title,
      markdown: input.markdown,
      status: 'draft',
      signOffs: [],
      reviewNotes: [],
      createdAt,
      updatedAt: createdAt
    }));
  }

  async listWorkpapers(engagementId: string): Promise<Workpaper[]> {
    return this.list(this.workpapers, engagementId);
  }

  async getWorkpaper(
    engagementId: string,
    workpaperId: string
  ): Promise<Workpaper | undefined> {
    return this.list(this.workpapers, engagementId).find(
      (workpaper) => workpaper.id === workpaperId
    );
  }

  async saveWorkpaper(engagementId: string, workpaper: Workpaper): Promise<Workpaper> {
    if (workpaper.engagementId !== engagementId) {
      throw new Error('Workpaper does not belong to the engagement.');
    }
    const existing = this.list(this.workpapers, engagementId);
    const index = existing.findIndex((candidate) => candidate.id === workpaper.id);
    if (index === -1) throw new Error(`Workpaper not found: ${workpaper.id}`);
    const updated = WorkpaperSchema.parse({
      ...workpaper,
      updatedAt: new Date().toISOString()
    });
    const next = [...existing];
    next[index] = updated;
    this.workpapers.set(engagementId, next);
    return updated;
  }

  async addDeficiency(
    engagementId: string,
    input: AddDeficiencyInput,
    actor: string
  ): Promise<Deficiency> {
    return this.append(this.deficiencies, engagementId, DeficiencySchema, 'D', 'classify_deficiency', 'deficiency', actor, (id, createdAt) => ({
      id,
      engagementId,
      title: input.title,
      description: input.description,
      likelihood: input.likelihood,
      magnitude: input.magnitude,
      pervasive: input.pervasive ?? false,
      severity: input.severity,
      rationale: input.rationale,
      controlId: input.controlId,
      testResultId: input.testResultId,
      exceptionIds: input.exceptionIds ?? [],
      compensatingControl: input.compensatingControl,
      remediation: input.remediation,
      createdAt
    }));
  }

  async listDeficiencies(engagementId: string): Promise<Deficiency[]> {
    return this.list(this.deficiencies, engagementId);
  }

  async recordEvent(
    engagementId: string,
    event: {
      action: string;
      entityType: AuditEvent['entityType'];
      entityId: string;
      actor: string;
      details?: Record<string, unknown>;
    }
  ): Promise<void> {
    this.requireEngagement(engagementId);
    this.record({
      at: new Date().toISOString(),
      actor: event.actor,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      engagementId,
      details: event.details
    });
  }

  async listAudit(engagementId: string): Promise<AuditEvent[]> {
    return this.list(this.audit, engagementId);
  }
}
