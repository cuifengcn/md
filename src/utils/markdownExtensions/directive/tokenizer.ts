import type { Token, TokenizerThis } from 'marked';
import type { Directive, DirectiveMeta } from './types.ts';
import parseAttrs, { type Attributes } from 'attributes-parser';
import moo from 'moo';

const lexer = moo.compile({
  spaces: /[\t\v\f\uFEFF ]+/,
  // eslint-disable-next-line regexp/use-ignore-case
  name: /[a-zA-Z][\w-]*/,
  attrs: {
    match: /\{.*\}/,
    value: (x) => parseAttrs(x.slice(1, -1)) as unknown as string,
  },
  text: {
    match: /\[.*\]/,
    value: (x) => x.slice(1, -1),
  },
  blockText: { match: /[\s\S]+/, lineBreaks: true },
});

export interface DirectiveTokenizerConfig extends DirectiveMeta {
  type: string;
  raw: string;
  content: string;
}

/**
 * Create a directive token from a directive string.
 */
export function createToken(
  this: TokenizerThis,
  config: DirectiveTokenizerConfig
) {
  const { type, level, raw, content, marker, tag } = config;

  const lex = lexer.reset(content);

  let name;
  let attrs: Directive[`attrs`];
  let text = ``;
  let tokens: Token[] = [];

  for (const { type, value } of lex) {
    switch (type) {
      case `name`:
        name = value;
        break;
      case `attrs`:
        attrs = value as unknown as Attributes;
        break;
      case `text`:
      case `blockText`:
        text = value;
        tokens =
          level === `container`
            ? this.lexer.blockTokens(value)
            : this.lexer.inlineTokens(value);
        break;
    }
  }

  return <Directive>{
    type,
    raw,
    meta: { level, marker, tag, name },
    attrs,
    text,
    tokens,
  };
}
