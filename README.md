# parcel-transformer-markdown-front-matter


[![NPM Downloads](https://img.shields.io/npm/dm/parcel-transformer-markdown-front-matter.svg?style=flat)](https://www.npmjs.com/package/parcel-transformer-markdown-front-matter)
[![Build & Deploy](https://github.com/indoorequal/parcel-transformer-markdown-front-matter/actions/workflows/ci.yml/badge.svg)](https://github.com/indoorequal/parcel-transformer-markdown-front-matter/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/parcel-transformer-markdown-front-matter.svg)](https://www.npmjs.com/package/parcel-transformer-markdown-front-matter)

[**`Parcel 2`**](https://parceljs.org/) plugin to load markdown file and YAML Front matter

## Example usage

Install the plugin

```bash
npm install parcel-transformer-markdown-front-matter --save-dev
```

`.parcelrc`

```js
{
  "extends": "@parcel/config-default",
  "transformers": {
    "*.md": [ "parcel-transformer-markdown-front-matter" ]
  }
}
```

`Markdown.md`:

```markdown
---
title: My title
---

# Markdown content
```

**Output HTML string**

Import your markdown file, and get the HTML content and the yaml front matter properties.

```js
import file from './Markdown.md';

console.log(file.__content) // => Output HTML string.
console.log(file.title) // output title property
document.body.innerHTML = file.__content;
```

**Output Markdown string**

```js
// .markedrc
{
  "marked": false
}
```

```js
import file from './Markdown.md';

console.log(file.__content) // => Output Markdown string.
document.body.innerHTML = file.__content;
```

## Configuration

[Marked](https://github.com/markedjs/marked) can be configured using a `.markedrc`, `.markedrc.js`, or `marked.config.js` file. See the [Marked API Reference](https://marked.js.org/using_advanced#options) for details on the available options.

> Note: `.markedrc.js` and `marked.config.js` are supported for JavaScript-based configuration, but should be avoided when possible because they reduce the effectiveness of Parcel's caching. Use a JSON based configuration format (e.g. `.markedrc`) instead.

There is a `marked` configuration that converts `markdown` to `HTML`. Otherwise just read the `markdown` string.

```js
{
  "marked": {
    "breaks": true,
    "pedantic": false,
    "gfm": true,
    "tables": true,
    "sanitize": false,
    "smartLists": true,
    "smartypants": false,
    "xhtml": false
  }
}
```

## License

MIT

© 2024 François de Metz
© 2022 [Kenny Wong](https://wangchujiang.com)
