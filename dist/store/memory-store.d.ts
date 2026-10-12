import { type AuditEvent } from '../domain/audit-event.js';
import { type Control } from '../domain/control.js';
import { type Deficiency } from '../domain/deficiency.js';
import { type Engagement } from '../domain/engagement.js';
import { type Population } from '../domain/population.js';
import { type Risk } from '../domain/risk.js';
import { type Sample } from '../domain/sample.js';
import { type ScopeItem } from '../domain/scope.js';
import { type Exception, type TestResult } from '../domain/test-result.js';
import { type Workpaper } from '../domain/workpaper.js';
import type { AddControlInput, AddDeficiencyInput, AddExceptionInput, AddPopulationInput, AddRiskInput, AddSampleInput, AddScopeItemInput, AddTestResultInput, AddWorkpaperInput, CreateEngagementInput, EngagementStore } from './types.js';
/**
 * Ephemeral, in-memory engagement store used by the hosted endpoint. One
 * instance backs one session; nothing is persisted and it is discarded with the
 * session.
 */
export declare class MemoryEngagementStore implements EngagementStore {
    private readonly engagements;
    private readonly scope;
    private readonly risks;
    private readonly controls;
    private readonly populations;
    private readonly samples;
    private readonly tests;
    private readonly exceptions;
    private readonly workpapers;
    private readonly deficiencies;
    private readonly audit;
    private list;
    private requireEngagement;
    private record;
    private append;
    createEngagement(input: CreateEngagementInput, actor: string): Promise<Engagement>;
    getEngagement(id: string): Promise<Engagement | undefined>;
    listEngagements(): Promise<Engagement[]>;
    addScopeItem(engagementId: string, input: AddScopeItemInput, actor: string): Promise<ScopeItem>;
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
    addTestResult(engagementId: string, input: AddTestResultInput, actor: string): Promise<TestResult>;
    listTestResults(engagementId: string): Promise<TestResult[]>;
    addException(engagementId: string, input: AddExceptionInput, actor: string): Promise<Exception>;
    listExceptions(engagementId: string): Promise<Exception[]>;
    addWorkpaper(engagementId: string, input: AddWorkpaperInput, actor: string): Promise<Workpaper>;
    listWorkpapers(engagementId: string): Promise<Workpaper[]>;
    getWorkpaper(engagementId: string, workpaperId: string): Promise<Workpaper | undefined>;
    saveWorkpaper(engagementId: string, workpaper: Workpaper): Promise<Workpaper>;
    addDeficiency(engagementId: string, input: AddDeficiencyInput, actor: string): Promise<Deficiency>;
    listDeficiencies(engagementId: string): Promise<Deficiency[]>;
    recordEvent(engagementId: string, event: {
        action: string;
        entityType: AuditEvent['entityType'];
        entityId: string;
        actor: string;
        details?: Record<string, unknown>;
    }): Promise<void>;
    listAudit(engagementId: string): Promise<AuditEvent[]>;
}
//# sourceMappingURL=memory-store.d.ts.map