<script setup lang="ts">
import { useDisplayStore } from '@/stores';
import { Icon } from '@iconify/vue';
import { storeToRefs } from 'pinia';
import { reactive, ref } from 'vue';

const displayStore = useDisplayStore();
const { isPCMode } = storeToRefs(displayStore);
</script>

<template>
  <el-tooltip :content="isPCMode ? 'PC视图' : '手机视图'" placement="left">
    <el-icon
      class="cursor-pointer text-gray-500"
      :size="26"
      @click="displayStore.togglePCMode()"
    >
      <Icon
        :icon="isPCMode ? 'flowbite:desktop-pc-solid' : 'bx:mobile'"
        :width="30"
        :height="30"
      />
    </el-icon>
  </el-tooltip>
</template>

<style scoped lang="less"></style>
