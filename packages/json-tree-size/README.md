# JSON Tree Size — JSON File Size Analyzer for VS Code

[![Visual Studio Marketplace](https://vsmarketplacebadges.dev/version/AlvaroEnriqueRuano.json-treesize.svg)](https://marketplace.visualstudio.com/items?itemName=AlvaroEnriqueRuano.json-treesize)
[![Installs](https://vsmarketplacebadges.dev/installs/AlvaroEnriqueRuano.json-treesize.svg)](https://marketplace.visualstudio.com/items?itemName=AlvaroEnriqueRuano.json-treesize)
[![Rating](https://vsmarketplacebadges.dev/rating/AlvaroEnriqueRuano.json-treesize.svg)](https://marketplace.visualstudio.com/items?itemName=AlvaroEnriqueRuano.json-treesize)
[![Open VSX](https://img.shields.io/open-vsx/v/AlvaroEnriqueRuano/json-treesize?label=Open%20VSX)](https://open-vsx.org/extension/AlvaroEnriqueRuano/json-treesize)
[![CI](https://github.com/aruanoguate/file-tree-size/actions/workflows/sonarcloud.yml/badge.svg)](https://github.com/aruanoguate/file-tree-size/actions/workflows/sonarcloud.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=aruanoguate_file-tree-size&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=aruanoguate_file-tree-size)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=aruanoguate_file-tree-size&metric=coverage)](https://sonarcloud.io/summary/new_code?id=aruanoguate_file-tree-size)

> **TL;DR** — Right-click any `.json` file → instant tree-map showing which keys eat the most bytes. [**Try the live demo**](https://aruanoguate.github.io/file-tree-size/) in your browser first — zero install, zero sign-up.

**Ever wondered what's bloating that 50 MB JSON file?**

JSON Tree Size gives you the same "what's eating my disk?" experience as [TreeSize](https://www.jam-software.com/treesize) or [WinDirStat](https://windirstat.net/) — but for JSON files, right inside VS Code. No CLI tools, no pasting into online formatters, no leaving your editor.

Built by a developer, for developers. Free and open-source. Processing happens locally, and your file contents are not uploaded by this extension.

![JSON Tree Size — split view with tree explorer and detail bar chart](https://raw.githubusercontent.com/aruanoguate/file-tree-size/main/packages/json-tree-size/docs/screenshot.png)

## 🚀 Try Before You Install

Not ready to commit? **[Try the live demo](https://aruanoguate.github.io/file-tree-size/)** right in your browser — no install, no sign-up, no commitment. Load a sample file or paste your own JSON and explore the full tree-size experience instantly. When you're convinced, come back and install with one click.

## Why JSON Tree Size?

| Problem | Solution |
|---------|----------|
| "This config file is 12 MB and I have no idea why" | Instantly see which keys consume the most bytes |
| "I need to cut our API response payload" | Drill down the tree to find the heaviest nested objects |
| "Online JSON size tools feel sketchy for production data" | Everything runs locally in VS Code — your file contents are never uploaded by the extension |
| "I found the big key — now I need to edit it" | Click **"Open in editor"** to jump straight to that line in the source |

## Features

- **Interactive tree explorer** — expandable nodes showing byte size and percentage of parent
- **Detail bar chart** — click any node to see its children ranked by size with percentage bars
- **HSL heat-map coloring** — larger nodes get vivid colors, smaller nodes fade to background
- **Theme-aware** — color scale adjusts automatically for dark, light, and high-contrast themes
- **Configurable base color** — pick any hex color from the Settings UI color picker
- **Expand / Collapse all** — toolbar buttons in the tree pane
- **Left↔right sync** — clicking a bar in the detail pane highlights the tree node
- **Open in editor** — one-click navigation from any node to its position in the raw JSON
- **Worker thread parsing** — files up to 50 MB+ parsed without blocking the editor UI
- **20 languages** — localized UI in Spanish, Chinese, Japanese, Korean, French, German, and [14 more](l10n/)

## Getting Started

### Install

Search for **"JSON Tree Size"** in the VS Code Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`), or install from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=AlvaroEnriqueRuano.json-treesize).

### Option 1 — Right-click a JSON file

Right-click any `.json` file in the Explorer sidebar and select **"Analyze with JSON Tree Size"**.

### Option 2 — Command Palette

With a `.json` file open, press `Ctrl+Shift+P` (`Cmd+Shift+P` on macOS) and type **"JSON Tree Size: Analyze"**.

![Command Palette → JSON Tree Size: Analyze](https://raw.githubusercontent.com/aruanoguate/file-tree-size/main/packages/json-tree-size/docs/demo-command-palette.gif)

### Exploring the results

Click nodes in the tree to see their children ranked by size in the detail pane. The two panels stay in sync — clicking a bar on the right highlights the node on the left, and vice versa. Use **Expand / Collapse all** to navigate large files, and **Open in editor** to jump straight to the source.

![Interacting with the tree and detail pane](https://raw.githubusercontent.com/aruanoguate/file-tree-size/main/packages/json-tree-size/docs/demo-interaction.gif)

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| [`jsonTreeSize.baseColor`](vscode://settings/jsonTreeSize.baseColor) | `"#4a9eda"` | Base color for the size heat map. Opens a native color picker in Settings. Leave empty for the default blue. |

## Common Use Cases

- **API payload optimization** — identify which fields dominate your REST/GraphQL responses and trim them to cut bandwidth
- **Config file audit** — find why your `package.json`, `tsconfig.json`, or app config ballooned to megabytes
- **Data pipeline debugging** — spot unexpected array growth or deeply nested objects in ETL output
- **Bundle analysis** — visualize source maps and build manifests to understand what's adding weight
- **Log file triage** — quickly locate the verbose keys in structured JSON logs

## Frequently Asked Questions

**Is my data safe?**
Yes — JSON Tree Size runs entirely inside VS Code. Your file contents are processed locally and are not uploaded by the extension. [Try the live demo](https://aruanoguate.github.io/file-tree-size/) to verify — it runs 100 % in the browser too.

**How large a file can it handle?**
Worker thread parsing keeps the editor responsive for files over 50 MB. The practical limit is your available memory.

**Does it work with JSONC / JSON5 / JSON with comments?**
It parses standard JSON (RFC 8259). Files with trailing commas or comments will show a parse error.

**Can I use it with XML too?**
Yes — check out the companion extension **[XML Tree Size](https://marketplace.visualstudio.com/items?itemName=AlvaroEnriqueRuano.xml-tree-size)** for XML and SOAP payloads.

## Contributing

See the [Contributing Guide](../../CONTRIBUTING.md) for development setup, architecture overview, and release process.

## License

[MIT](LICENSE) — free for personal and commercial use.

---

*Made with care by [Alvaro Enrique Ruano](https://github.com/aruanoguate). If you find this useful, a ⭐ on [GitHub](https://github.com/aruanoguate/file-tree-size) is appreciated!*
