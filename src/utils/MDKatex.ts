import type {
  MarkedExtension,
  RendererExtensionFunction,
  RendererObject,
  TokenizerAndRendererExtension,
} from 'marked';
import { useStore } from '@/stores';

export interface MarkedKatexOptions {
  /**
   * 是否使用非标准语法，默认为false
   */
  nonStandard?: boolean;
}
const inlineRule =
  /^(\${1,2})(?!\$)((?:\\.|[^\\\n])*?(?:\\.|[^\\\n$]))\1(?=[\s?!.,:？！。，：]|$)/;
const inlineRuleNonStandard =
  /^(\${1,2})(?!\$)((?:\\.|[^\\\n])*?(?:\\.|[^\\\n$]))\1/; // Non-standard, even if there are no spaces before and after $ or $$, try to parse

const blockRule = /^(\${1,2})\n((?:\\[\s\S]|[^\\])+?)\n\1(?:\n|$)/;

function createRenderer(display: boolean): RendererExtensionFunction {
  return (token) => {
    const run = () => {
      window.MathJax.texReset();
      const mjxContainer = window.MathJax.tex2svg(token.text, { display });
      const svg = mjxContainer.firstChild as SVGElement;
      const width = svg.style.minWidth || svg.getAttribute(`width`) || ``;
      svg.removeAttribute(`width`);
      svg.style.maxWidth = `300vw !important`;
      svg.style.width = width;
      svg.style.display = `initial`;
      if (display) {
        return `<section style="text-align: center; overflow: auto;">${svg.outerHTML}</section>`;
      }
      return `<span style="vertical-align: middle; line-height: 1;">${svg.outerHTML}</span>`;
    };
    try {
      return run();
    } catch (error) {
      console.log(`MathJax renderer error: ${error}`);
      // 等待1秒后再次执行
      setTimeout(() => {
        const store = useStore();
        store.editorRefresh();
      }, 1000);
      return `<span style="color: gray;">加载中</span>`;
    }
  };
}

function inlineKatex(
  options: MarkedKatexOptions,
  renderer: RendererExtensionFunction
): TokenizerAndRendererExtension {
  const nonStandard = options && options.nonStandard;
  const ruleReg = nonStandard ? inlineRuleNonStandard : inlineRule;
  return {
    name: `inlineKatex`,
    level: `inline`,
    start(src) {
      let index;
      let indexSrc = src;

      while (indexSrc) {
        index = indexSrc.indexOf(`$`);
        if (index === -1) {
          return;
        }
        const f = nonStandard
          ? index > -1
          : index === 0 || indexSrc.charAt(index - 1) === ` `;
        if (f) {
          const possibleKatex = indexSrc.substring(index);

          if (possibleKatex.match(ruleReg)) {
            return index;
          }
        }

        indexSrc = indexSrc.substring(index + 1).replace(/^\$+/, ``);
      }
    },
    tokenizer(src) {
      const match = src.match(ruleReg);
      if (match) {
        return {
          type: `inlineKatex`,
          raw: match[0],
          text: match[2].trim(),
          displayMode: match[1].length === 2,
        };
      }
    },
    renderer,
  };
}

function blockKatex(
  options: MarkedKatexOptions,
  renderer: RendererExtensionFunction
): TokenizerAndRendererExtension {
  return {
    name: `blockKatex`,
    level: `block`,
    tokenizer(src) {
      const match = src.match(blockRule);
      if (match) {
        return {
          type: `blockKatex`,
          raw: match[0],
          text: match[2].trim(),
          displayMode: match[1].length === 2,
        };
      }
    },
    renderer,
  };
}

export function MDKatex(options: MarkedKatexOptions = {}): MarkedExtension {
  return {
    extensions: [
      inlineKatex(options, createRenderer(false)),
      blockKatex(options, createRenderer(true)),
    ],
  };
}
