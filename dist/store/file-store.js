import { promises as fs } from 'node:fs';
import path from 'node:path';
import { AuditEventSchema } from '../domain/audit-event.js';
import { ControlSchema } from '../domain/control.js';
import { DeficiencySchema } from '../domain/deficiency.js';
import { EngagementSchema } from '../domain/engagement.js';
import { MAX_POPULATION_ITEMS, PopulationSchema } from '../domain/population.js';
import { RiskSchema } from '../domain/risk.js';
import { SampleSchema } from '../domain/sample.js';
import { ScopeItemSchema } from '../domain/scope.js';
import { ExceptionSchema, TestResultSchema } from '../domain/test-result.js';
import { WorkpaperSchema } from '../domain/workpaper.js';
import { ID_PATTERN, newId, slugId } from './ids.js';
function safeDir(root, id) {
    if (!ID_PATTERN.test(id)) {
        throw new Error(`Invalid engagement id: ${JSON.stringify(id)}`);
    }
    const dir = path.join(root, id);
    const rel = path.relative(root, dir);
    if (rel === '' || rel.startsWith('..') || path.isAbsolute(rel)) {
        throw new Error(`Engagement id escapes the store root: ${JSON.stringify(id)}`);
    }
    return dir;
}
async function readJson(file, schema) {
    try {
        const raw = await fs.readFile(file, 'utf8');
        return schema.parse(JSON.parse(raw));
    }
    catch (error) {
        if (error.code === 'ENOENT')
            return undefined;
        throw error;
    }
}
async function readArray(file, schema) {
    const value = await readJson(file, { parse: (v) => v });
    if (!Array.isArray(value))
        return [];
    const out = [];
    for (const item of value) {
        try {
            out.push(schema.parse(item));
        }
        catch {
            // Skip records that no longer satisfy the schema rather than failing the read.
        }
    }
    return out;
}
async function writeJson(file, data) {
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    await fs.rename(tmp, file);
}
/**
 * File-backed engagement store. Layout:
 *
 *   <root>/<engagementId>/engagement.json
 *   <root>/<engagementId>/scope.json
 *   <root>/<engagementId>/risks.json
 *   <root>/<engagementId>/controls.json
 *   <root>/<engagementId>/audit.jsonl
 */
