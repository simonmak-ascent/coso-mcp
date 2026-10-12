#!/usr/bin/env python3
"""Generate the localized APG-style landing pages for coso-mcp.

Emits public/index.html (en), public/zh/index.html, public/hk/index.html using the
vendored @simonmak-ascent/shared tokens (apg-tokens.css) and the /tools/<slug>
anatomy from apg-website specs/tools-presentation.md §4. Run from the repo root:
    python3 scripts/gen-landing.py
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUB = ROOT / "public"

SLUG = "coso-mcp"
CLIENT_KEY = "coso"
ENDPOINT = "https://internal-control.ascent-partners.com/mcp"
DOCS = "https://internal-control.ascent-partners.com"
REPO = "https://github.com/simonmak-ascent/coso-mcp"
NPM = "https://www.npmjs.com/package/@simonmak-ascent/coso-mcp"
REGISTRY = "io.github.simonmak-ascent/coso-mcp"

TECH = "https://www.ascent-partners.com/services/technology-advisory"
CONTACT = "https://www.ascent-partners.com/about#contact"
TOOLS = "https://www.ascent-partners.com/tools"

# ---- per-locale copy -------------------------------------------------------
L = {
    "en": {
        "html_lang": "en-GB",
        "base": "",  # path back to site root from this page
        "nav": "Open Tooling",
        "name": "COSO Internal Control MCP",
        "type": "MCP server",
        "value": "Run a COSO internal-control review end to end — scope, risks, controls, sampling, testing, workpapers, sign-off and deficiency evaluation.",
        "thesis": "Internal control is an argument about evidence. This runs the argument — traceable, to the framework a reviewer will test.",
        "stats": [
            ("5", "COSO components"),
            ("17", "principles"),
            ("20", "MCP tools"),
            ("Open", "no API key"),
        ],
        "caps_h": "Capabilities",
        "caps": [
            "20 tools across the full review lifecycle",
            "COSO ICIF-2013: 5 components, 17 principles, points of focus",
            "Deterministic sampling and deficiency math",
        ],
        "standards_h": "Standards",
        "standards": ["COSO ICIF-2013"],
        "connect_h": "Connect",
        "connect_intro": "Point an MCP client at the hosted endpoint. Open access, no API key.",
        "facts_h": "Facts",
        "facts": [
            ("Endpoint", ENDPOINT, True),
            ("Transport", "Streamable HTTP", False),
            ("Auth", "Open — no API key", False),
            ("Licence", "MIT", False),
            ("Registry", REGISTRY, True),
        ],
        "origin_h": "Where it comes from",
        "origin_body": "Built by the Ascent Partners technology practice. Internal-control review methodology — not audit or legal advice.",
        "tech": "Technology Advisory",
        "contact": "Contact us",
        "docs": "Documentation",
        "source": "Source",
        "back": "All tools",
        "copy": "Copy",
        "crumb_home": "Home",
        "tagline_footer": "COSO Internal Control Review — MCP server",
        "footer_note": "MIT © Simon Mak / Ascent Partners Group Limited",
    },
    "zh": {
        "html_lang": "zh-Hans",
        "base": "../",
        "nav": "开放工具",
        "name": "COSO 内部控制 MCP",
        "type": "MCP 服务器",
        "value": "端到端开展 COSO 内部控制审查——范围、风险、控制、抽样、测试、工作底稿、签署及缺陷评估。",
        "thesis": "内部控制关乎证据。这里运行整条论证——可追溯，对齐复核者将检验的框架。",
        "stats": [
            ("5", "个 COSO 要素"),
            ("17", "项原则"),
            ("20", "个 MCP 工具"),
            ("开放", "无需密钥"),
        ],
        "caps_h": "能力",
        "caps": [
            "覆盖完整审查生命周期的 20 个工具",
            "COSO ICIF-2013：5 个要素、17 项原则、关注点",
            "确定性的抽样与缺陷计算",
        ],
        "standards_h": "准则",
        "standards": ["COSO ICIF-2013"],
        "connect_h": "连接",
        "connect_intro": "将 MCP 客户端指向托管端点。开放访问，无需 API 密钥。",
        "facts_h": "信息",
        "facts": [
            ("端点", ENDPOINT, True),
            ("传输", "Streamable HTTP", False),
            ("认证", "开放——无需密钥", False),
            ("许可", "MIT", False),
            ("注册表", REGISTRY, True),
        ],
        "origin_h": "来源",
        "origin_body": "由艾升集团技术咨询团队构建。内部控制审查方法论——不构成审计或法律意见。",
        "tech": "技术咨询",
        "contact": "联系我们",
        "docs": "文档",
        "source": "源代码",
        "back": "全部工具",
        "copy": "复制",
        "crumb_home": "首页",
        "tagline_footer": "COSO 内部控制审查——MCP 服务器",
        "footer_note": "MIT © Simon Mak / Ascent Partners Group Limited",
    },
    "hk": {
        "html_lang": "zh-Hant-HK",
        "base": "../",
        "nav": "開放工具",
        "name": "COSO 內部控制 MCP",
        "type": "MCP 伺服器",
        "value": "端到端執行 COSO 內部控制審查——範圍、風險、控制、抽樣、測試、工作底稿、簽署及缺陷評估。",
        "thesis": "內部控制關乎證據。這裏運行整條論證——可追溯，對齊覆核者將檢驗的框架。",
        "stats": [
            ("5", "個 COSO 要素"),
            ("17", "項原則"),
            ("20", "個 MCP 工具"),
            ("開放", "無需密鑰"),
        ],
        "caps_h": "能力",
        "caps": [
            "覆蓋完整審查生命週期的 20 個工具",
            "COSO ICIF-2013：5 個要素、17 項原則、關注點",
            "確定性的抽樣與缺陷計算",
        ],
        "standards_h": "準則",
        "standards": ["COSO ICIF-2013"],
        "connect_h": "連接",
        "connect_intro": "將 MCP 客戶端指向託管端點。開放存取，無需 API 密鑰。",
        "facts_h": "資訊",
        "facts": [
            ("端點", ENDPOINT, True),
            ("傳輸", "Streamable HTTP", False),
            ("認證", "開放——無需密鑰", False),
            ("授權", "MIT", False),
            ("註冊表", REGISTRY, True),
        ],
        "origin_h": "來源",
        "origin_body": "由艾升集團技術諮詢團隊構建。內部控制審查方法論——不構成審計或法律意見。",
        "tech": "技術諮詢",
        "contact": "聯絡我們",
        "docs": "文件",
        "source": "原始碼",
        "back": "全部工具",
        "copy": "複製",
        "crumb_home": "首頁",
        "tagline_footer": "COSO 內部控制審查——MCP 伺服器",
        "footer_note": "MIT © Simon Mak / Ascent Partners Group Limited",
    },
}

LANGS = {"en": "English", "zh": "中文", "hk": "繁體"}

CLIENTS = [
    (
        "opencode",
        "OpenCode",
        "json",
        '{\n  "$schema": "https://opencode.ai/config.json",\n  "mcp": {\n    "%s": { "type": "remote", "url": "%s" }\n  }\n}',
    ),
    ("claude-code", "Claude Code", "bash", "claude mcp add --transport http %s %s"),
    (
        "claude-desktop",
        "Claude Desktop",
        "json",
        '{\n  "mcpServers": {\n    "%s": { "url": "%s" }\n  }\n}',
    ),
    (
        "cursor",
        "Cursor",
        "json",
        '{\n  "mcpServers": {\n    "%s": { "url": "%s" }\n  }\n}',
    ),
    (
        "vscode",
        "VS Code",
        "json",
        '{\n  "servers": {\n    "%s": { "type": "http", "url": "%s" }\n  }\n}',
    ),
    (
        "generic",
        "Any MCP client",
        "json",
        '{\n  "mcpServers": {\n    "%s": { "url": "%s" }\n  }\n}',
    ),
]


def client_code(kind, tmpl):
    return (
        tmpl % (CLIENT_KEY, ENDPOINT)
        if kind == "bash"
        else tmpl % (CLIENT_KEY, ENDPOINT)
    )


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def lang_links(loc):
    base = L[loc]["base"]
    back = base + ""  # root of site
    out = []
    for k in ("en", "zh", "hk"):
        href = base + ("" if k == "en" else k + "/")
        cur = ' aria-current="true"' if k == loc else ""
        out.append(
            f'<a class="apg-lang" href="{href}" hreflang="{L[k]["html_lang"]}"{cur}>{LANGS[k]}</a>'
        )
    return "".join(out)


def facts_html(c):
    rows = []
    for label, val, code in c["facts"]:
        v = f"<code>{esc(val)}</code>" if code else esc(val)
        rows.append(f'<div class="apg-fact"><dt>{esc(label)}</dt><dd>{v}</dd></div>')
    return "".join(rows)


def tabs_html(c):
    tabs, panes = [], []
    for i, (key, label, kind, tmpl) in enumerate(CLIENTS):
        sel = "true" if i == 0 else "false"
        hidden = "" if i == 0 else " hidden"
        pid = f"pane-{key}"
        tabs.append(
            f'<button class="apg-tab" role="tab" aria-selected="{sel}" data-target="{pid}">{esc(label)}</button>'
        )
        code = esc(client_code(kind, tmpl))
        panes.append(
            f'<div class="apg-pane" id="{pid}" role="tabpanel"{hidden}><button class="apg-copy" type="button">{esc(c["copy"])}</button><pre>{code}</pre></div>'
        )
    return "".join(tabs) + "".join(panes)


def page(loc):
    c = L[loc]
    base = c["base"]
    stats = "".join(
        f'<div class="apg-stat"><dt>{esc(lbl)}</dt><dd>{esc(val)}</dd></div>'
        for val, lbl in c["stats"]
    )
    caps = "".join(f"<li>{esc(x)}</li>" for x in c["caps"])
    chips = "".join(f"<li>{esc(x)}</li>" for x in c["standards"])
    alts = "\n".join(
        f'    <link rel="alternate" hreflang="{("x-default" if k == "en" else L[k]["html_lang"])}" href="/{"" if k == "en" else k + "/"}">'
        for k in ("en", "zh", "hk")
    )
    return f"""<!doctype html>
