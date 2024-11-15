import type { ExtendedProperties, IOpts, ThemeStyles } from '@/types';
import type { PropertiesHyphen } from 'csstype';
import type { MarkedOptions, Renderer, RendererObject, Tokens } from 'marked';

import { toMerged } from 'es-toolkit';
import hljs from 'highlight.js';
import { marked } from 'marked';
import mermaid from 'mermaid';
import markedAlert from './markdownExtensions/alert';
import { createDirectives } from './markdownExtensions/directive';
import { MDKatex } from './MDKatex';

marked.use(MDKatex({ nonStandard: true }));
marked.use(markedAlert());
marked.use(createDirectives());

function cleanUrl(href: string) {
  try {
    href = encodeURI(href).replace(/%25/g, `%`);
  } catch {
    return href;
  }
  return href;
}

// function buildTheme({ theme, fonts, size }: IOpts): ThemeStyles {
//   const base = toMerged(theme.base, {
//     'font-family': fonts,
//     'font-size': size,
//   })

//   const mergeStyles = (
//     styles: Record<string, PropertiesHyphen>,
//   ): Record<string, ExtendedProperties> =>
//     Object.fromEntries(
//       Object.entries(styles).map(([ele, style]) => [ele, toMerged(base, style)]),
//     )
//   return {
//     ...mergeStyles(theme.inline),
//     ...mergeStyles(theme.block),
//   } as ThemeStyles
// }

function buildAddition(): string {
  return `
    <style>
      .preview-wrapper pre::before {
        position: absolute;
        top: 0;
        right: 0;
        color: #ccc;
        text-align: center;
        font-size: 0.8em;
        padding: 5px 10px 0;
        line-height: 15px;
        height: 15px;
        font-weight: 600;
      }
    </style>
  `;
}

// function getStyles(
//   styleMapping: ThemeStyles,
//   tokenName: string,
//   addition: string = ``,
//   wrapUp = true
// ): string {
//   const dict = styleMapping[tokenName as keyof ThemeStyles];
//   if (!dict) {
//     return ``;
//   }
//   const styles = Object.entries(dict)
//     .map(([key, value]) => `${key}:${value}`)
//     .join(`;`);
//   if (!wrapUp) {
//     return `${styles}${addition}`;
//   }
//   return `style="${styles}${addition}"`;
// }

function buildFootnoteArray(footnotes: [number, string, string][]): string {
  return footnotes
    .map(([index, title, link]) => {
      const ele =
        link === title
          ? `<code>[${index}]</code>: <i>${title}</i>`
          : `<code>[${index}]</code> ${title}: <i>${link}</i>`;
      return `<p>${ele}</p>`;
    })
    .join(`\n`);
}

function transform(
  legend: string,
  text: string | null,
  title: string | null
): string {
  const options = legend.split(`-`);
  for (const option of options) {
    if (option === `alt` && text) {
      return text;
    }
    if (option === `title` && title) {
      return title;
    }
  }
  return ``;
}

const macCodeSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" width="45px" height="13px" viewBox="0 0 450 130">
    <ellipse cx="65" cy="65" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2" fill="rgb(237,108,96)" />
    <ellipse cx="225" cy="65" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2" fill="rgb(247,193,81)" />
    <ellipse cx="385" cy="65" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2" fill="rgb(100,200,86)" />
  </svg>
