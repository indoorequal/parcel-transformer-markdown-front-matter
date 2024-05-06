import path from 'node:path';
import { Transformer } from '@parcel/plugin';
import { marked, type MarkedOptions, type MarkedExtension } from 'marked';
import yamlFrontmatter from 'yaml-front-matter';
const { loadFront } = yamlFrontmatter;

export default new Transformer({
  async loadConfig({ config }) {
    // @ts-ignore
    const conf = await config.getConfig([
      '.markedrc',
      '.markedrc.js',
      'marked.config.js',
    ]);
    const defaultConfig = {
      marked: {
        breaks: true,
        pedantic: false,
        gfm: true
      },
      extensions: [],
    };
    if (conf) {
      let isJavascript = path.extname(conf.filePath) === '.js';
      if (isJavascript) {
        config.invalidateOnStartup();
      }
      return {
        ...defaultConfig,
        ...conf.contents as any,
      };
    } else {
      return defaultConfig;
    }
  },
  async transform({ asset, config }) {
    const code = await asset.getCode();
    const frontMatter = loadFront(code);
    const option: { marked?: MarkedOptions, extensions?: MarkedExtension[] } = config || {};
    option.extensions?.forEach((extension) => {
      marked.use(extension);
    })
    const result = { ...frontMatter };
    if (option.marked) {
      result.__content = await marked.parse(frontMatter.__content, { ...option.marked });
    }
    asset.type = 'js';
    asset.setCode(`export default ${JSON.stringify(result)}`);
    return [asset];
  },
});
