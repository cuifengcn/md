<script setup lang="ts">
import type { Article } from '@/types';
import { useStore } from '@/stores';
import { Setting } from '@element-plus/icons-vue';
import { storeToRefs } from 'pinia';
import { type PropType, ref } from 'vue';
import DropdownMenuRoot from '../ui/dropdown-menu/DropdownMenu.vue';
import DropdownMenuContent from '../ui/dropdown-menu/DropdownMenuContent.vue';
import DropdownMenuItem from '../ui/dropdown-menu/DropdownMenuItem.vue';
import DropdownMenuTrigger from '../ui/dropdown-menu/DropdownMenuTrigger.vue';

const props = defineProps({
  article: {
    type: Object as PropType<Article>,
  },
});

const store = useStore();
const { currentArticle, primaryColor } = storeToRefs(store);

const setting = ref(false);

function toggleSetting(event: Event) {
  event.stopPropagation();
  setting.value = !setting.value;
}

function selectArticle() {
  if (props.article?.id) {
    store.selectArticle(props.article.id);
  }
}

function deleteArticle() {
  if (props.article?.id) {
    store.removeArticle(props.article.id);
  }
}

function backgroundColor() {
  return currentArticle.value?.id === props.article?.id
    ? primaryColor.value
    : ``;
}
function textColor() {
  return currentArticle.value?.id === props.article?.id ? `#fff` : ``;
}
</script>

<template>
  <div
    :style="{
      'background-color': backgroundColor(),
    }"
    class="cursor-pointer border-b bg-gray-100/10 p-[6px]"
    @click="selectArticle"
  >
    <el-row justify="space-between" class="flex-nowrap py-1">
      <div :style="{ color: textColor() }" class="cursor-pointer text-sm">
        {{ props.article?.title ?? '未命名' }}
      </div>
      <DropdownMenuRoot v-model:open="setting">
        <DropdownMenuTrigger>
          <el-icon
            :style="{ color: textColor() }"
            class="cursor-pointer"
            @click="toggleSetting"
          >
            <Setting />
          </el-icon>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <div
              class="w-full cursor-pointer text-red-500"
              @click="deleteArticle"
            >
              删除文章
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuRoot>
    </el-row>
    <el-row>
      <span
        :style="{ color: textColor() }"
        class="overflow-hidden text-ellipsis whitespace-nowrap text-xs text-gray-500"
      >
        {{
          props.article?.createTs
            ? new Date(props.article.createTs).toLocaleString()
            : ''
        }}
      </span>
    </el-row>
  </div>
</template>

<style scoped lang="scss"></style>
