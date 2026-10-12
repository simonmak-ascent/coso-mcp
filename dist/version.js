/**
 * Server identity, framework label and the mandatory disclaimer.
 *
 * These are stable constants surfaced by the `get_server_info` tool and reused
 * across the tool surface. `SERVER_VERSION` must track `package.json`.
 */
export const SERVER_NAME = '@simonmak-ascent/coso-mcp';
export const SERVER_VERSION = '0.1.0';
export const SERVER_TITLE = 'COSO Internal Control Review';
export const SERVER_DESCRIPTION = 'Open MCP server for internal-control reviews under the COSO Internal Control—Integrated Framework (ICIF-2013): scope, risk assessment, control register, population and sampling, attribute testing, workpapers, review sign-off, deficiency evaluation and reporting.';
export const FRAMEWORK_LABEL = 'COSO Internal Control—Integrated Framework (ICIF-2013)';
/**
 * Shipped on every assessment/report surface. The server assists with
 * methodology; it is not an audit opinion and does not provide legal advice.
 */
export const DISCLAIMER = 'This server assists with internal-control review workflows under the COSO Internal Control—Integrated Framework. It does not provide audit or legal advice. All testing workpapers and assessments must be reviewed by qualified financial professionals before use in audit documentation.';
//# sourceMappingURL=version.js.map