<script setup lang="ts">
import { useStore } from '@/stores';
import { Icon } from '@iconify/vue';
import { storeToRefs } from 'pinia';
import { Toggle } from 'radix-vue';
import { ref } from 'vue';

const store = useStore();
const { isSyncScroll } = storeToRefs(store);

function getReadTime() {
  const minutes = store.editorReadTime?.minutes;
  if (minutes) {
    if (minutes < 1) {
      return `${Math.round(minutes * 60)} 秒`;
    } else {
      // 保留一位小数
      return `${minutes.toFixed(1)} 分钟`;
    }
  } else {
    return ``;
  }
}
</script>

<template>
  <el-row
    class="mx-[20px] h-[20px] gap-[20px] pr-[30px] text-xs"
    align="middle"
    justify="end"
  >
    <div>{{ store.editorReadTime?.words }} 个词</div>
    <div>估计阅读时长 {{ getReadTime() }}</div>
    <el-tooltip
      :content="isSyncScroll ? '同步滚动已开启' : '同步滚动已关闭'"
      placement="top"
    >
      <Toggle
        v-model:pressed="isSyncScroll"
        aria-label="syncScroll"
        class="h-[18px] w-[18px] rounded data-[state=off]:text-gray data-[state=on]:outline-1 data-[state=on]:outline"
      >
        <Icon
          icon="fluent:dual-screen-vertical-scroll-20-regular"
          class="h-[18px] w-[18px]"
        />
      </Toggle>
    </el-tooltip>
  </el-row>
</template>

<style scoped lang="scss"></style>
