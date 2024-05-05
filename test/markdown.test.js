const fs = require('node:fs/promises');
const path = require('node:path');
const url = require('node:url');
const { Parcel } = require('@parcel/core');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;


beforeAll(() => {
  return fs.mkdir('./tmp');
});

afterAll(() => {
  return fs.rm('./tmp', { recursive: true });
});

async function copySiteToTempDir() {
  const dir = await fs.mkdtemp(path.join('./tmp', 'site-'));
  await fs.cp('./markdown', dir, { recursive: true });
  return dir;
}

function writeMarkedConfig(dir, config) {
  return fs.writeFile(path.join(dir, '.markedrc'), JSON.stringify(config));
}

function renderSite(dir) {
  const bundler = new Parcel({
    entries: path.join(dir, 'index.html'),
    defaultConfig: '@parcel/config-default',
    defaultTargetOptions: {
      distDir: path.join(dir, 'dist')
    },
    shouldDisableCache: true,
  });
  return bundler.run();
}

function runAndGetConsoleOutput(distPath) {
  return new Promise(async (resolve, reject) => {
    try {
      const virtualConsole = new jsdom.VirtualConsole();
      const logs = [];
      virtualConsole.on('log', (message) => {
        logs.push(message);
      });
      const dom = await JSDOM.fromFile(path.join(distPath, 'index.html'), {
        runScripts: 'dangerously',
        resources: new FileResourceLoader(distPath),
        virtualConsole,
      });
      dom.window.onEnd = () => {
        resolve(logs);
      };
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
}

class FileResourceLoader extends jsdom.ResourceLoader {
  constructor(distPath) {
    super();
    this.distPath = distPath;
  }
  fetch(url, options) {
    const parsedUrl = new URL(url);
    return fs.readFile(path.join(this.distPath, parsedUrl.pathname));
  }
}

test('render a markdown file to HTML', async () => {
  const dir = await copySiteToTempDir();
  await renderSite(dir);
  const logs = await runAndGetConsoleOutput(path.join(dir, 'dist'));
  expect(logs).toEqual([
    'parcel-transformer-markdown-front-matter',
    `<h1 id="markdown">Markdown</h1>
<p>Markdown content</p>`
  ]);
});

test('render a markdown file without HTML', async () => {
  const dir = await copySiteToTempDir();
  await writeMarkedConfig(dir, { marked: false });
  await renderSite(dir);
  const logs = await runAndGetConsoleOutput(path.join(dir, 'dist'));
  expect(logs).toEqual([
    'parcel-transformer-markdown-front-matter',
    `# Markdown

Markdown content`
  ]);
});
