<script setup lang="ts">
import type { AiModel } from '@/types';

import { useAiModelStore } from '@/stores';
import { Icon } from '@iconify/vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { storeToRefs } from 'pinia';
import { h, onMounted, ref, toRaw, watch } from 'vue';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select';

const aiStore = useAiModelStore();

const { isShowSelectAiModelDialog, selectedAiModel } = storeToRefs(aiStore);

const defaultParams: AiModel = {
  name: `deepseek大模型(深度求索)`,
  modelName: `deepseek-chat`,
  baseUrl: `https://api.deepseek.com`,
  maxTokens: 80,
};
const modelParams = ref<AiModel>({ ...selectedAiModel.value });

watch(isShowSelectAiModelDialog, (val) => {
  if (val) {
    modelParams.value = { ...selectedAiModel.value };
  }
});

function reset() {
  modelParams.value = { ...defaultParams };
}
function save() {
  aiStore.selectAiModel(modelParams.value);
  aiStore.toggleShowSelectAiModelDialog(false);
}
const showAdvanced = ref(false);
const showHelp = ref(false);
function onUpdate(val: boolean) {
  if (!val) {
    isShowSelectAiModelDialog.value = false;
    showHelp.value = false;
  }
}
</script>

<template>
  <el-tooltip content="选择AI模型" placement="left">
    <el-icon
      class="cursor-pointer text-green-500"
      :size="26"
      @click="() => aiStore.toggleShowSelectAiModelDialog(true)"
    >
      <Icon icon="catppuccin:adobe-ai" :width="30" :height="30" />
    </el-icon>
  </el-tooltip>

  <Dialog :open="isShowSelectAiModelDialog" @update:open="onUpdate">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>选择AI模型</DialogTitle>
      </DialogHeader>
      <el-row class="flex-nowrap" align="middle">
        <span class="mr-4 w-[80px] text-right text-sm">模型名称</span>
        <el-input
          v-model="modelParams.modelName"
          placeholder="请输入模型名称"
          size="large"
        />
      </el-row>
      <el-row class="flex-nowrap" align="middle">
        <span class="mr-4 w-[80px] text-right text-sm">apiKey</span>
        <el-input
          v-model="modelParams.apiKey"
          placeholder="请输入apiKey"
          size="large"
          autofocus
        />
      </el-row>
      <el-row class="flex-nowrap" align="middle">
        <span class="mr-4 w-[80px] text-right text-sm">baseUrl</span>
        <el-input
          v-model="modelParams.baseUrl"
          placeholder="请输入baseUrl"
          size="large"
        />
      </el-row>
      <el-row align="end">
        <el-link @click="() => (showAdvanced = !showAdvanced)">
          高级设置
        </el-link>
      </el-row>
      <template v-if="showAdvanced">
        <el-row class="flex-nowrap" align="middle">
          <span class="mr-4 w-[80px] text-right text-sm">temp</span>
          <el-input
            v-model="modelParams.temperature"
            placeholder="请输入temperature"
            size="large"
          />
        </el-row>
        <el-row class="flex-nowrap" align="middle">
          <span class="mr-4 w-[80px] text-right text-sm">maxToken</span>
          <el-input
            v-model="modelParams.maxTokens"
            placeholder="请输入maxTokens"
            size="large"
          />
        </el-row>
      </template>
      <el-row align="end">
        <el-link @click="() => (showHelp = !showHelp)"> 帮助 </el-link>
      </el-row>
      <el-card v-if="showHelp" class="flex flex-col gap-2 text-sm">
        推荐使用DeepSeek大模型, apiKey创建地址如下
        <div class="flex gap-2">
          DeepSeek:
          <el-link
            href="https://platform.deepseek.com/api_keys"
            target="_blank"
          >
            https://platform.deepseek.com/api_keys
          </el-link>
        </div>
      </el-card>

      <DialogFooter>
        <Button variant="secondary" @click="reset"> 恢复默认 </Button>
        <Button variant="outline" @click="save"> 保存 </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped lang="scss"></style>
