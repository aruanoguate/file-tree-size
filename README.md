# File Tree Size

VS Code extensions that show you exactly where size hides in your JSON and XML files — think WinDirStat, but for payloads.

**[Try the live demo](https://aruanoguate.github.io/file-tree-size/)** — no install, no sign-up, runs entirely in your browser.

[![CI](https://github.com/aruanoguate/file-tree-size/actions/workflows/sonarcloud.yml/badge.svg)](https://github.com/aruanoguate/file-tree-size/actions/workflows/sonarcloud.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=aruanoguate_file-tree-size&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=aruanoguate_file-tree-size)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=aruanoguate_file-tree-size&metric=coverage)](https://sonarcloud.io/summary/new_code?id=aruanoguate_file-tree-size)

| Extension | Version | Open VSX | Installs | Rating |
|---|---|---|---|---|
| JSON Tree Size | [![Version](https://vsmarketplacebadges.dev/version/AlvaroEnriqueRuano.json-treesize.svg)](https://marketplace.visualstudio.com/items?itemName=AlvaroEnriqueRuano.json-treesize) | [![Open VSX](https://img.shields.io/open-vsx/v/AlvaroEnriqueRuano/json-treesize?label=Open%20VSX)](https://open-vsx.org/extension/AlvaroEnriqueRuano/json-treesize) | [![Installs](https://vsmarketplacebadges.dev/installs/AlvaroEnriqueRuano.json-treesize.svg)](https://marketplace.visualstudio.com/items?itemName=AlvaroEnriqueRuano.json-treesize) | [![Rating](https://vsmarketplacebadges.dev/rating/AlvaroEnriqueRuano.json-treesize.svg)](https://marketplace.visualstudio.com/items?itemName=AlvaroEnriqueRuano.json-treesize) |
| XML Tree Size | [![Version](https://vsmarketplacebadges.dev/version/AlvaroEnriqueRuano.xml-tree-size.svg)](https://marketplace.visualstudio.com/items?itemName=AlvaroEnriqueRuano.xml-tree-size) | [![Open VSX](https://img.shields.io/open-vsx/v/AlvaroEnriqueRuano/xml-tree-size?label=Open%20VSX)](https://open-vsx.org/extension/AlvaroEnriqueRuano/xml-tree-size) | [![Installs](https://vsmarketplacebadges.dev/installs/AlvaroEnriqueRuano.xml-tree-size.svg)](https://marketplace.visualstudio.com/items?itemName=AlvaroEnriqueRuano.xml-tree-size) | [![Rating](https://vsmarketplacebadges.dev/rating/AlvaroEnriqueRuano.xml-tree-size.svg)](https://marketplace.visualstudio.com/items?itemName=AlvaroEnriqueRuano.xml-tree-size) |

## Extensions

### [JSON Tree Size](packages/json-tree-size/)

Analyze JSON files — see which keys consume the most bytes, drill into nested objects, and jump straight to the source line. Right-click any `.json` file or use the Command Palette.

Install from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=AlvaroEnriqueRuano.json-treesize) or search **"JSON Tree Size"** in VS Code.

### [XML Tree Size](packages/xml-tree-size/)

Same experience for XML and SOAP payloads — elements, attributes, text, and CDATA nodes sized and ranked in an interactive tree.

Install from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=AlvaroEnriqueRuano.xml-tree-size) or search **"XML Tree Size"** in VS Code.

## Preview Site

A [live browser preview](https://aruanoguate.github.io/file-tree-size/) is available under `packages/tree-size-preview/`.

- Landing page plus live JSON/XML preview share the same parser and tree UI logic as the VS Code extensions.
- GitHub Pages deployment is handled by `.github/workflows/pages-preview.yml`.
- Local preview workflow:
	- `npm run preview:build`
	- `npm run preview:serve`
	- optional live rebuilds in a second terminal: `npm run preview:watch`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, architecture overview, and release process.

## License

[MIT](LICENSE)

---

*Made with care by [Alvaro Enrique Ruano](https://github.com/aruanoguate). If you find these useful, a ⭐ on [GitHub](https://github.com/aruanoguate/file-tree-size) is appreciated!*
