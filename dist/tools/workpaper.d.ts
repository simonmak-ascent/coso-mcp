import type { McpServer } from '@modelcontextprotocol/server';
import type { EngagementStore } from '../store/types.js';
export interface WorkpaperToolDeps {
    store: EngagementStore;
    actor: string;
}
/** Registers the workpaper, review and sign-off tools. */
export declare function registerWorkpaperTools(server: McpServer, deps: WorkpaperToolDeps): void;
//# sourceMappingURL=workpaper.d.ts.map