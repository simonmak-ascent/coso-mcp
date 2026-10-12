import os from 'node:os';
import path from 'node:path';
/** Directory backing the local file store. Override with `COSO_MCP_DATA_DIR`. */
export function resolveDataDir(env = process.env) {
    const dir = env.COSO_MCP_DATA_DIR?.trim();
    return dir && dir.length > 0 ? dir : path.join(os.homedir(), '.coso-mcp');
}
/** Actor recorded on audit events. Override with `COSO_MCP_ACTOR`. */
export function resolveActor(env = process.env) {
    const actor = env.COSO_MCP_ACTOR?.trim();
    return actor && actor.length > 0 ? actor : 'local';
}
//# sourceMappingURL=config.js.map