export class FileEngagementStore {
    root;
    constructor(root) {
        this.root = path.resolve(root);
    }
    async requireEngagement(id) {
        const engagement = await this.getEngagement(id);
        if (!engagement)
            throw new Error(`Engagement not found: ${id}`);
        return engagement;
    }
    async appendAudit(event) {
        const dir = safeDir(this.root, event.engagementId);
        await fs.mkdir(dir, { recursive: true });
        await fs.appendFile(path.join(dir, 'audit.jsonl'), `${JSON.stringify(event)}\n`, 'utf8');
    }
    async createEngagement(input, actor) {
        const id = input.id ?? slugId();
        const dir = safeDir(this.root, id);
        const existing = await readJson(path.join(dir, 'engagement.json'), EngagementSchema);
        if (existing)
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
        await fs.mkdir(dir, { recursive: true });
        await writeJson(path.join(dir, 'engagement.json'), engagement);
        await this.appendAudit({
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
        const dir = safeDir(this.root, id);
        return readJson(path.join(dir, 'engagement.json'), EngagementSchema);
    }
    async listEngagements() {
        let entries;
        try {
            entries = await fs.readdir(this.root);
        }
        catch (error) {
            if (error.code === 'ENOENT')
                return [];
            throw error;
        }
        const out = [];
        for (const entry of entries) {
            if (!ID_PATTERN.test(entry))
                continue;
            const engagement = await readJson(path.join(this.root, entry, 'engagement.json'), EngagementSchema);
            if (engagement)
                out.push(engagement);
        }
        return out.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
    async addScopeItem(engagementId, input, actor) {
        await this.requireEngagement(engagementId);
        const dir = safeDir(this.root, engagementId);
        const scopeFile = path.join(dir, 'scope.json');
        const existing = await readArray(scopeFile, ScopeItemSchema);
        const item = ScopeItemSchema.parse({
            id: newId('S', existing.length),
            area: input.area,
            objectiveCategory: input.objectiveCategory,
            assertions: input.assertions ?? [],
            rationale: input.rationale,
            inScope: input.inScope ?? true,
            createdAt: new Date().toISOString()
        });
        await writeJson(scopeFile, [...existing, item]);
        await this.appendAudit({
            at: item.createdAt,
            actor,
            action: 'add_scope_item',
            entityType: 'scope',
            entityId: item.id,
            engagementId
        });
        return item;
    }
    async listScopeItems(engagementId) {
        const dir = safeDir(this.root, engagementId);
        return readArray(path.join(dir, 'scope.json'), ScopeItemSchema);
    }
    async addRisk(engagementId, input, actor) {
        await this.requireEngagement(engagementId);
        const dir = safeDir(this.root, engagementId);
        const file = path.join(dir, 'risks.json');
        const existing = await readArray(file, RiskSchema);
        const risk = RiskSchema.parse({
            id: newId('R', existing.length),
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
            createdAt: new Date().toISOString()
        });
        await writeJson(file, [...existing, risk]);
        await this.appendAudit({
            at: risk.createdAt,
            actor,
            action: 'register_risk',
            entityType: 'risk',
            entityId: risk.id,
            engagementId
        });
        return risk;
    }
    async listRisks(engagementId) {
        const dir = safeDir(this.root, engagementId);
        return readArray(path.join(dir, 'risks.json'), RiskSchema);
    }
    async addControl(engagementId, input, actor) {
        await this.requireEngagement(engagementId);
        const dir = safeDir(this.root, engagementId);
        const file = path.join(dir, 'controls.json');
        const existing = await readArray(file, ControlSchema);
        const control = ControlSchema.parse({
            id: newId('C', existing.length),
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
            createdAt: new Date().toISOString()
        });
        await writeJson(file, [...existing, control]);
        await this.appendAudit({
            at: control.createdAt,
            actor,
            action: 'register_control',
            entityType: 'control',
            entityId: control.id,
            engagementId
        });
        return control;
    }
    async listControls(engagementId) {
        const dir = safeDir(this.root, engagementId);
        return readArray(path.join(dir, 'controls.json'), ControlSchema);
    }
    async appendRecord(engagementId, fileName, schema, prefix, action, entityType, actor, build) {
        await this.requireEngagement(engagementId);
        const dir = safeDir(this.root, engagementId);
        const file = path.join(dir, fileName);
        const existing = await readArray(file, schema);
        const createdAt = new Date().toISOString();
        const record = schema.parse(build(newId(prefix, existing.length), createdAt));
        await writeJson(file, [...existing, record]);
        const id = record.id;
        await this.appendAudit({ at: createdAt, actor, action, entityType, entityId: id, engagementId });
        return record;
    }
    async addPopulation(engagementId, input, actor) {
        if (input.items && input.items.length > MAX_POPULATION_ITEMS) {
            throw new Error(`Population exceeds the maximum of ${MAX_POPULATION_ITEMS} items.`);
        }
        return this.appendRecord(engagementId, 'populations.json', PopulationSchema, 'P', 'create_population', 'population', actor, (id, createdAt) => ({
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
        const dir = safeDir(this.root, engagementId);
        return readArray(path.join(dir, 'populations.json'), PopulationSchema);
    }
    async getPopulation(engagementId, populationId) {
        return (await this.listPopulations(engagementId)).find((population) => population.id === populationId);
    }
    async addSample(engagementId, input, actor) {
        return this.appendRecord(engagementId, 'samples.json', SampleSchema, 'SM', 'select_sample', 'sample', actor, (id, createdAt) => ({
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
        const dir = safeDir(this.root, engagementId);
        return readArray(path.join(dir, 'samples.json'), SampleSchema);
    }
    async addTestResult(engagementId, input, actor) {
        return this.appendRecord(engagementId, 'test-results.json', TestResultSchema, 'T', 'record_test_result', 'test', actor, (id, createdAt) => ({
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
        const dir = safeDir(this.root, engagementId);
        return readArray(path.join(dir, 'test-results.json'), TestResultSchema);
    }
    async addException(engagementId, input, actor) {
        return this.appendRecord(engagementId, 'exceptions.json', ExceptionSchema, 'E', 'note_exception', 'exception', actor, (id, createdAt) => ({
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
        const dir = safeDir(this.root, engagementId);
        return readArray(path.join(dir, 'exceptions.json'), ExceptionSchema);
    }
    async addWorkpaper(engagementId, input, actor) {
        return this.appendRecord(engagementId, 'workpapers.json', WorkpaperSchema, 'WP', 'assemble_workpaper', 'workpaper', actor, (id, createdAt) => ({
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
        const dir = safeDir(this.root, engagementId);
        return readArray(path.join(dir, 'workpapers.json'), WorkpaperSchema);
    }
    async getWorkpaper(engagementId, workpaperId) {
        return (await this.listWorkpapers(engagementId)).find((workpaper) => workpaper.id === workpaperId);
    }
    async saveWorkpaper(engagementId, workpaper) {
        if (workpaper.engagementId !== engagementId) {
            throw new Error('Workpaper does not belong to the engagement.');
        }
        const dir = safeDir(this.root, engagementId);
        const file = path.join(dir, 'workpapers.json');
        const existing = await readArray(file, WorkpaperSchema);
        const index = existing.findIndex((candidate) => candidate.id === workpaper.id);
        if (index === -1)
            throw new Error(`Workpaper not found: ${workpaper.id}`);
        const updated = WorkpaperSchema.parse({
            ...workpaper,
            updatedAt: new Date().toISOString()
        });
        existing[index] = updated;
        await writeJson(file, existing);
        return updated;
    }
    async addDeficiency(engagementId, input, actor) {
        return this.appendRecord(engagementId, 'deficiencies.json', DeficiencySchema, 'D', 'classify_deficiency', 'deficiency', actor, (id, createdAt) => ({
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
        const dir = safeDir(this.root, engagementId);
        return readArray(path.join(dir, 'deficiencies.json'), DeficiencySchema);
    }
    async recordEvent(engagementId, event) {
        await this.requireEngagement(engagementId);
        await this.appendAudit({
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
        const dir = safeDir(this.root, engagementId);
        let raw;
        try {
            raw = await fs.readFile(path.join(dir, 'audit.jsonl'), 'utf8');
        }
        catch (error) {
            if (error.code === 'ENOENT')
                return [];
            throw error;
        }
        const out = [];
        for (const line of raw.split('\n')) {
            const trimmed = line.trim();
            if (trimmed.length === 0)
                continue;
            try {
                out.push(AuditEventSchema.parse(JSON.parse(trimmed)));
            }
            catch {
                // Skip malformed audit lines.
            }
        }
        return out;
    }
}
//# sourceMappingURL=file-store.js.map