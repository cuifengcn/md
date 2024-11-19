<script setup lang="ts">
import type { IConfigOption } from '@/types';
import { useStore } from '@/stores';
import { Uuidv4 } from '@/utils';
import { ElMessage } from 'element-plus';
import juice from 'juice';
import { nextTick, onMounted, reactive, ref } from 'vue';

const props = defineProps<{
  background: IConfigOption;
}>();
const emit = defineEmits([`click`]);
const className = Uuidv4();

const store = useStore();
const content = ref(``);
const element = `<div class="${store.isDark ? `dark` : ``}  w-full h-full"><div class="${className} w-full h-full" /></div>`;

onMounted(() => {
  const htmlStr = `
    <style>${props.background.value.replaceAll(`.output`, `.${className}`)}</style>
    ${element}
    `;
  try {
    content.value = juice(htmlStr, {
      inlinePseudoElements: true,
      preserveImportant: true,
    });
  } catch (err) {
    ElMessage.error(`错误❌: ${err}`);
    content.value = htmlStr;
  }
});
</script>

<template>
  <div
    class="m-auto h-[100px] w-[180px] flex overflow-y-auto"
    :class="{ dark: store.isDark }"
    :style="{ '--md-primary-color': store.primaryColor }"
    v-html="content"
  />
  <el-row align="middle" justify="space-between" class="px-2 pt-2">
    <span class="text-sm font-bold">{{ props.background.label }}</span>
    <el-button
      :type="
        store.background === props.background.value ? 'primary' : 'default'
      "
      :disabled="store.background === props.background.value"
      @click="emit('click')"
    >
      {{ store.background === props.background.value ? '正在使用' : '使用' }}
    </el-button>
  </el-row>
</template>

<style scoped lang="less"></style>
