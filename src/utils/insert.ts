import { useStore } from '@/stores';
import { toRaw } from 'vue';

// 插入链接
export function insertMDLink() {
  const store = useStore();
  toRaw(store.editor)?.replaceSelection((text, from, _) => {
    text ||= `链接`;
    return {
      newText: `[${text}](https://)`,
      from,
      to: from + text.length + 12,
    };
  }, true);
}

// 插入分割线
export function insertMDSeparator() {
  const store = useStore();
  toRaw(store.editor)?.replaceSelection((_, from, to) => {
    const content = toRaw(store.editor)!.content;
    let nexText = `\n---\n`;
    if (from - 1 >= 0 && content[from - 1] !== `\n`) {
      nexText = `\n${nexText}`;
    }
    if (to < content.length && content[to] !== `\n`) {
      nexText = `${nexText}\n`;
    }
    return {
      newText: nexText,
    };
  }, true);
}

// 插入引用
export function insertMDQuote() {
  const store = useStore();
  toRaw(store.editor)?.replaceSelection((text, from, _) => {
    text ||= `请输入内容`;
    return {
      newText: `\n> ${text}\n`,
      from,
      to: from + text.length + 4,
    };
  }, true);
}

// 插入代码块
export function insertMDCodeBlock() {
  const store = useStore();
  toRaw(store.editor)?.replaceSelection((text, from, _) => {
    text ||= `请输入代码`;
    return {
      newText: `\n\`\`\`\n${text}\n\`\`\`\n`,
      from,
      to: from + text.length + 10,
    };
  }, true);
}

// 插入公式块
export function insertMDMathBlock() {
  const store = useStore();
  toRaw(store.editor)?.replaceSelection((text, from, _) => {
    text ||= `1+1=2`;
    return {
      newText: `\n$$\n${text}\n$$\n`,
      from,
      to: from + text.length + 8,
    };
  }, true);
}

// 插入容器块
export function insertMDContainer(type: string = `block-1`) {
  const store = useStore();
  toRaw(store.editor)?.replaceSelection((text, from, _) => {
    text ||= `请输入内容`;
    return {
      newText: `\n:::${type}\n${text}\n:::\n`,
      from,
      to: from + text.length + 17,
    };
  }, true);
}
