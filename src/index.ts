import path from 'node:path';
import { Transformer } from '@parcel/plugin';
import { marked, type MarkedOptions } from 'marked';
import yamlFrontmatter from 'yaml-front-matter';
const { loadFront } = yamlFrontmatter;

export default new Transformer({
  async loadConfig({ config }) {
    // @ts-ignore
    const conf = await config.getConfig([
      path.resolve('.markedrc'),
      path.resolve('.markedrc.js'),
      path.resolve('marked.config.js'),
    ]);
    const defaultConfig = {
      marked: {
        breaks: true,
        pedantic: false,
        gfm: true,
        tables: true,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        xhtml: false,
      },
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
    const option: { marked?: MarkedOptions } = config || {};
    const result = { ...frontMatter };
    if (option.marked) {
      result.__content = marked.parse(frontMatter.__content, { ...option.marked });
    }
    asset.type = 'js';
    asset.setCode(`export default ${JSON.stringify(result)}`);
    return [asset];
  },
});
