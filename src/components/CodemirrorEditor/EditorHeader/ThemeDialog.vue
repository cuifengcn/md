<script setup lang="ts">
import type { IConfigOption } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MenubarMenu, MenubarTrigger } from '@/components/ui/menubar';
import { backgroundList, codeBlockThemeOptions, colorOptions } from '@/config';
import { useDisplayStore, useStore } from '@/stores';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import BackgroundPreviewCard from './BackgroundPreviewCard.vue';
import ThemePreviewCard from './ThemePreviewCard.vue';

const store = useStore();
const displayStore = useDisplayStore();

const { toggleShowThemeDialog } = displayStore;
const { isShowThemeDialog } = storeToRefs(displayStore);
function onUpdate(val: boolean) {
  if (!val) {
    toggleShowThemeDialog(false);
  }
}
</script>

<template>
  <MenubarMenu>
    <div class="menu-button" @click="() => (isShowThemeDialog = true)">
      主题
    </div>
  </MenubarMenu>

  <Dialog :open="isShowThemeDialog" @update:open="onUpdate">
    <DialogContent class="min-w-[70%]">
      <DialogHeader class="hidden">
        <DialogTitle>主题设置</DialogTitle>
      </DialogHeader>
      <div
        class="flex flex-col gap-2"
        style="text-rendering: optimizeLegibility"
      >
        <p class="text-lg">主题</p>
        <div class="flex flex-wrap gap-4">
          <el-card
            v-for="(item, index) in store.defaultCssThemes"
            :key="index"
            body-style="padding: 6px;"
          >
            <ThemePreviewCard
              :theme="item"
              @click="store.themeChanged(item.value)"
            />
          </el-card>
        </div>
        <p class="text-lg">主题色</p>
        <div class="flex flex-wrap items-center gap-4">
          <Button
            v-for="{ label, value } in colorOptions"
            :key="value"
            variant="outline"
            :class="{
              'border-black dark:border-white': store.primaryColor === value,
            }"
            @click="store.colorChanged(value)"
          >
            <span
              class="mr-2 inline-block h-4 w-4 rounded-full"
              :style="{
                background: value,
              }"
            />
            {{ label }}
          </Button>
          <ElColorPicker
            v-model="store.primaryColor"
            :teleported="false"
            show-alpha
            class="mr-auto"
            style="height: 2em"
          />
        </div>
        <p class="text-lg">背景</p>
        <div class="flex flex-wrap gap-4">
          <el-card
            v-for="(item, index) in backgroundList"
            :key="index"
            body-style="padding: 6px;"
          >
            <BackgroundPreviewCard
              :background="item"
              @click="store.backgroundChanged(item.value)"
            />
          </el-card>
        </div>
        <p class="text-lg">代码块主题</p>
        <Select
          v-model="store.codeBlockTheme"
          @update:model-value="store.codeBlockThemeChanged"
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a code theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="{ label, value } in codeBlockThemeOptions"
              :key="label"
              :value="value"
            >
              {{ label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </DialogContent>
  </Dialog>
</template>
