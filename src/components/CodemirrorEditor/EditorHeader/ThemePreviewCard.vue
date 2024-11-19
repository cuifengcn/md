<script setup lang="ts">
import type { IConfigOption } from '@/types';
import OUTPUT_DEFAULT from '@/assets/outputDefault.css?raw';
import { useStore } from '@/stores';
import { Uuidv4 } from '@/utils';
import { ElMessage } from 'element-plus';
import juice from 'juice';
import { nextTick, onMounted, reactive, ref } from 'vue';

const props = defineProps<{
  theme: IConfigOption;
}>();
const emit = defineEmits([`click`]);
const className = Uuidv4();

const store = useStore();
const content = ref(``);
const element = `<div class="${className}">
  <h1>
    <span class="prefix"></span>
    <span class="content">一级标题</span>
    <span class="suffix"></span>
  </h1>
  <h2>
    <span class="prefix"></span>
    <span class="content">二级标题</span>
    <span class="suffix"></span>
  </h2>
  <h3>
    <span class="prefix"></span>
    <span class="content">三级标题</span>
    <span class="suffix"></span>
  </h3>
  <hr />
  <blockquote>
    <span>对于为了远大的目的，并非因个人之利而攻击我者，无论用怎样的方法，我全都没齿无怨言。</span>
    <div></div>
    <strong>---鲁迅</strong>
  </blockquote>
  <p>泥土和天才比，当然是不足齿数的，然而不是坚苦卓绝者，也怕不容易做；不过事在人为，比空等天赋的天才有把握。这一点，是泥土的伟大的地方，也是反有大希望的地方。</p>
</div>`;

onMounted(() => {
  const htmlStr = `
    <style>${props.theme.value.replaceAll(`.output`, `.${className}`)}</style>
    <style>${OUTPUT_DEFAULT}</style>
    <style>
    * {
      font-size: 12px;
    }</style>
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
    class="m-auto h-[160px] w-[180px] flex overflow-y-auto px-4"
    v-html="content"
  />
  <el-row align="middle" justify="space-between" class="px-2 pt-2">
    <span class="text-sm font-bold">{{ props.theme.label }}</span>
    <el-button
      :type="store.theme === props.theme.value ? 'primary' : 'default'"
      :disabled="store.theme === props.theme.value"
      @click="emit('click')"
    >
      {{ store.theme === props.theme.value ? '正在使用' : '使用' }}
    </el-button>
  </el-row>
</template>

<style scoped lang="less"></style>
