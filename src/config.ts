import os from 'node:os';
import path from 'node:path';

export interface EnvLike {
  [key: string]: string | undefined;
}

/** Directory backing the local file store. Override with `COSO_MCP_DATA_DIR`. */
export function resolveDataDir(env: EnvLike = process.env): string {
  const dir = env.COSO_MCP_DATA_DIR?.trim();
  return dir && dir.length > 0 ? dir : path.join(os.homedir(), '.coso-mcp');
}

/** Actor recorded on audit events. Override with `COSO_MCP_ACTOR`. */
export function resolveActor(env: EnvLike = process.env): string {
  const actor = env.COSO_MCP_ACTOR?.trim();
  return actor && actor.length > 0 ? actor : 'local';
}
