import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod';

import { resolveActor, resolveDataDir } from './config.js';
import { registerWorkflowPrompts } from './prompts/workflow.js';
import { FileEngagementStore } from './store/file-store.js';
import type { EngagementStore } from './store/types.js';
import { registerEngagementTools } from './tools/engagement.js';
import { registerReferenceTools } from './tools/reference.js';
import { registerTestingTools } from './tools/testing.js';
import { registerWorkpaperTools } from './tools/workpaper.js';
import { registerAssessmentTools } from './tools/assessment.js';
import {
  DISCLAIMER,
  FRAMEWORK_LABEL,
  SERVER_DESCRIPTION,
  SERVER_NAME,
  SERVER_VERSION
} from './version.js';

const ServerInfoSchema = z.object({
  name: z.string(),
  version: z.string(),
  title: z.string(),
  description: z.string(),
  framework: z.string(),
  disclaimer: z.string()
});

export interface ServerOptions {
  /** Storage backend; defaults to the local file store. */
  store?: EngagementStore;
  /** Actor recorded on audit events; defaults to `COSO_MCP_ACTOR` or `local`. */
  actor?: string;
}

function registerServerInfoTool(server: McpServer): void {
  server.registerTool(
    'get_server_info',
    {
      description:
        'Return the server identity, the COSO framework it covers, and the mandatory disclaimer.',
      inputSchema: z.object({}),
      outputSchema: ServerInfoSchema
    },
    async () => {
      const structuredContent = {
        name: SERVER_NAME,
        version: SERVER_VERSION,
        title: 'COSO Internal Control Review',
        description: SERVER_DESCRIPTION,
        framework: FRAMEWORK_LABEL,
        disclaimer: DISCLAIMER
      };
      return {
        content: [{ type: 'text', text: JSON.stringify(structuredContent) }],
        structuredContent
      };
    }
  );
}

/**
 * Build a fully-wired MCP server. Transport is attached by the caller
 * (`src/index.ts` for stdio, `src/http.ts` for the hosted endpoint).
 */
export function createServer(options: ServerOptions = {}): McpServer {
  const store = options.store ?? new FileEngagementStore(resolveDataDir());
  const actor = options.actor ?? resolveActor();
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });

  registerServerInfoTool(server);
  registerReferenceTools(server);
  registerEngagementTools(server, { store, actor });
  registerTestingTools(server, { store, actor });
  registerWorkpaperTools(server, { store, actor });
  registerAssessmentTools(server, { store, actor });
  registerWorkflowPrompts(server);

  return server;
}
