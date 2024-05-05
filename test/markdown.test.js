const fs = require('node:fs/promises');
const url = require('node:url');
const { Parcel } = require('@parcel/core');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const bundler = new Parcel({
  entries: './markdown/index.html',
  defaultConfig: '@parcel/config-default',
  defaultTargetOptions: {
    distDir: './dist'
  },
  shouldDisableCache: true,
});

class FileResourceLoader extends jsdom.ResourceLoader {
  fetch(url, options) {
    const parsedUrl = new URL(url);
    return fs.readFile(`./dist${parsedUrl.pathname}`);
  }
}

test('render a markdown file', async () => {
  return expect(new Promise(async (resolve, reject) => {
    await bundler.run();
    const virtualConsole = new jsdom.VirtualConsole();
    const logs = [];
    virtualConsole.on('log', (message) => {
      logs.push(message);
    });
    const dom = await JSDOM.fromFile('./dist/index.html', {
      runScripts: 'dangerously',
      resources: new FileResourceLoader(),
      virtualConsole,
    });
    dom.window.onEnd = () => {
      resolve(logs);
    };
  })).resolves.toEqual([
    'parcel-transformer-markdown-front-matter',
    `<h1 id="markdown">Markdown</h1>
<p>Markdown content</p>`
  ]);
});
