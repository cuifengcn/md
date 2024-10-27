import type { ReadTimeResults } from 'reading-time';
import { EditorView } from '@codemirror/view';
import readingTime from 'reading-time';

class MyEditorView extends EditorView {
  replaceSelection(
    replacer: (
      text: string,
      from: number,
      to: number
    ) => { newText: string; from?: number; to?: number },
    insertOnEmpty = false
  ) {
    const main = this.state.selection.main;
    if (main.empty) {
      if (insertOnEmpty) {
        // 从当前光标位置插入
        const cursor = main.head;
        this.dispatch(
          this.state.replaceSelection(replacer(``, cursor, cursor).newText)
        );
        this.focus();
      }
      return;
    }
    const selectedText = this.state.doc.sliceString(main.from, main.to);
    const replacerResult = replacer(selectedText, main.from, main.to);
    this.dispatch(this.state.replaceSelection(replacerResult.newText));
    this.dispatch({
      selection: {
        anchor: replacerResult.from || main.from,
        head: replacerResult.to || main.from + replacerResult.newText.length,
      },
      scrollIntoView: true,
    });
    this.focus();
  }

  get content() {
    return this.state.doc.toString();
  }

  get selectedContent() {
    const main = this.state.selection.main;
    return this.state.doc.sliceString(main.from, main.to).trim();
  }

  get selecteBold() {
    const content = this.selectedContent;
    return (
      content.length >= 4 && content.startsWith(`**`) && content.endsWith(`**`)
    );
  }

  toggleSelecteBold = () => {
    if (this.selecteBold) {
      this.replaceSelection((text, from, to) => {
        return {
          newText: text.slice(2, -2),
          from,
          to: to - 4,
        };
      });
    } else {
      this.replaceSelection((text, from, to) => {
        return {
          newText: `**${text}**`,
          from,
          to: to + 4,
        };
      });
    }
  };

  get selecteItalic() {
    const content = this.selectedContent;
    if (
      content.length >= 6 &&
      content.startsWith(`***`) &&
      content.endsWith(`***`)
    ) {
      return true;
    }
    if (
      content.length >= 4 &&
      content.startsWith(`**`) &&
      content.endsWith(`**`)
    ) {
      return false;
    }
    if (
      content.length >= 2 &&
      content.startsWith(`*`) &&
      content.endsWith(`*`)
    ) {
      return true;
    }
    return false;
  }

  toggleSelecteItalic = () => {
    if (this.selecteItalic) {
      this.replaceSelection((text, from, to) => {
        return {
          newText: text.slice(1, -1),
          from,
          to: to - 2,
        };
      });
    } else {
      this.replaceSelection((text, from, to) => {
        return {
          newText: `*${text}*`,
          from,
          to: to + 2,
        };
      });
    }
  };

  get selecteDel() {
    const content = this.selectedContent;
    return (
      content.length >= 2 && content.startsWith(`~`) && content.endsWith(`~`)
    );
  }

  toggleSelecteDel = () => {
    if (this.selecteDel) {
      this.replaceSelection((text, from, to) => {
        return {
          newText: text.slice(1, -1),
          from,
          to: to - 2,
        };
      });
    } else {
      this.replaceSelection((text, from, to) => {
        return {
          newText: `~${text}~`,
          from,
          to: to + 2,
        };
      });
    }
  };

  get selecteLink() {
    const content = this.selectedContent;
    // 超链接的格式为 [xxx](xxx), 结合正则进行判断
    return /^\[.*\]\(.*\)$/.test(content);
  }

  toggleSelecteLink = () => {
    if (this.selecteLink) {
      // 如果已经是超链接了，就只保留其链接地址
      this.replaceSelection((text, from, _) => {
        const url = text.slice(text.indexOf(`(`), text.lastIndexOf(`)`));
        if (!url) {
          // 如果url为空，就使用[xxx]中的文本
          const desc = text.slice(text.indexOf(`[`), text.lastIndexOf(`]`));
          return {
            newText: desc,
            from,
            to: from + desc.length,
          };
        }
        return {
          newText: url,
          from,
          to: from + url.length,
        };
      });
    } else {
      this.replaceSelection((text, from, to) => {
        return {
          newText: `[${text}]()`,
          from,
          to: to + 4,
        };
      });
    }
  };

  get selecteInlineCode() {
    const content = this.selectedContent;
    return (
      content.length >= 2 && content.startsWith(`\``) && content.endsWith(`\``)
    );
  }

  toggleSelecteInlineCode = () => {
    if (this.selecteInlineCode) {
      this.replaceSelection((text, from, to) => {
        return {
          newText: text.slice(1, -1),
          from,
          to: to - 2,
        };
      });
    } else {
      this.replaceSelection((text, from, to) => {
        return {
          newText: `\`${text}\``,
          from,
          to: to + 2,
        };
      });
    }
  };

  readTime(): ReadTimeResults {
    return readingTime(this.content);
  }
}

export { MyEditorView };
export default MyEditorView;
