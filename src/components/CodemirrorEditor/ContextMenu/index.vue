<script setup lang="ts">
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { SelectionToolbar } from '@/components/ui/toolbar';

import { altSign, shiftSign } from '@/config';
import { useAiModelStore, useDisplayStore, useStore } from '@/stores';
import { AiGenerateType } from '@/types';

import {
  insertMDCodeBlock,
  insertMDContainer,
  insertMDLink,
  insertMDMathBlock,
  insertMDQuote,
  insertMDSeparator,
} from '@/utils/insert.ts';

import { Icon } from '@iconify/vue';
import { ElCol } from 'element-plus';

import { storeToRefs } from 'pinia';
import { ref } from 'vue';

const store = useStore();
const displayStore = useDisplayStore();
const aiModelStore = useAiModelStore();
const { isDark } = storeToRefs(store);

const {
  exportEditorContent2HTML,
  exportEditorContent2MD,
  exportEditorContent2PDF,
  formatContent,
  resetStyleConfirm,
} = store;

const { toggleShowInsertFormDialog, toggleShowUploadImgDialog } = displayStore;

// ai dialog参数
const initGenerateType = ref<AiGenerateType>();

function aiGenerate() {
  aiModelStore.toggleShowPromptDialog(true);
}
function toAiRewrite() {
  initGenerateType.value = AiGenerateType.rewrite;
  aiModelStore.toggleShowPromptDialog(true);
  // 延迟两秒
  setTimeout(() => {
    initGenerateType.value = undefined;
  }, 2000);
}
</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger>
      <div id="editor" class="h-full w-full" />
    </ContextMenuTrigger>
    <ContextMenuContent as-child>
      <ElCol class="border-none shadow-none outline-none">
        <SelectionToolbar
          class="context-menu-toolbar z-50 mb-1 shadow-[2px_2px_4px_1px_rgba(0,0,0,0.1)]"
          :class="{
            'shadow-[2px_2px_4px_1px_rgba(255,255,255,0.1)]': isDark,
          }"
          @ai-rewrite="toAiRewrite"
        />
        <ElCol
          class="context-menu w-64 rounded shadow-[2px_2px_4px_1px_rgba(0,0,0,0.1)]"
          :class="{
            'shadow-[2px_2px_4px_1px_rgba(255,255,255,0.1)]': isDark,
          }"
        >
          <ContextMenuItem inset @click="aiGenerate">
            <Icon
              icon="tabler:ai"
              :width="20"
              :height="20"
              class="mr-[4px] self-center rounded bg-green-500/50"
            />
            AI生成
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger value="insert" inset>
              插入
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem inset @click="insertMDLink()">
                链接
                <ContextMenuShortcut class="flex items-center pl-8">
                  <Icon icon="lucide:link-2" class="h-4 w-4" />
                </ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem inset @click="insertMDSeparator()">
                分割线
                <ContextMenuShortcut class="flex items-center pl-8">
                  <Icon icon="radix-icons:divider-horizontal" class="h-4 w-4" />
                </ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem inset @click="insertMDQuote()">
                引用
                <ContextMenuShortcut class="flex items-center pl-8">
                  <Icon icon="radix-icons:quote" class="h-4 w-4" />
                </ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem inset @click="insertMDCodeBlock()">
                代码块
                <ContextMenuShortcut class="flex items-center pl-8">
                  <Icon icon="bx:code-block" class="h-4 w-4" />
                </ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem inset @click="insertMDMathBlock()">
                公式块
                <ContextMenuShortcut class="flex items-center pl-8">
                  <Icon icon="ri:formula" class="h-4 w-4" />
                </ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuSub>
                <ContextMenuSubTrigger value="block" inset>
                  容器块
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuItem inset @click="insertMDContainer('block-1')">
                    容器块1
                    <ContextMenuShortcut class="flex items-center pl-8">
                      <Icon
                        icon="ri:text-block"
                        class="h-4 w-4"
                        color="#3498db"
                      />
                    </ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem inset @click="insertMDContainer('block-2')">
                    容器块2
                    <ContextMenuShortcut class="flex items-center pl-8">
                      <Icon
                        icon="ri:text-block"
                        class="h-4 w-4"
                        color="#e67e22"
                      />
                    </ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem inset @click="insertMDContainer('block-3')">
                    容器块3
                    <ContextMenuShortcut class="flex items-center pl-8">
                      <Icon
                        icon="ri:text-block"
                        class="h-4 w-4"
                        color="#8e44ad"
                      />
                    </ContextMenuShortcut>
                  </ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
              <ContextMenuSeparator />
              <ContextMenuItem inset @click="toggleShowUploadImgDialog()">
                图片
                <ContextMenuShortcut class="flex items-center pl-8">
                  <Icon icon="radix-icons:image" class="h-4 w-4" />
                </ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem inset @click="toggleShowInsertFormDialog()">
                表格
                <ContextMenuShortcut class="flex items-center pl-8">
                  <Icon icon="radix-icons:table" class="h-4 w-4" />
                </ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSub>
            <ContextMenuSubTrigger value="insert" inset>
              导出为
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem inset @click="exportEditorContent2PDF()">
                pdf &nbsp;&nbsp;文件
              </ContextMenuItem>
              <ContextMenuItem inset @click="exportEditorContent2HTML()">
                html&nbsp;网页
              </ContextMenuItem>
              <ContextMenuItem inset @click="exportEditorContent2MD()">
                markdown&nbsp;文件
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuItem inset @click="resetStyleConfirm()">
            恢复默认样式
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem inset @click="formatContent()">
            格式化
            <ContextMenuShortcut>
              {{ altSign }} + {{ shiftSign }} + F
            </ContextMenuShortcut>
          </ContextMenuItem>
        </ElCol>
      </ElCol>
    </ContextMenuContent>
  </ContextMenu>
</template>

<style scoped lang="less"></style>
