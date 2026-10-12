export interface EnvLike {
    [key: string]: string | undefined;
}
/** Directory backing the local file store. Override with `COSO_MCP_DATA_DIR`. */
export declare function resolveDataDir(env?: EnvLike): string;
/** Actor recorded on audit events. Override with `COSO_MCP_ACTOR`. */
export declare function resolveActor(env?: EnvLike): string;
//# sourceMappingURL=config.d.ts.map