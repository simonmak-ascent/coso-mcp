import type { AssertionId } from '../domain/assertions.js';
import type { AuditEvent } from '../domain/audit-event.js';
import type { Control, ControlFrequency, ControlType } from '../domain/control.js';
import type {
  Deficiency,
  DeficiencyLikelihood,
  Magnitude,
  Remediation,
  Severity
} from '../domain/deficiency.js';
import type { Engagement, Materiality } from '../domain/engagement.js';
import type { ObjectiveCategoryId } from '../domain/engagement.js';
import type { Population, PopulationItem } from '../domain/population.js';
import type { Likelihood } from '../domain/risk.js';
import type { Risk } from '../domain/risk.js';
import type { Sample, SamplingMethod } from '../domain/sample.js';
import type { ScopeItem } from '../domain/scope.js';
import type {
  AttributeResult,
  Exception,
  TestConclusion,
  TestResult
} from '../domain/test-result.js';
import type { Workpaper } from '../domain/workpaper.js';

export interface CreateEngagementInput {
  id?: string;
  title: string;
  entity: string;
  period?: string;
  materiality?: Materiality;
  createdBy?: string;
}

export interface AddScopeItemInput {
  area: string;
  objectiveCategory: ObjectiveCategoryId;
  assertions?: AssertionId[];
  rationale?: string;
  inScope?: boolean;
}

export interface AddRiskInput {
  description: string;
  cause?: string;
  impact?: string;
  likelihood?: Likelihood;
  assertions?: AssertionId[];
  principles?: number[];
  fraud?: boolean;
  scopeItemId?: string;
}

export interface AddControlInput {
  description: string;
  type: ControlType;
  frequency: ControlFrequency;
  key?: boolean;
  riskIds?: string[];
  assertions?: AssertionId[];
  principles?: number[];
  owner?: string;
  scopeItemId?: string;
}

export interface AddPopulationInput {
  controlId?: string;
  description: string;
  period?: string;
  currency?: string;
  items?: PopulationItem[];
  declaredSize?: number;
}

export interface AddSampleInput {
  controlId?: string;
  populationId: string;
  method: SamplingMethod;
  sampleSize: number;
  seed: number;
  selectedReferences: string[];
  rationale?: string;
}

export interface AddTestResultInput {
  controlId: string;
  sampleId: string;
  populationId?: string;
  attribute: string;
  procedure?: string;
  results: AttributeResult[];
  conclusion?: TestConclusion;
  preparedBy?: string;
}

export interface AddExceptionInput {
  testResultId: string;
  reference: string;
  description: string;
  rootCause?: string;
  impact?: string;
  compensatingControl?: string;
}

export interface AddWorkpaperInput {
  controlId: string;
  testResultId?: string;
  title: string;
  markdown: string;
}

export interface AddDeficiencyInput {
  title: string;
  description: string;
  likelihood: DeficiencyLikelihood;
  magnitude: Magnitude;
  pervasive?: boolean;
  severity: Severity;
  rationale: string;
  controlId?: string;
  testResultId?: string;
  exceptionIds?: string[];
  compensatingControl?: string;
  remediation?: Remediation;
}

/**
 * Storage abstraction for review engagements. The local implementation is
 * file-backed; the hosted endpoint uses an ephemeral in-memory implementation.
 */
export interface EngagementStore {
  createEngagement(input: CreateEngagementInput, actor: string): Promise<Engagement>;
  getEngagement(id: string): Promise<Engagement | undefined>;
  listEngagements(): Promise<Engagement[]>;

  addScopeItem(
    engagementId: string,
    input: AddScopeItemInput,
    actor: string
  ): Promise<ScopeItem>;
  listScopeItems(engagementId: string): Promise<ScopeItem[]>;

  addRisk(engagementId: string, input: AddRiskInput, actor: string): Promise<Risk>;
  listRisks(engagementId: string): Promise<Risk[]>;

  addControl(engagementId: string, input: AddControlInput, actor: string): Promise<Control>;
  listControls(engagementId: string): Promise<Control[]>;

  addPopulation(engagementId: string, input: AddPopulationInput, actor: string): Promise<Population>;
  listPopulations(engagementId: string): Promise<Population[]>;
  getPopulation(engagementId: string, populationId: string): Promise<Population | undefined>;

  addSample(engagementId: string, input: AddSampleInput, actor: string): Promise<Sample>;
  listSamples(engagementId: string): Promise<Sample[]>;

  addTestResult(
    engagementId: string,
    input: AddTestResultInput,
    actor: string
  ): Promise<TestResult>;
  listTestResults(engagementId: string): Promise<TestResult[]>;

  addException(engagementId: string, input: AddExceptionInput, actor: string): Promise<Exception>;
  listExceptions(engagementId: string): Promise<Exception[]>;

  addWorkpaper(
    engagementId: string,
    input: AddWorkpaperInput,
    actor: string
  ): Promise<Workpaper>;
  listWorkpapers(engagementId: string): Promise<Workpaper[]>;
  getWorkpaper(engagementId: string, workpaperId: string): Promise<Workpaper | undefined>;
  saveWorkpaper(engagementId: string, workpaper: Workpaper): Promise<Workpaper>;

  addDeficiency(
    engagementId: string,
    input: AddDeficiencyInput,
    actor: string
  ): Promise<Deficiency>;
  listDeficiencies(engagementId: string): Promise<Deficiency[]>;

  /** Append a custom audit event (used by review/sign-off actions). */
  recordEvent(
    engagementId: string,
    event: {
      action: string;
      entityType: AuditEvent['entityType'];
      entityId: string;
      actor: string;
      details?: Record<string, unknown>;
    }
  ): Promise<void>;

  listAudit(engagementId: string): Promise<AuditEvent[]>;
}
