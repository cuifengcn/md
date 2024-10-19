import type { EditorState } from '@codemirror/state';
import type { ChatCompletionStream } from 'openai/lib/ChatCompletionStream';
import { openaiAsk } from '@/ai';
import { md5 } from '@/utils';
import { EditorView } from '@codemirror/view';
import { inlineSuggestion } from 'codemirror-extension-inline-suggestion';
import { LRUCache } from 'lru-cache';

let suggestionStream: ChatCompletionStream | undefined;
const historyCache = new LRUCache<string, string>({
  max: 10,
});
async function fetchSuggestion(state: EditorState): Promise<string> {
  if (!suggestionStream?.aborted) {
    suggestionStream?.abort();
  }
  suggestionStream = undefined;
  // or make an async API call here based on editor state
  const cursor = state.selection.main.head;
  const content = state.doc.toString().trim();
  // 获取最近的一个段落的文本，如果文本数不够200，加上上一个段落， 如果文本数超过200，截取200
  const prevContent = content
    .substring(Math.max(0, cursor - 200), cursor)
    .trim();
  console.log(prevContent);

  const key = md5(prevContent);
  if (historyCache.has(key)) {
    return historyCache.get(key)!;
  }

  if (prevContent.length < 2) {
    return ``;
  }

  let res = ``;
  let waiting = true;
  let timeout = 20000;
  suggestionStream = await openaiAsk(
    [
      {
        role: `user`,
        content: `请根据以下marrkdown格式的文本,在下面文本的基础上进行续写,符合当前内容的延续,尽量不超过100字,且只返回续写的内容。

${prevContent}
`,
      },
    ],
    {
      onGenerating: (chunk) => {
        res += chunk;
      },
      onEnd: () => {
        historyCache.set(key, res);
        waiting = false;
      },
      onError: (error) => {
        console.error(error);
        waiting = false;
      },
    }
  );
  // eslint-disable-next-line no-unmodified-loop-condition
  while (waiting && timeout > 0) {
    timeout -= 100;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return res;
}

export function InlineSuggestion() {
  return [
    inlineSuggestion({
      fetchFn: fetchSuggestion,
      delay: 1500,
    }),
    EditorView.updateListener.of((update) => {
      if (update.selectionSet && suggestionStream) {
        if (!suggestionStream.aborted) {
          suggestionStream.abort();
        }
        suggestionStream = undefined;
      }
    }),
  ];
}
