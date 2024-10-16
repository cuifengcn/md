<script setup lang="ts">
import { useStore } from '@/stores'
import { Icon } from '@iconify/vue'
import {
  Toggle,
  ToolbarButton,
  ToolbarRoot,
  ToolbarSeparator,
} from 'radix-vue'
import { ref } from 'vue'

const emit = defineEmits([`aiRewrite`])

const store = useStore()
const { editor } = store

const bold = ref<boolean>(editor?.selecteBold || false)
const italic = ref<boolean>(editor?.selecteItalic || false)
const del = ref<boolean>(editor?.selecteDel || false)
const inlineCode = ref<boolean>(editor?.selecteInlineCode || false)
</script>

<template>
  <ToolbarRoot
    class="max-w-[610px] w-full flex rounded p-[10px] !min-w-max"
    aria-label="Formatting options">
    <Toggle
      v-model:pressed="bold"
      class="toolbar-toggle-item"
      aria-label="Bold"
      @click="editor!.toggleSelecteBold">
      <Icon icon="radix-icons:font-bold" class="h-[15px] w-[15px]" />
    </Toggle>
    <Toggle
      v-model:pressed="italic"
      class="toolbar-toggle-item"
      aria-label="Italic"
      @click="editor?.toggleSelecteItalic">
      <Icon icon="radix-icons:font-italic" class="h-[15px] w-[15px]" />
    </Toggle>
    <Toggle
      v-model:pressed="del"
      class="toolbar-toggle-item"
      aria-label="Strikethrough"
      @click="editor?.toggleSelecteDel">
      <Icon icon="radix-icons:strikethrough" class="h-[15px] w-[15px]" />
    </Toggle>
    <Toggle
      v-model:pressed="inlineCode"
      class="toolbar-toggle-item"
      aria-label="InlineCode"
      @click="editor?.toggleSelecteInlineCode">
      <Icon icon="radix-icons:code" class="h-[15px] w-[15px]" />
    </Toggle>
    <ToolbarSeparator class="mx-[10px] w-[1px] bg-gray-400/50" />
    <Icon
      icon="tabler:ai"
      :width="20"
      :height="20"
      class="mr-[4px] self-center rounded text-green-500" />
    <ToolbarButton
      class="toolbar-toggle-item text-[12px]"
      @click="() => emit(`aiRewrite`)">
      优化
    </ToolbarButton>
  </ToolbarRoot>
</template>

<style scoped lang="less"></style>
