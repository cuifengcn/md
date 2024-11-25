<script setup lang="ts">
import Outline from '@/components/CodemirrorEditor/Outline/index.vue';
import PcMode from './PcMode.vue';
import SelectAiModel from './SelectAiModel.vue';
</script>

<template>
  <div class="absolute right-[8px] top-[70px] flex flex-col gap-4">
    <Outline />
    <SelectAiModel />
    <PcMode />
  </div>
</template>

<style scoped lang="scss"></style>
