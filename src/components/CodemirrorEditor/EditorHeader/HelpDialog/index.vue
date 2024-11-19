<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useStore } from '@/stores';
import { ElMessage } from 'element-plus';
import juice from 'juice';
import { marked } from 'marked';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: ``,
  },
  content: {
    type: Array<string>,
    default: [],
  },
});

const emit = defineEmits([`close`]);

const store = useStore();
function copy(text: string) {
  navigator.clipboard.writeText(text);
  ElMessage({
    message: `已复制`,
    type: `success`,
  });
}
function toHTML(item: string) {
  const htmlStr = `<style>${store.theme}</style><div>${marked.parse(item)}</div>`;
  try {
    return juice(htmlStr, {
      inlinePseudoElements: true,
      preserveImportant: true,
    });
  } catch (err) {
    ElMessage.error(`错误❌: ${err}`);
    return htmlStr;
  }
}

function onUpdate(val: boolean) {
  if (!val) {
    emit(`close`);
  }
}
</script>

<template>
  <Dialog :open="props.visible" @update:open="onUpdate">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ props.title }}</DialogTitle>
      </DialogHeader>
      <el-row v-for="(item, index) in props.content" :key="index" class="">
        <el-col :span="12" class="bg-gray-100/5 p-5 shadow">
          <pre class="h-full w-full overflow-auto text-sm">
              {{ item }}
            </pre
          >

          <el-button
            class="absolute left-0 top-0"
            size="small"
            @click="copy(item)"
          >
            复制
          </el-button>
        </el-col>
        <el-col :span="12" class="p-5 shadow">
          <div
            class="h-full w-full overflow-auto p-2 text-sm"
            v-html="toHTML(item)"
          />
        </el-col>
      </el-row>
    </DialogContent>
  </Dialog>
</template>

<style scoped lang="less"></style>
