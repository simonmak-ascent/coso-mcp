/**
 * MCP discovery document served at `/.well-known/mcp`.
 */
export default function wellKnown(_req, res) {
  res.setHeader('content-type', 'application/json');
  res.setHeader('cache-control', 'public, max-age=3600');
  res.statusCode = 200;
  res.end(
    JSON.stringify({
      name: 'com.ascent-partners/coso-mcp',
      description:
        'Open MCP server for COSO (ICIF-2013) internal-control reviews: scope, risk, controls, sampling, testing, workpapers, sign-off, deficiency evaluation and reporting.',
      transport: 'streamable-http',
      endpoint: 'https://internal-control.ascent-partners.com/mcp',
      protocol: 'modelcontextprotocol',
      license: 'MIT',
      repository: 'https://github.com/simonmak-ascent/coso-mcp',
      access: 'open (writes are ephemeral and not persisted)'
    })
  );
}
