<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Menubar } from '@/components/ui/menubar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  codeBlockThemeOptions,
  colorOptions,
  fontFamilyOptions,
  fontSizeOptions,
  legendOptions,
  themeOptions,
} from '@/config';
import { useDisplayStore, useStore } from '@/stores';
import { mergeCss, solveWeChatImage } from '@/utils';
import { ElNotification } from 'element-plus';
import { Moon, Paintbrush, Sun } from 'lucide-vue-next';

import { storeToRefs } from 'pinia';
import { nextTick, toRaw } from 'vue';
import EditDropdown from './EditDropdown.vue';
import FileDropdown from './FileDropdown.vue';
import FormatDropdown from './FormatDropdown.vue';
import HelpDropdown from './HelpDropdown.vue';

import PostInfo from './PostInfo.vue';
import StyleDropdown from './StyleDropdown.vue';

const emit = defineEmits([
  `addFormat`,
  `formatContent`,
  `startCopy`,
  `endCopy`,
]);

const store = useStore();

const { isDark } = storeToRefs(store);

const { toggleDark, editorRefresh } = store;

const themeIcons = [Sun, Moon];
function toggleTheme() {
  store.toggleDark();
}

// 复制到微信公众号
function copy() {
  emit(`startCopy`);
  setTimeout(() => {
    // function modifyHtmlStructure(htmlString: string) {
    //   // 创建一个 div 元素来暂存原始 HTML 字符串
    //   const tempDiv = document.createElement(`div`);
    //   tempDiv.innerHTML = htmlString;

    //   const originalItems = tempDiv.querySelectorAll(`li > ul, li > ol`);

    //   originalItems.forEach((originalItem) => {
    //     originalItem.parentElement!.insertAdjacentElement(
    //       `afterend`,
    //       originalItem
    //     );
    //   });

    //   // 返回修改后的 HTML 字符串
    //   return tempDiv.innerHTML;
    // }

    // 如果是深色模式，复制之前需要先切换到白天模式
    const isBeforeDark = isDark.value;
    if (isBeforeDark) {
      toggleDark();
    }

    nextTick(async () => {
      solveWeChatImage();

      const content = await store.output2Html();
      const blob = new Blob([content], { type: `text/html` });
      const clipboardItem = new ClipboardItem({ 'text/html': blob });
      navigator.clipboard.write([clipboardItem]);

      if (isBeforeDark) {
        nextTick(() => toggleDark());
      }

      // 输出提示
      ElNotification({
        showClose: true,
        message: `已复制渲染后的文章到剪贴板，可直接到公众号后台粘贴`,
        offset: 80,
        duration: 1600,
        type: `success`,
      });

      editorRefresh();
      emit(`endCopy`);
    });
  }, 350);
}

</script>

<template>
  <header class="header-container h-15 flex items-center px-5">
    <Menubar class="menubar mr-auto">
      <FileDropdown />

      <FormatDropdown
        @add-format="(cmd: string | number) => emit('addFormat', cmd)"
        @format-content="() => emit('formatContent')"
      />
      <EditDropdown />
      <StyleDropdown />
      <HelpDropdown />
    </Menubar>

    <Button variant="outline" class="mx-2" @click="toggleTheme">
      <Transition name="slide-fade" mode="out-in">
        <component :is="themeIcons[!isDark ? 0 : 1]" class="h-4 w-4" />
      </Transition>
    </Button>
    <Button variant="outline" class="mx-2" @click="copy"> 复制 </Button>

    <PostInfo />
  </header>
</template>

<style lang="less" scoped>
.menubar {
  user-select: none;
}

kbd {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #a8a8a8;
  padding: 1px 4px;
  border-radius: 2px;
}
</style>
