import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { useAiModelStore } from '@/stores';
import { ElMessage } from 'element-plus';
import { OpenAI } from 'openai';

function checkApiKey(): boolean {
  const aiModelStore = useAiModelStore();
  if (aiModelStore.selectedAiModel.apiKey) {
    return true;
  }
  ElMessage.warning(`请先添加AI模型`);
  aiModelStore.toggleShowSelectAiModelDialog(true);
  return false;
}

function openaiAsk(
  messages: Array<ChatCompletionMessageParam>,
  functions: {
    onStart?: () => void;
    onGenerating: (chunk: string) => void;
    onEnd?: () => void;
    onError?: (error: unknown) => void;
  }
) {
  if (!checkApiKey()) return;
  const aiModelStore = useAiModelStore();
  const openai = new OpenAI({
    baseURL: aiModelStore.selectedAiModel.baseUrl,
    apiKey: aiModelStore.selectedAiModel.apiKey,
    dangerouslyAllowBrowser: true,
  });
  const stream = openai.beta.chat.completions.stream({
    model: aiModelStore.selectedAiModel.modelName,
    messages,
    stream: true,
    temperature: aiModelStore.selectedAiModel.temperature,
    max_tokens: aiModelStore.selectedAiModel.maxTokens,
  });
  functions.onStart?.();
  stream.on(`content`, (contentDelta, _) => {
    functions.onGenerating(contentDelta);
  });
  stream.on(`content.done`, (_) => {
    functions.onEnd?.();
  });
  stream.on(`error`, (error) => {
    ElMessage.error(`ai生成: ${error}`);
    functions.onError?.(error);
  });
  return stream;
}
async function openaiFim(
  prompt: string,
  functions: {
    onStart?: () => void;
    onGenerating: (chunk: string) => void;
    onEnd?: () => void;
    onError?: (error: unknown) => void;
  },
  suffix?: string
) {
  if (!checkApiKey()) return;
  const aiModelStore = useAiModelStore();
  const openai = new OpenAI({
    baseURL: `${aiModelStore.selectedAiModel.baseUrl}/beta`,
    apiKey: aiModelStore.selectedAiModel.apiKey,
    dangerouslyAllowBrowser: true,
  });

  const stream = await openai.completions.create({
    model: aiModelStore.selectedAiModel.modelName,
    prompt,
    suffix,
    stream: true,
    temperature: aiModelStore.selectedAiModel.temperature,
    max_tokens: aiModelStore.selectedAiModel.maxTokens,
  });
  stream.controller.signal.addEventListener(`abort`, () => {});
  const getData = async () => {
    functions.onStart?.();
    try {
      for await (const chunk of stream) {
        functions.onGenerating(chunk.choices[0].text);
      }
      functions.onEnd?.();
    } catch (error) {
      ElMessage.warning(`ai Fim生成: ${error}`);
      functions.onError?.(error);
    }
  };
  getData();

  return stream;
}

export { openaiAsk, openaiFim };
export default { openaiAsk };
