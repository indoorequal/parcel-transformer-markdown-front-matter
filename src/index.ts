import { Transformer } from '@parcel/plugin';
import path from 'path';
import { marked } from 'marked';
import { loadFront } from 'yaml-front-matter';

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
    let code = await asset.getCode();
    code = loadFront(code);
    const option: { marked?: marked.MarkedOptions } = config || {};
    if (option.marked) {
      code.__content = marked.parse(code.__content, { ...option.marked });
    }
    asset.type = 'js';
    asset.setCode(`export default ${JSON.stringify(code)}`);
    return [asset];
  },
});
