<script setup lang="ts">
import type { ChatCompletionStream } from 'openai/lib/ChatCompletionStream';
import ai from '@/ai';
import { getPrompt } from '@/ai/prompts';
import { useAiModelStore, useStore } from '@/stores';
import { AiGenerateType } from '@/types';
import { ElMessage } from 'element-plus';
import { debounce } from 'es-toolkit';
import { storeToRefs } from 'pinia';
import { nextTick, reactive, ref, toRaw, watch } from 'vue';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '../ui/select';

const props = defineProps<{
  generateType?: AiGenerateType;
  immediate?: boolean;
}>();

enum GenerateStatus {
  notStarted = `未开始`,
  generating = `生成中`,
  finished = `已完成`,
  failed = `生成失败`,
}

const store = useStore();
const aiModelStore = useAiModelStore();
const { isShowPromptDialog } = storeToRefs(aiModelStore);

const input = ref<string>(store.editor?.selectedContent || ``);
const request = ref<string>(``);
const generateType = ref<AiGenerateType>(
  props.generateType || AiGenerateType.rewrite
);
const generaterStatus = ref<GenerateStatus>(GenerateStatus.notStarted);
const output = ref(``);
const stream = ref<ChatCompletionStream>();

watch(
  () => props.generateType,
  (val) => {
    generateType.value = val || AiGenerateType.rewrite;
  }
);
watch(isShowPromptDialog, (val) => {
  if (val) {
    // 打开此dialog时，自动触发
    if (
      store.editor?.selectedContent === input.value &&
      input.value &&
      !props.immediate
    ) {
      // 当前选择内容跟之前选择内容一样，就不进行重置了
      return;
    }
    input.value = store.editor?.selectedContent || ``;
    // request.value = ``;
    generateType.value = props.generateType || AiGenerateType.rewrite;
    generaterStatus.value = GenerateStatus.notStarted;
    output.value = ``;
    stream.value = undefined;
    if (props.immediate) {
      nextTick(() => onClick());
    }
  }
});

const requestSuggestions = [
  `以爆款公众号文章的风格`,
  `以幽默风趣的风格`,
  `以通俗易懂的风格`,
];
function handleSelectSuggestion(e: string) {
  request.value = e;
}

function onClick() {
  if (
    ![AiGenerateType.fullArticle, AiGenerateType.generateArticle].includes(
      generateType.value
    ) &&
    !input.value
  ) {
    ElMessage.warning(`请输入要优化的内容`);
    (document.querySelector(`.input-area textarea`) as HTMLElement)?.focus();
    return;
  }
  const onStart = () => {
    generaterStatus.value = GenerateStatus.generating;
    output.value = ``;
  };
  const onGenerating = (text: string) => {
    output.value += text;
    // 自动滚动到最底部
    debounce(() => {
      const area = document.querySelector(
        `.output-area .el-textarea__inner`
      ) as HTMLElement;
      if (area) {
        area.scrollTop = area.scrollHeight;
      }
    }, 100)();
  };
  const onEnd = () => {
    generaterStatus.value = GenerateStatus.finished;
    stream.value = undefined;
  };
  const onError = (error: unknown) => {
    generaterStatus.value = GenerateStatus.failed;
    stream.value = undefined;
    console.error(error);
  };
  const prompt = getPrompt(
    generateType.value,
    generateType.value === AiGenerateType.fullArticle
      ? toRaw(store.editor)!.content
      : input.value!,
    request.value
  );

  ai.openaiAsk(
    [
      {
        role: `user`,
        content: prompt,
      },
    ],
    {
      onStart,
      onGenerating,
      onEnd,
      onError,
    }
  );
}

function continueGenerate() {
  const onStart = () => {
    generaterStatus.value = GenerateStatus.generating;
    output.value += `\n`;
  };
  const onGenerating = (text: string) => {
    output.value += text;
    // 自动滚动到最底部
    debounce(() => {
      const area = document.querySelector(
        `.output-area .el-textarea__inner`
      ) as HTMLElement;
      if (area) {
        area.scrollTop = area.scrollHeight;
      }
    }, 100)();
  };
  const onEnd = () => {
    generaterStatus.value = GenerateStatus.finished;
    stream.value = undefined;
  };
  const onError = (error: unknown) => {
    generaterStatus.value = GenerateStatus.failed;

    stream.value = undefined;
    console.error(error);
  };
  const prompt = getPrompt(
    generateType.value,
    (generateType.value === AiGenerateType.fullArticle
      ? toRaw(store.editor)?.content
      : input.value) ?? ``,
    request.value
  );

  ai.openaiAsk(
    [
      {
        role: `user`,
        content: prompt,
      },
      {
        role: `assistant`,
        content: output.value,
      },
      {
        role: `user`,
        content: `继续生成`,
      },
    ],
    {
      onStart,
      onGenerating,
      onEnd,
      onError,
    }
  );
}

