import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { useAiModelStore } from '@/stores'
import { ElMessage } from 'element-plus'
import { OpenAI } from 'openai'

function checkApiKey(): boolean {
  const aiModelStore = useAiModelStore()
  if (aiModelStore.selectedAiModel.apiKey) {
    return true
  }
  ElMessage.warning(`请先设置API Key`)
  aiModelStore.toggleShowSelectAiModelDialog(true)
  return false
}

function openaiAsk(
  messages: Array<ChatCompletionMessageParam>,
  functions: {
    onStart?: () => void
    onGenerating: (chunk: string) => void
    onEnd?: () => void
    onError?: (error: unknown) => void
  },
) {

  if (!checkApiKey())
    return
  const aiModelStore = useAiModelStore()
  const openai = new OpenAI({
    baseURL: aiModelStore.selectedAiModel.baseUrl,
    apiKey: aiModelStore.selectedAiModel.apiKey,
    dangerouslyAllowBrowser: true,
  })
  const stream = openai.beta.chat.completions.stream({
    model: aiModelStore.selectedAiModel.name,
    messages,
    stream: true,
    max_tokens: aiModelStore.selectedAiModel.maxTokens,
  })
  functions.onStart?.()
  stream.on(`content`, (contentDelta, _) => {
    functions.onGenerating(contentDelta)
  })
  stream.on(`content.done`, (_) => {
    functions.onEnd?.()
  })
  stream.on(`error`, (error) => {
    functions.onError?.(error)
  })
  return stream
}

export { openaiAsk }
export default { openaiAsk }
