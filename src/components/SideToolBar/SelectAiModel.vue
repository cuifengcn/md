<script setup lang="ts">
import type { AiModel } from '@/types';

import { useAiModelStore } from '@/stores';
import { Icon } from '@iconify/vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { storeToRefs } from 'pinia';
import { h, onMounted, ref, toRaw } from 'vue';
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

const { isShowSelectAiModelDialog, selectedAiModel, models } =
  storeToRefs(aiStore);

const newSelectedModel = ref<string>(toRaw(selectedAiModel.value?.name));

const apiKey = ref<string>();
const baseUrl = ref<string>();
onMounted(() => {
  apiKey.value = selectedAiModel.value?.apiKey;
  baseUrl.value = selectedAiModel.value?.baseUrl;
});

function onChange(name: string) {
  baseUrl.value = models.value.find((item) => item.name === name)?.baseUrl;
}

function select() {
  if (!newSelectedModel.value) {
    ElMessage.error(`请选择模型`);
    return;
  }
  if (!apiKey.value) {
    ElMessage.error(`请输入apiKey`);
    return;
  }
  if (!baseUrl.value) {
    ElMessage.error(`请输入baseUrl`);
    return;
  }
  aiStore.selectAiModel({
    ...models.value.find((item) => item.name === newSelectedModel.value),
    apiKey: apiKey.value,
    baseUrl: baseUrl.value,
  } as AiModel);
  aiStore.toggleShowSelectAiModelDialog(false);
}
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
        <span class="mr-4 w-[70px] text-right">模型</span>
        <Select v-model="newSelectedModel" @update:model-value="onChange">
          <SelectTrigger>
            <SelectValue placeholder="Select a fruit..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="item in models"
              :key="item.name"
              :label="item.name"
              :value="item.name"
            >
              {{ item.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </el-row>
      <el-row class="flex-nowrap" align="middle">
        <span class="mr-4 w-[70px] text-right">apiKey</span>
        <el-input v-model="apiKey" placeholder="请输入apiKey" size="large" />
      </el-row>
      <el-row class="flex-nowrap" align="middle">
        <span class="mr-4 w-[70px] text-right">baseUrl</span>
        <el-input v-model="baseUrl" placeholder="请输入baseUrl" size="large" />
      </el-row>
      <el-row align="end">
        <el-link @click="() => (showHelp = !showHelp)"> 查看帮助 </el-link>
      </el-row>
      <el-card v-if="showHelp" class="flex flex-col gap-2 text-sm">
        在创建apiKey后才可使用ai服务,创建地址如下
        <div class="flex gap-2">
          智谱清言:
          <el-link
            href="https://bigmodel.cn/usercenter/apikeys"
            target="_blank"
          >
            https://bigmodel.cn/usercenter/apikeys
          </el-link>
        </div>
        <div class="flex gap-2">
          DeepSeek:
          <el-link
            href="https://platform.deepseek.com/api_keys"
            target="_blank"
          >
            https://platform.deepseek.com/api_keys
          </el-link>
        </div>
        <div class="flex gap-2">
          openai:
          <el-link href="https://platform.openai.com/api-keys" target="_blank">
            https://platform.openai.com/api-keys
          </el-link>
        </div>
      </el-card>

      <DialogFooter>
        <Button variant="outline" @click="select"> 使用此模型 </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped lang="scss"></style>
