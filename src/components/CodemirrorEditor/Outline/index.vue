<script setup lang="ts">
import { useStore } from '@/stores';
import { Icon } from '@iconify/vue';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

const store = useStore();
const { editorOutline } = storeToRefs(store);

function scrollToHeading(id: string) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: `smooth` });
  }
}
</script>

<template>
  <el-popover
    :width="200"
    placement="left"
    popper-class="max-h-full overflow-y-auto overflow-x-hidden"
  >
    <template #reference>
      <el-icon class="cursor-pointer" :size="26">
        <Icon icon="cuida:menu-outline" :width="20" :height="20" />
      </el-icon>
    </template>

    <template #default>
      <h4>目录大纲</h4>
      <ul>
        <li
          v-for="item in editorOutline"
          :key="item.id"
          class="mb-1 text-[12px] hover:underline"
          :style="{ 'padding-left': `${item.level * 20}px` }"
        >
          <a :href="`#${item.id}`" @click.prevent="scrollToHeading(item.id)">
            {{ item.title }}
          </a>
        </li>
      </ul>
    </template>
  </el-popover>
</template>

<style scoped lang="less"></style>
