import { AuditEventSchema } from '../domain/audit-event.js';
import { ControlSchema } from '../domain/control.js';
import { DeficiencySchema } from '../domain/deficiency.js';
import { EngagementSchema } from '../domain/engagement.js';
import { PopulationSchema } from '../domain/population.js';
import { RiskSchema } from '../domain/risk.js';
import { SampleSchema } from '../domain/sample.js';
import { ScopeItemSchema } from '../domain/scope.js';
import { ExceptionSchema, TestResultSchema } from '../domain/test-result.js';
import { WorkpaperSchema } from '../domain/workpaper.js';
import { newId, slugId } from './ids.js';
/**
 * Ephemeral, in-memory engagement store used by the hosted endpoint. One
 * instance backs one session; nothing is persisted and it is discarded with the
 * session.
 */
export class MemoryEngagementStore {
    engagements = new Map();
    scope = new Map();
    risks = new Map();
    controls = new Map();
    populations = new Map();
    samples = new Map();
    tests = new Map();
    exceptions = new Map();
    workpapers = new Map();
    deficiencies = new Map();
    audit = new Map();
    list(map, engagementId) {
        return map.get(engagementId) ?? [];
    }
    requireEngagement(id) {
        const engagement = this.engagements.get(id);
        if (!engagement)
            throw new Error(`Engagement not found: ${id}`);
        return engagement;
    }
    record(event) {
        const list = this.audit.get(event.engagementId) ?? [];
        list.push(AuditEventSchema.parse(event));
        this.audit.set(event.engagementId, list);
    }
    append(map, engagementId, schema, prefix, action, entityType, actor, build) {
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
            entityId: record.id,
            engagementId
        });
        return record;
    }
    async createEngagement(input, actor) {
        const id = input.id ?? slugId();
        if (this.engagements.has(id))
            throw new Error(`Engagement already exists: ${id}`);
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
    async getEngagement(id) {
        return this.engagements.get(id);
    }
    async listEngagements() {
        return [...this.engagements.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
    async addScopeItem(engagementId, input, actor) {
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
    async listScopeItems(engagementId) {
        return this.list(this.scope, engagementId);
    }
    async addRisk(engagementId, input, actor) {
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
    async listRisks(engagementId) {
        return this.list(this.risks, engagementId);
    }
    async addControl(engagementId, input, actor) {
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
    async listControls(engagementId) {
        return this.list(this.controls, engagementId);
    }
    async addPopulation(engagementId, input, actor) {
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
    async listPopulations(engagementId) {
        return this.list(this.populations, engagementId);
    }
    async getPopulation(engagementId, populationId) {
        return this.list(this.populations, engagementId).find((population) => population.id === populationId);
    }
    async addSample(engagementId, input, actor) {
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
    async listSamples(engagementId) {
        return this.list(this.samples, engagementId);
    }
    async addTestResult(engagementId, input, actor) {
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
    async listTestResults(engagementId) {
        return this.list(this.tests, engagementId);
    }
    async addException(engagementId, input, actor) {
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
    async listExceptions(engagementId) {
        return this.list(this.exceptions, engagementId);
    }
    async addWorkpaper(engagementId, input, actor) {
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
    async listWorkpapers(engagementId) {
        return this.list(this.workpapers, engagementId);
    }
    async getWorkpaper(engagementId, workpaperId) {
        return this.list(this.workpapers, engagementId).find((workpaper) => workpaper.id === workpaperId);
    }
    async saveWorkpaper(engagementId, workpaper) {
        if (workpaper.engagementId !== engagementId) {
            throw new Error('Workpaper does not belong to the engagement.');
        }
        const existing = this.list(this.workpapers, engagementId);
        const index = existing.findIndex((candidate) => candidate.id === workpaper.id);
        if (index === -1)
            throw new Error(`Workpaper not found: ${workpaper.id}`);
        const updated = WorkpaperSchema.parse({
            ...workpaper,
            updatedAt: new Date().toISOString()
        });
        const next = [...existing];
        next[index] = updated;
        this.workpapers.set(engagementId, next);
        return updated;
    }
    async addDeficiency(engagementId, input, actor) {
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
    async listDeficiencies(engagementId) {
        return this.list(this.deficiencies, engagementId);
    }
    async recordEvent(engagementId, event) {
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
    async listAudit(engagementId) {
        return this.list(this.audit, engagementId);
    }
}
//# sourceMappingURL=memory-store.js.map