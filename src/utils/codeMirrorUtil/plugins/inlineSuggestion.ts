import type { EditorState } from '@codemirror/state';
import type { Completion } from 'openai/resources/completions';
import type { Stream } from 'openai/streaming';
import { openaiFim } from '@/ai';
import { useAiModelStore, useStore } from '@/stores';
import { md5, sleep } from '@/utils';
import { EditorView } from '@codemirror/view';
import { inlineSuggestion } from 'codemirror-extension-inline-suggestion';
import { LRUCache } from 'lru-cache';

let suggestionStream:
  | (Stream<Completion> & { _request_id?: string | null | undefined })
  | undefined;
const historyCache = new LRUCache<string, string>({
  max: 10,
});
async function fetchSuggestion(state: EditorState): Promise<string> {
  // 中断上一次
  if (!suggestionStream?.controller.signal.aborted) {
    suggestionStream?.controller.abort();
  }
  // 检查apiKey
  const aiModelStore = useAiModelStore();
  if (!aiModelStore.selectedAiModel.apiKey) {
    return ``;
  }
  // 检查设置
  const store = useStore();
  if (!store.isAiRealtime) {
    return ``;
  }
  // 检查缓存
  suggestionStream = undefined;
  // or make an async API call here based on editor state
  const cursor = state.selection.main.head;
  const content = state.doc.toString().trim();
  // 获取最近的一个段落的文本，如果文本数不够200，加上上一个段落， 如果文本数超过200，截取200
  const prevContent = content
    .substring(Math.max(0, cursor - 200), cursor)
    .trim();
  const suffixContent = content
    .substring(cursor, Math.min(cursor + 200, content.length))
    .trim()
    .split(/\n/)[0];
  console.log(`prompt: ${prevContent}`);

  console.log(` suffix: ${suffixContent}`);

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
  suggestionStream = await openaiFim(
    prevContent,
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
    },
    suffixContent
  );
  // eslint-disable-next-line no-unmodified-loop-condition
  while (waiting && timeout > 0) {
    timeout -= 100;
    await sleep(100);
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
        if (!suggestionStream.controller.signal.aborted) {
          const tmp = suggestionStream;
          suggestionStream = undefined;
          tmp.controller.abort();
        }
        suggestionStream = undefined;
      }
    }),
  ];
}