<html lang="{c["html_lang"]}" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{esc(c["name"])} — Ascent Partners</title>
  <meta name="description" content="{esc(c["value"])}">
  <link rel="canonical" href="/{"" if loc == "en" else loc + "/"}">
{alts}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&family=Titillium+Web:wght@400;600;700&family=Raleway:wght@600;700&display=swap" rel="stylesheet">
  <link rel="icon" href="{base}favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="{base}apg-tokens.css">
  <link rel="stylesheet" href="{base}apg-tool.css">
  <script>(function(){{try{{var v=localStorage.getItem("apg-theme");document.documentElement.setAttribute("data-theme",v==="light"||v==="dark"?v:"dark");}}catch(e){{document.documentElement.setAttribute("data-theme","dark");}}}})();</script>
</head>
<body>
  <div class="apg-topbar">
    <div class="apg-container apg-topbar-inner">
      <a class="apg-brand" href="{TOOLS}"><span class="apg-mark">AP</span> Ascent&nbsp;Partners · <span style="font-family:var(--ap-font-body);font-weight:400">{esc(c["nav"])}</span></a>
      <div class="apg-controls">
        <span class="apg-langs">{lang_links(loc)}</span>
        <button class="apg-theme-toggle" type="button" aria-label="Toggle theme">☾</button>
      </div>
    </div>
  </div>

  <header class="apg-hero">
    <img src="{base}hero.jpg" alt="" width="1440" height="750">
    <div class="apg-scrim"></div>
    <nav class="apg-crumbs" aria-label="Breadcrumb">
      <div class="apg-container">
        <ol>
          <li><a href="https://www.ascent-partners.com/">{esc(c["crumb_home"])}</a></li>
          <li><a href="{TOOLS}">{esc(c["nav"])}</a></li>
          <li aria-current="page">{esc(c["name"])}</li>
        </ol>
      </div>
    </nav>
    <h1 class="apg-container">{esc(c["name"])}</h1>
  </header>

  <main class="apg-container apg-main">
    <div class="apg-header">
      <span class="apg-badge">{esc(c["type"])}</span>
      <p class="apg-value">{esc(c["value"])}</p>
      <p class="apg-thesis">{esc(c["thesis"])}</p>
    </div>

    <dl class="apg-stats">{stats}</dl>

    <div class="apg-sections">
      <section class="apg-section-h">
        <h2>{esc(c["caps_h"])}</h2>
        <ul class="apg-caps">{caps}</ul>
      </section>
      <section class="apg-section-h">
        <h2>{esc(c["standards_h"])}</h2>
        <ul class="apg-chips">{chips}</ul>
      </section>
      <section class="apg-section-h">
        <h2>{esc(c["connect_h"])}</h2>
        <p>{esc(c["connect_intro"])}</p>
        <div class="apg-tabs" role="tablist">{tabs_html(c)}</div>
      </section>
      <section class="apg-section-h">
        <h2>{esc(c["facts_h"])}</h2>
        <dl class="apg-facts">{facts_html(c)}</dl>
      </section>
      <section class="apg-card">
        <h2>{esc(c["origin_h"])}</h2>
        <p>{esc(c["origin_body"])}</p>
        <div class="apg-inline-links">
          <a href="{TECH}">{esc(c["tech"])}</a>
          <a href="{CONTACT}">{esc(c["contact"])}</a>
        </div>
      </section>
      <div class="apg-actions">
        <a class="apg-btn apg-btn-primary" href="{DOCS}" rel="noopener">{esc(c["docs"])}</a>
        <a class="apg-btn apg-btn-secondary" href="{REPO}" rel="noopener">{esc(c["source"])}</a>
      </div>
      <a class="apg-back" href="{TOOLS}">← {esc(c["back"])}</a>
    </div>
  </main>

  <footer class="apg-footer">
    <div class="apg-container">
      <p>{esc(c["footer_note"])} · <a href="{REPO}" rel="noopener">GitHub</a> · <a href="{NPM}" rel="noopener">npm</a></p>
    </div>
  </footer>

  <script src="{base}apg-tool.js"></script>
</body>
</html>
"""


def main():
    (PUB / "index.html").write_text(page("en"), encoding="utf-8")
    (PUB / "zh").mkdir(exist_ok=True)
    (PUB / "zh" / "index.html").write_text(page("zh"), encoding="utf-8")
    (PUB / "hk").mkdir(exist_ok=True)
    (PUB / "hk" / "index.html").write_text(page("hk"), encoding="utf-8")
    print("wrote public/index.html, public/zh/index.html, public/hk/index.html")


if __name__ == "__main__":
    main()
