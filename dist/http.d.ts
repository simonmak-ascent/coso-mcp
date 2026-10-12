import type { IncomingMessage, ServerResponse } from 'node:http';
export interface HttpHandlerOptions {
    /** Requests allowed per client per minute. @default 120 */
    rateLimitPerMinute?: number;
    /** Session idle time-to-live in ms. @default 30 minutes */
    sessionTtlMs?: number;
    /** Maximum concurrent sessions before oldest eviction. @default 500 */
    maxSessions?: number;
    /** Actor recorded for hosted sessions. @default "hosted" */
    actor?: string;
}
type NodeRequest = IncomingMessage & {
    body?: unknown;
    headers: IncomingMessage['headers'];
};
/**
 * Node request handler for the hosted MCP endpoint. Each MCP session gets its
 * own ephemeral in-memory store; sessions are idle-evicted and never persisted.
 */
export declare function createRequestHandler(options?: HttpHandlerOptions): (req: NodeRequest, res: ServerResponse) => Promise<void>;
export {};
//# sourceMappingURL=http.d.ts.map