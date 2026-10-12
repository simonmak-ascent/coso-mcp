import { McpServer } from '@modelcontextprotocol/server';
import type { EngagementStore } from './store/types.js';
export interface ServerOptions {
    /** Storage backend; defaults to the local file store. */
    store?: EngagementStore;
    /** Actor recorded on audit events; defaults to `COSO_MCP_ACTOR` or `local`. */
    actor?: string;
}
/**
 * Build a fully-wired MCP server. Transport is attached by the caller
 * (`src/index.ts` for stdio, `src/http.ts` for the hosted endpoint).
 */
export declare function createServer(options?: ServerOptions): McpServer;
//# sourceMappingURL=server.d.ts.map