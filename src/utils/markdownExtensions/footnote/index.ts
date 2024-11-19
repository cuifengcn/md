import type { MarkedExtension } from 'marked';
import type { LexerTokens, Options } from './types.ts';
import { createFootnote } from './footnote.ts';
import { createFootnotes } from './footnotes.ts';
import { createFootnoteRef } from './references.ts';

/**
 * A [marked](https://marked.js.org/) extension to support [GFM footnotes](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#footnotes).
 */
export function markedFootnote(options: Options = {}): MarkedExtension {
  const {
    prefixId = `footnote-`,
    description = `Footnotes`,
    refMarkers,
  } = options;
  const lexer: LexerTokens = { hasFootnotes: false, tokens: [] };

  return {
    extensions: [
      createFootnote(lexer, description),
      createFootnoteRef(prefixId, refMarkers),
      createFootnotes(prefixId),
    ],
    walkTokens(token) {
      if (
        token.type === `footnotes` &&
        lexer.tokens.indexOf(token) === 0 &&
        token.items.length
      ) {
        lexer.tokens[0] = { type: `space`, raw: `` };
        lexer.tokens.push(token);
      }

      if (lexer.hasFootnotes) lexer.hasFootnotes = false;
    },
  };
}

export type { Footnote, FootnoteRef, Footnotes, Options } from './types.js';
