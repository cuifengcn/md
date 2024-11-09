import type { MarkedExtension, Tokens } from 'marked';
import type { Alert, AlertVariantItem, Options } from './types.ts';
import { createSyntaxPattern, resolveVariants, ucfirst } from './utils.ts';

export type { Alert, AlertVariantItem, Options };

/**
 * A [marked](https://marked.js.org/) extension to support [GFM alerts](https://github.com/orgs/community/discussions/16925).
 */
export default function markedAlert(options: Options = {}): MarkedExtension {
  const { className = `markdown-alert`, variants = [] } = options;
  const resolvedVariants = resolveVariants(variants);

  return {
    walkTokens(token) {
      if (token.type !== `blockquote`) return;

      const matchedVariant = resolvedVariants.find(({ type }) =>
        new RegExp(createSyntaxPattern(type)).test(token.text)
      );

      if (matchedVariant) {
        const {
          type: variantType,
          icon,
          title = ucfirst(variantType),
          titleClassName = `${className}-title`,
        } = matchedVariant;
        const typeRegexp = new RegExp(createSyntaxPattern(variantType));

        Object.assign(token, {
          type: `alert`,
          meta: {
            className,
            variant: variantType,
            icon,
            title,
            titleClassName,
          },
        });

        const firstLine = token.tokens?.[0] as Tokens.Paragraph;
        const firstLineText = firstLine.raw?.replace(typeRegexp, ``).trim();

        if (firstLineText) {
          firstLine.tokens = firstLine.tokens.filter(
            (token) => token.type !== `br`
          );
          const patternToken = firstLine.tokens[0] as Tokens.Text;
          Object.assign(patternToken, {
            raw: patternToken.raw.replace(typeRegexp, ``),
            text: patternToken.text.replace(typeRegexp, ``),
          });
        } else {
          token.tokens?.shift();
        }
      }
    },
    extensions: [
      {
        name: `alert`,
        level: `block`,
        renderer({ meta, tokens = [] }) {
          let tmpl = `<section class="${meta.className} ${meta.className}-${meta.variant}">\n`;
          tmpl += `<section class="${meta.titleClassName}">`;
          tmpl += meta.icon;
          tmpl += `<span>${meta.title}</span>`;
          tmpl += `</section>\n`;
          tmpl += this.parser.parse(tokens);
          tmpl += `</section>\n`;

          return tmpl;
        },
      },
    ],
  };
}
