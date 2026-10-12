import type { McpServer } from '@modelcontextprotocol/server';
import type { EngagementStore } from '../store/types.js';
export interface AssessmentToolDeps {
    store: EngagementStore;
    actor: string;
}
/** Registers the deficiency-evaluation, assessment and reporting tools. */
export declare function registerAssessmentTools(server: McpServer, deps: AssessmentToolDeps): void;
//# sourceMappingURL=assessment.d.ts.map