<script setup lang="ts">
import type { AiModel } from '@/types'

import { useAiModelStore } from '@/stores'
import { Icon } from '@iconify/vue'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { onMounted, ref, toRaw } from 'vue'
import { Button } from '../ui/button'

const aiStore = useAiModelStore()

const { isShowSelectAiModelDialog, selectedAiModel, models }
  = storeToRefs(aiStore)

const newSelectedModel = ref<string>(toRaw(selectedAiModel.value?.name))

const apiKey = ref(``)
const refererUrl = ref<string>()
onMounted(() => {
  apiKey.value = selectedAiModel.value?.apiKey || ``
  refererUrl.value = selectedAiModel.value?.refUrl || ``
})

function onChange(name: string) {
  refererUrl.value = models.value.find(item => item.name === name)?.refUrl
}

function select() {
  console.log(newSelectedModel.value)

  if (!newSelectedModel.value) {
    ElMessage.error(`请选择模型`)
    return
  }
  if (!apiKey.value) {
    ElMessage.error(`请输入apiKey`)
    return
  }
  aiStore.selectAiModel({
    ...models.value.find(item => item.name === newSelectedModel.value),
    apiKey: apiKey.value,
  } as AiModel)
  aiStore.toggleShowSelectAiModelDialog(false)
}
</script>

<template>
  <el-icon
    class="cursor-pointer rounded-full text-green-500 outline-dashed"
    :size="20"
    @click="() => aiStore.toggleShowSelectAiModelDialog(true)">
    <Icon icon="tabler:ai" :width="30" :height="30" />
  </el-icon>
  <el-dialog
    v-model="isShowSelectAiModelDialog"
    title="选择AI模型"
    style="max-width: 512px; padding-right: 40px">
    <el-row class="mb-4 flex-nowrap" align="middle">
      <span class="mr-4 w-[70px] text-right">模型</span>
      <el-select
        v-model="newSelectedModel"
        placeholder="请选择一种模型"
        class="max-x-[400px]"
        @change="onChange">
        <el-option
          v-for="item in models"
          :key="item.name"
          :label="item.name"
          :value="item.name" />
      </el-select>
    </el-row>
    <el-row class="mb-4 flex-nowrap" align="middle">
      <span class="mr-4 w-[70px] text-right">apiKey</span>
      <el-input v-model="apiKey" placeholder="请输入apiKey" />
    </el-row>
    <el-row v-if="refererUrl" justify="end">
      <span>创建apiKey参考: &nbsp;</span>
      <a :href="refererUrl" target="_blank" class="text-blue-500">
        {{ refererUrl }}
      </a>
    </el-row>

    <template #footer>
      <Button variant="outline" @click="select">
        使用此模型
      </Button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss"></style>
