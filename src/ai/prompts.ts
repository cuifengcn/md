import { AiGenerateType } from '@/types';

export function reWritePrompt(text: string, require?: string) {
  require = require ? `\n### 要求\n${require}\n\n` : `\n`;

  return `
  你是一名专业的写手，请将下面的文字进行优化。
  ${require}
  ### 原始文本
  ${text}
  
  条理清晰, 以Markdown格式输出, 只给出优化后的文本即可
  `;
}

export function expandPrompt(text: string, require?: string) {
  require = require ? `\n### 要求\n${require}\n\n` : `\n`;

  return `
  你是一名专业的写手，请将下面的文字进行扩写。
  ${require}
  ### 原始文本
  ${text}
  
  条理清晰, 以Markdown格式输出, 只给出优化后的文本即可
  `;
}

export function fullArticlePrompt(text: string, require?: string) {
  require = require ? `\n### 要求\n${require}\n\n` : `\n`;

  return `
  你是一名专业的写手，请将下面的文字进行优化。
  ${require}
  ### 原始文本
  ${text}

  条理清晰, 以Markdown格式输出, 只给出优化后的文本即可
  `;
}

export function generateArticlePrompt(text: string, require?: string) {
  require = require
    ? `生成一篇markdown格式的文章, 满足如下要求\n${require}\n\n`
    : `生成一篇markdown格式的文章\n`;
  return require || ``;
}

export function getPrompt(
  type: AiGenerateType,
  text: string,
  require?: string
): string {
  switch (type) {
    case AiGenerateType.expand:
      return expandPrompt(text, require);
    case AiGenerateType.rewrite:
      return reWritePrompt(text, require);
    case AiGenerateType.fullArticle:
      return fullArticlePrompt(text, require);
    case AiGenerateType.generateArticle:
      return generateArticlePrompt(text, require);
    default:
      return ``;
  }
}
