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
 * File-backed engagement store. Layout:
 *
 *   <root>/<engagementId>/engagement.json
 *   <root>/<engagementId>/scope.json
 *   <root>/<engagementId>/risks.json
 *   <root>/<engagementId>/controls.json
 *   <root>/<engagementId>/audit.jsonl
 */
export declare class FileEngagementStore implements EngagementStore {
    readonly root: string;
    constructor(root: string);
    private requireEngagement;
    private appendAudit;
    createEngagement(input: CreateEngagementInput, actor: string): Promise<Engagement>;
    getEngagement(id: string): Promise<Engagement | undefined>;
    listEngagements(): Promise<Engagement[]>;
    addScopeItem(engagementId: string, input: AddScopeItemInput, actor: string): Promise<ScopeItem>;
    listScopeItems(engagementId: string): Promise<ScopeItem[]>;
    addRisk(engagementId: string, input: AddRiskInput, actor: string): Promise<Risk>;
    listRisks(engagementId: string): Promise<Risk[]>;
    addControl(engagementId: string, input: AddControlInput, actor: string): Promise<Control>;
    listControls(engagementId: string): Promise<Control[]>;
    private appendRecord;
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
//# sourceMappingURL=file-store.d.ts.map