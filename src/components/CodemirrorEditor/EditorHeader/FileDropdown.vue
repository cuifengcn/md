<script setup lang="ts">
import { useStore } from '@/stores'
import { Icon } from '@iconify/vue';

import { storeToRefs } from 'pinia'

const store = useStore()

const {
  isDark,
  isEditOnLeft,
} = storeToRefs(store)

const {
  toggleDark,
  toggleEditOnLeft,
  exportEditorContent2HTML,
  exportEditorContent2MD,
  exportEditorContent2PDF,
  importMarkdownContent,
} = store
</script>

<template>
  <MenubarMenu>
    <MenubarTrigger>
      文件
    </MenubarTrigger>
    <MenubarContent align="start">
      <MenubarItem @click="importMarkdownContent()">
        <el-icon class="mr-2 h-4 w-4">
          <ElIconUpload />
        </el-icon>
        导入 .md
      </MenubarItem>
      <MenubarItem @click="exportEditorContent2MD()">
        <el-icon class="mr-2 h-4 w-4">
          <ElIconDownload />
        </el-icon>
        导出 .md
      </MenubarItem>
      <MenubarItem @click="exportEditorContent2HTML()">
        <el-icon class="mr-2 h-4 w-4">
          <ElIconDocument />
        </el-icon>
        导出 .html
      </MenubarItem>
      <MenubarItem @click="exportEditorContent2PDF()">
        <el-icon class="mr-2 h-4 w-4">
          <Icon icon="icon-park-outline:file-pdf" />
        </el-icon>
        导出 .pdf
      </MenubarItem>
      <MenubarSeparator />
      <MenubarItem @click="toggleDark()">
        <el-icon class="mr-2 h-4 w-4" :class="{ 'opacity-0': !isDark }">
          <ElIconCheck />
        </el-icon>
        深色模式
      </MenubarItem>
      <MenubarSeparator />
      <MenubarItem @click="toggleEditOnLeft()">
        <el-icon class="mr-2 h-4 w-4" :class="{ 'opacity-0': !isEditOnLeft }">
          <ElIconCheck />
        </el-icon>
        左侧编辑
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</template>
