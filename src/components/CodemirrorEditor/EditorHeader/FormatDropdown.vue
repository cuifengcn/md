<script setup lang="ts">
import { altSign, ctrlKey, ctrlSign, shiftSign } from '@/config'
import { useStore } from '@/stores'

import { storeToRefs } from 'pinia'

const emit = defineEmits([`addFormat`, `formatContent`])

const formatItems = [
  {
    label: `加粗`,
    kbd: [ctrlSign, `b`],
    emitArgs: [`addFormat`, `${ctrlKey}-b`],
  },
  {
    label: `斜体`,
    kbd: [ctrlSign, `i`],
    emitArgs: [`addFormat`, `${ctrlKey}-i`],
  },
  {
    label: `删除线`,
    kbd: [ctrlSign, `d`],
    emitArgs: [`addFormat`, `${ctrlKey}-d`],
  },
  {
    label: `超链接`,
    kbd: [ctrlSign, `k`],
    emitArgs: [`addFormat`, `${ctrlKey}-k`],
  },
  {
    label: `行内代码`,
    kbd: [ctrlSign, `e`],
    emitArgs: [`addFormat`, `${ctrlKey}-e`],
  },
  {
    label: `格式化`,
    kbd: [altSign, shiftSign, `f`],
    emitArgs: [`formatContent`],
  },
] as const

const store = useStore()

const { isCiteStatus } = storeToRefs(store)

const { citeStatusChanged } = store
</script>

<template>
  <MenubarMenu>
    <MenubarTrigger> 格式 </MenubarTrigger>
    <MenubarContent class="w-60" align="start">
      <MenubarItem
        v-for="{ label, kbd, emitArgs } in formatItems"
        :key="label"
        @click="emitArgs[0] === 'addFormat' ? emit(emitArgs[0], emitArgs[1]) : emit(emitArgs[0])">
        <el-icon class="mr-2 h-4 w-4" />
        {{ label }}
        <MenubarShortcut>
          <kbd v-for="item in kbd" :key="item" class="mx-1 bg-gray-2 dark:bg-stone-9">
            {{ item }}
          </kbd>
        </MenubarShortcut>
      </MenubarItem>
      <MenubarSeparator />
      <MenubarItem @click="citeStatusChanged()">
        <el-icon class="mr-2 h-4 w-4" :class="{ 'opacity-0': !isCiteStatus }">
          <ElIconCheck />
        </el-icon>
        微信外链转底部引用
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</template>
