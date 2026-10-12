import { type McpServer } from '@modelcontextprotocol/server';
import type { EngagementStore } from '../store/types.js';
export interface EngagementToolDeps {
    store: EngagementStore;
    actor: string;
}
/** Registers the engagement / planning tools and the engagement resource. */
export declare function registerEngagementTools(server: McpServer, deps: EngagementToolDeps): void;
//# sourceMappingURL=engagement.d.ts.map