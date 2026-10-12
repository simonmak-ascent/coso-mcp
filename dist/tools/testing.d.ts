import type { McpServer } from '@modelcontextprotocol/server';
import type { EngagementStore } from '../store/types.js';
export interface TestingToolDeps {
    store: EngagementStore;
    actor: string;
}
/** Registers the sampling and testing tools (COSO principles 10, 11, 16). */
export declare function registerTestingTools(server: McpServer, deps: TestingToolDeps): void;
//# sourceMappingURL=testing.d.ts.map