function onAdopt() {
  beforeClose();
  if (
    [AiGenerateType.fullArticle, AiGenerateType.generateArticle].includes(
      generateType.value
    )
  ) {
    if (store.editor) {
      const editor = toRaw(store.editor);
      editor.dispatch(
        editor.state.update({
          changes: [
            {
              from: 0,
              to: store.editor.content.length,
              insert: output.value,
            },
          ],
        })
      );
    }
  } else {
    toRaw(store.editor)?.replaceSelection((_, __, ___) => {
      return {
        newText: output.value,
      };
    }, true);
  }
}

function beforeClose() {
  aiModelStore.toggleShowPromptDialog(false);
  stream.value?.abort();
  stream.value = undefined;
}

function onUpdate(val: boolean) {
  if (!val) {
    if (generaterStatus.value === GenerateStatus.generating) {
      ElMessage.info(`请等待生成完成`);
      return;
    }
    isShowPromptDialog.value = false;
  }
}
</script>

<template>
  <Dialog :open="isShowPromptDialog" @update:open="onUpdate">
    <DialogContent class="overflow-y-auto">
      <DialogHeader>
        <DialogTitle>AI生成</DialogTitle>
      </DialogHeader>

      <el-row
        v-if="
          ![
            AiGenerateType.fullArticle,
            AiGenerateType.generateArticle,
          ].includes(generateType)
        "
      >
        <el-input
          v-model="input"
          type="textarea"
          autofocus
          placeholder="选择或输入您想优化的内容"
          class="input-area"
          :autosize="{ minRows: 2, maxRows: 6 }"
          input-style="background-color: rgba(128,128,128,0.1);"
        />
      </el-row>
      <el-row>
        <el-input
          v-model="request"
          type="textarea"
          placeholder="要求"
          class="input-area flex-1"
          :autosize="{
            minRows: 2,
            maxRows: 10,
          }"
          input-style="background-color: rgba(128,128,128,0.1);"
          autofocus
        />
        <Select @update:model-value="handleSelectSuggestion">
          <SelectTrigger class="ml-2 h-8 w-8 px-1 py-1" />
          <SelectContent>
            <SelectItem
              v-for="value in requestSuggestions"
              :key="value"
              :value="value"
            >
              {{ value }}
            </SelectItem>
          </SelectContent>
        </Select>
      </el-row>
      <el-row justify="space-between">
        <el-radio-group v-model="generateType">
          <el-radio-button
            :label="AiGenerateType.rewrite"
            :value="AiGenerateType.rewrite"
          />
          <el-radio-button
            :label="AiGenerateType.expand"
            :value="AiGenerateType.expand"
          />
          <el-radio-button
            :label="AiGenerateType.fullArticle"
            :value="AiGenerateType.fullArticle"
          />
          <el-radio-button
            :label="AiGenerateType.generateArticle"
            :value="AiGenerateType.generateArticle"
          />
        </el-radio-group>
        <el-button
          type="primary"
          :loading="generaterStatus === GenerateStatus.generating"
          @click="onClick"
        >
          生成
        </el-button>
      </el-row>
      <el-col v-if="generaterStatus !== GenerateStatus.notStarted">
        <el-row class="mb-[1rem]">
          <el-input
            v-model="output"
            class="output-area translate-z-0"
            type="textarea"
            autofocus
            placeholder="生成结果"
            :autosize="{ minRows: 2, maxRows: 15 }"
            :input-style="{}"
          />
        </el-row>
      </el-col>
      <DialogFooter v-if="generaterStatus === GenerateStatus.finished">
        <el-button @click="() => aiModelStore.toggleShowPromptDialog(false)">
          取消
        </el-button>
        <el-button v-if="output" @click="continueGenerate"> 继续 </el-button>
        <el-button type="primary" @click="onAdopt"> 采纳 </el-button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped lang="less"></style>
