<script setup lang="ts">
import PcMode from './PcMode.vue';
import SelectAiModel from './SelectAiModel.vue';
</script>

<template>
  <div class="absolute right-[8px] top-[70px] flex flex-col gap-4">
    <SelectAiModel />
    <PcMode />
  </div>
</template>

<style scoped lang="scss"></style>
