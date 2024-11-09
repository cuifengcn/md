import type { RendererThis, Tokens } from 'marked';
import type { Directive } from './types.ts';
import { isVoidElements } from './utils.ts';

/**
 * Default renderer for directive tokens.
 *
 * @param this - The RendererThis context.
 * @param token - The directive token to render.
 * @returns Rendered HTML string.
 */
export function directiveRenderer(this: RendererThis, token: Tokens.Generic) {
  const { meta, attrs, tokens = [] } = token as Directive;
  if (
    meta.name &&
    [`block`, `block-1`, `block-2`, `block-3`].includes(meta.name)
  ) {
    const section = `<section class="block-inner ${meta.name}-inner">${this.parser.parse(tokens)}</section>`;
    return `<section class="block ${meta.name}">${section}</section>`;
  } else {
    const tagname = meta.name || meta.tag;

    let elem = `<${tagname}`;
    elem += attrs ? ` ${attrs.toString()}` : ``;
    elem += isVoidElements(tagname) ? ` />` : `>`;
    elem += meta.level === `container` ? `\n` : ``;

    if (!isVoidElements(tagname)) {
      elem +=
        meta.level === `container`
          ? this.parser.parse(tokens)
          : this.parser.parseInline(tokens);
      elem += `</${tagname}>`;
    }

    elem += meta.level === `inline` ? `` : `\n`;

    return elem;
  }
}
