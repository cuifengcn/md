<script setup lang="ts">
import { PopoverClose, type PopoverCloseProps } from 'radix-vue'

const props = defineProps<PopoverCloseProps>()
</script>

<template>
  <PopoverClose v-bind="props">
    <slot />
  </PopoverClose>
</template>
