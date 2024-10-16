<script setup lang="ts">
import { useStore } from '@/stores'

const store = useStore()

function getReadTime() {
  const minutes = store.editorReadTime?.minutes
  if (minutes) {
    if (minutes < 1) {
      return `${Math.round(minutes * 60)} 秒`
    }
    else {
      // 保留一位小数
      return `${minutes.toFixed(1)} 分钟`
    }
  }
  else {
    return ``
  }
}
</script>

<template>
  <el-row
    class="mx-[20px] h-[20px] gap-[20px] pr-[30px] text-xs"
    align="middle"
    justify="end">
    <div>{{ store.editorReadTime?.words }} 个词</div>
    <div>估计阅读时长 {{ getReadTime() }}</div>
  </el-row>
</template>

<style scoped lang="scss"></style>
