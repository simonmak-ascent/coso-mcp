#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { createServer } from './server.js';
async function main() {
    const server = createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`coso-mcp failed to start: ${message}\n`);
    process.exit(1);
});
//# sourceMappingURL=index.js.map