`.trim();

export function initRenderer(opts: IOpts) {
  const footnotes: [number, string, string][] = [];
  let footnoteIndex: number = 0;
  // let styleMapping: ThemeStyles = buildTheme(opts)
  let codeIndex: number = 0;
  let listIndex: number = 0;
  let isOrdered: boolean = false;

  function styledContent(
    styleLabel: string,
    content: string,
    tagName?: string
  ): string {
    const tag = styleLabel ?? tagName;
    return `<${tag} >${content}</${tag}>`;
  }

  function addFootnote(title: string, link: string): number {
    footnotes.push([++footnoteIndex, title, link]);
    return footnoteIndex;
  }

  function reset(newOpts: Partial<IOpts>): void {
    footnotes.length = 0;
    footnoteIndex = 0;
    setOptions(newOpts);
  }

  function setOptions(newOpts: Partial<IOpts>): void {
    opts = { ...opts, ...newOpts };
    // styleMapping = buildTheme(opts)
  }

  const buildFootnotes = () => {
    if (!footnotes.length) {
      return ``;
    }

    return (
      styledContent(
        `h4`,
        `<span class="prefix"></span><span class="content">引用链接</span><span class="suffix"></span>`
      ) + styledContent(`footnotes`, buildFootnoteArray(footnotes), `p`)
    );
  };

  const renderer: RendererObject = {
    // 完善renderer
    space(_token: Tokens.Space) {
      return ``;
    },
    html(token: Tokens.HTML | Tokens.Tag) {
      const text = token.text;
      return text;
    },
    checkbox({ checked }: Tokens.Checkbox) {
      return `<input ${
        checked ? `checked="" ` : ``
      }disabled="" type="checkbox">`;
    },
    tablerow({ text }: Tokens.TableRow) {
      return `<tr>\n${text}</tr>\n`;
    },
    br(_token: Tokens.Br) {
      return `<br>`;
    },
    del({ tokens }: Tokens.Del) {
      return `<del>${this.parser.parseInline(tokens)}</del>`;
    },
    text(token: Tokens.Text | Tokens.Escape | Tokens.Tag) {
      return `tokens` in token && token.tokens
        ? this.parser.parseInline(token.tokens)
        : token.text;
    },

    heading({ tokens, depth }: Tokens.Heading) {
      const text = this.parser.parseInline(tokens);
      const tag = `h${depth}`;
      return `<${tag} ><span class="prefix"></span><span class="content">${text}</span><span class="suffix"></span></${tag}>`;
      // return styledContent(tag, text);
    },

    paragraph({ tokens }: Tokens.Paragraph): string {
      const text = this.parser.parseInline(tokens);
      const isFigureImage = text.startsWith(`<figure`); // || text.startsWith(`<img`);
      const isEmpty = text.trim() === ``;
      if (isFigureImage || isEmpty) {
        return text;
      }
      return styledContent(`p`, text);
    },

    blockquote({ tokens }: Tokens.Blockquote): string {
      let text = this.parser.parse(tokens);
      text = text.replace(/<p .*?>/g, `<p class="blockquote_p">`);
      return styledContent(`blockquote`, text);
    },

    code({ text, lang = `` }: Tokens.Code): string {
      if (lang.startsWith(`mermaid`)) {
        clearTimeout(codeIndex);
        codeIndex = setTimeout(() => {
          mermaid.run();
        }, 0) as any as number;
        return `<pre class="mermaid">${text}</pre>`;
      }
      const langText = lang.split(` `)[0];
      const language = hljs.getLanguage(langText) ? langText : `plaintext`;
      let highlighted = hljs.highlight(text, { language }).value;
      highlighted = highlighted
        .replace(/\r\n/g, `<br/>`)
        .replace(/\n/g, `<br/>`)
        .replace(/(>[^<]+)|(^[^<]+)/g, (str) => str.replace(/\s/g, `&nbsp;`));
      const span = `<span class="mac-sign" style="padding: 10px 14px 0;" hidden>${macCodeSvg}</span>`;
      const code = `<code class="language-${lang}">${highlighted}</code>`;
      return `<pre class="hljs code__pre code_pre">${span}${code}</pre>`;
    },

    codespan({ text }: Tokens.Codespan): string {
      return styledContent(`codespan`, text, `code`);
    },

    listitem(item: Tokens.ListItem): string {
      const prefix = isOrdered ? `${listIndex + 1}. ` : `• `;
      const content = item.tokens
        .map((t) =>
          (this[t.type as keyof Renderer] as <T>(token: T) => string)(t)
        )
        .join(``);
      return styledContent(`listitem`, `${prefix}${content}`, `li`);
    },

    list({ ordered, items }: Tokens.List): string {
      const listItems = [];
      for (let i = 0; i < items.length; i++) {
        isOrdered = ordered;
        listIndex = i;
        const item = items[i];
        listItems.push(this.listitem(item));
      }
      const label = ordered ? `ol` : `ul`;
      return styledContent(label, listItems.join(``));
    },

    image({ href, title, text }: Tokens.Image): string {
      href = cleanUrl(href);
      if (title || text) {
        const subText = transform(opts.legend!, text, title);
        if (subText) {
          // 如果存在标题，生成带有标题的图像 HTML 代码
          const figcaption = styledContent(`figcaption`, subText);
          return `<figure><img src="${href}" title="${title}" alt="${text}"/>${figcaption}</figure>`;
        }
      }
      // 如果不存在标题，生成不带标题的图像 HTML 代码
      const out = `<figure><img src="${href}" alt="${text}"/></figure>`;
      return out;
    },

    link({ href, title, tokens }: Tokens.Link): string {
      href = cleanUrl(href);
      let text = this.parser.parseInline(tokens);
      if (!text) return ``;
      const className = href.startsWith(`https://mp.weixin.qq.com`)
        ? `wx_link`
        : `link`;

      const isImage = tokens[0].type === `image`;
      title ||= isImage ? (tokens as Tokens.Image[])[0].text : text || ``;

      if (isImage) {
        const token = (tokens as Tokens.Image[])[0];
        const img = `<img src="${token.href}" title="${token.title}"/>`;
        let figcaptionText = transform(opts.legend!, token.text, token.title);
        if (opts.status) {
          const ref = addFootnote(title || text, href);
          figcaptionText = `${figcaptionText}<sup>[${ref}]</sup>`;
        }
        const figcaption = figcaptionText
          ? styledContent(`figcaption`, figcaptionText)
          : ``;

        return `<figure><a href="${href}" title="${title}" class="${className}">${img}</a>${figcaption}</figure>`;
      } else {
        if (opts.status) {
          const ref = addFootnote(title || text, href);
          text = `${text}<sup>[${ref}]</sup>`;
        }
        return `<a href="${href}" title="${title}" class="${className}">${text}</a>`;
      }

      // const isFigureImage = text.startsWith(`<figure`); // || text.startsWith(`<img`);
      // if (isFigureImage) {
      //   title = title || (tokens as Tokens.Image[])[0].text || ``;
      // }

      // if (href.startsWith(`https://mp.weixin.qq.com`)) {
      //   return `<a href="${href}" title="${title || text}" class="wx_link">${text}</a>`;
      // }

      // if (isFigureImage) {
      //   return `<a href="${href}" title="${title}" class="link">${text}</a>`;
      // }
      // if (href === text) {
      //   return text;
      // }
      // if (opts.status) {
      //   const ref = addFootnote(title || text, href);
      //   return `<a href="#" title="${title}" class="link">${text}<sup>[${ref}]</sup></a>`;
      // }
      // return `<a href="${href}" title="${title || text}" class="link">${title || text}</a>`;
    },

    strong({ tokens }: Tokens.Strong): string {
      return styledContent(`strong`, this.parser.parseInline(tokens));
    },

    em({ tokens }: Tokens.Em): string {
      return styledContent(`em`, this.parser.parseInline(tokens), `span`);
    },

    table({ header, rows }: Tokens.Table): string {
      const headerRow = header.map((cell) => this.tablecell(cell)).join(``);
      const body = rows
        .map((row) => {
          const rowContent = row.map((cell) => this.tablecell(cell)).join(``);
          return styledContent(`tr`, rowContent);
        })
        .join(``);
      return `
        <section class="table-container" style="padding:0 8px; max-width: 100%; overflow: auto">
          <table class="preview-table">
            <thead>${headerRow}</thead>
            <tbody>${body}</tbody>
          </table>
        </section>
      `;
    },

    tablecell(token: Tokens.TableCell): string {
      const text = this.parser.parseInline(token.tokens);
      return styledContent(`td`, text);
    },

    hr(_: Tokens.Hr): string {
      return styledContent(`hr`, ``);
    },
  };

  marked.use({ renderer });

  return {
    buildAddition,
    buildFootnotes,
    setOptions,
    reset,
  };
}
